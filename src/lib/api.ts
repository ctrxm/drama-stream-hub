import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://api-short.stor.co.id";

// ─── API Key Management ───
interface ApiKeyConfig {
  keys: { key: string; label: string; active: boolean }[];
  rotation_mode: "round_robin" | "fallback";
}

export interface ApiKeyStats {
  key: string;
  label: string;
  active: boolean;
  requests: number;
  errors: number;
  lastUsed: number | null;
  lastError: string | null;
  disabled: boolean; // auto-disabled by failover
}

let apiKeyConfig: ApiKeyConfig | null = null;
let apiKeyIndex = 0;
let apiKeyLastFetch = 0;
const API_KEY_REFRESH_INTERVAL = 5 * 60 * 1000;

const FALLBACK_KEY = "sk_live_f9ee48172e0fbd1dfac36f9f69db9933092cc3c02400bd37";

// Per-key stats tracking (in-memory, resets on reload)
const keyStats = new Map<string, ApiKeyStats>();

export function getApiKeyStats(): ApiKeyStats[] {
  return Array.from(keyStats.values());
}

function ensureStats(key: string, label: string, active: boolean): ApiKeyStats {
  if (!keyStats.has(key)) {
    keyStats.set(key, { key, label, active, requests: 0, errors: 0, lastUsed: null, lastError: null, disabled: false });
  }
  const s = keyStats.get(key)!;
  s.label = label;
  s.active = active;
  return s;
}

function recordRequest(key: string) {
  const s = keyStats.get(key);
  if (s) { s.requests++; s.lastUsed = Date.now(); }
}

function recordError(key: string, status: number) {
  const s = keyStats.get(key);
  if (s) {
    s.errors++;
    s.lastError = `HTTP ${status} at ${new Date().toLocaleTimeString()}`;
    if (status === 401 || status === 403) {
      s.disabled = true;
    }
  }
}

async function loadApiKeys(): Promise<void> {
  if (apiKeyConfig && Date.now() - apiKeyLastFetch < API_KEY_REFRESH_INTERVAL) return;
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "api_keys")
      .single();
    if (data?.value) {
      apiKeyConfig = data.value as unknown as ApiKeyConfig;
      apiKeyLastFetch = Date.now();
      // Init stats for all keys
      for (const k of apiKeyConfig.keys) {
        ensureStats(k.key, k.label, k.active);
      }
    }
  } catch {
    // Use fallback
  }
}

function getAvailableKeys(): { key: string; label: string }[] {
  if (!apiKeyConfig || apiKeyConfig.keys.length === 0) return [{ key: FALLBACK_KEY, label: "Fallback" }];
  const available = apiKeyConfig.keys.filter((k) => {
    const stats = keyStats.get(k.key);
    return k.active && !(stats?.disabled);
  });
  if (available.length === 0) {
    // All disabled? Re-enable all and try again
    for (const k of apiKeyConfig.keys.filter((k) => k.active)) {
      const s = keyStats.get(k.key);
      if (s) s.disabled = false;
    }
    const retry = apiKeyConfig.keys.filter((k) => k.active);
    return retry.length > 0 ? retry : [{ key: FALLBACK_KEY, label: "Fallback" }];
  }
  return available;
}

function getNextApiKey(): string {
  const available = getAvailableKeys();
  if (apiKeyConfig?.rotation_mode === "round_robin") {
    const entry = available[apiKeyIndex % available.length];
    apiKeyIndex = (apiKeyIndex + 1) % available.length;
    return entry.key;
  }
  return available[0].key;
}

// ─── In-memory cache ───
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 5 * 60 * 1000;
const CACHE_TTL_TAGS = 30 * 60 * 1000;
const CACHE_TTL_PROVIDERS = 30 * 60 * 1000;

function getCached<T>(key: string, ttl: number): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < ttl) return entry.data as T;
  if (entry) cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ─── Rate limiter ───
const requestTimestamps: number[] = [];
const RATE_LIMIT = 50;
const RATE_WINDOW = 60_000;

async function rateLimitedFetch(url: string, init?: RequestInit): Promise<Response> {
  const now = Date.now();
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > RATE_WINDOW) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= RATE_LIMIT) {
    const waitTime = RATE_WINDOW - (now - requestTimestamps[0]) + 100;
    await new Promise((r) => setTimeout(r, waitTime));
  }
  requestTimestamps.push(Date.now());
  return fetch(url, init);
}

// ─── Fetch with failover ───
async function fetchWithFailover(url: string): Promise<Response> {
  await loadApiKeys();
  const available = getAvailableKeys();
  const maxAttempts = Math.min(available.length, 3);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const apiKey = getNextApiKey();
    recordRequest(apiKey);
    try {
      const res = await rateLimitedFetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.status === 401 || res.status === 403) {
        recordError(apiKey, res.status);
        console.warn(`API key ${keyStats.get(apiKey)?.label || 'unknown'} failed with ${res.status}, switching...`);
        continue;
      }
      if (!res.ok) {
        recordError(apiKey, res.status);
      }
      return res;
    } catch (err) {
      recordError(apiKey, 0);
      if (attempt === maxAttempts - 1) throw err;
    }
  }
  // Should not reach here, but fallback
  return rateLimitedFetch(url, {
    headers: { Authorization: `Bearer ${FALLBACK_KEY}` },
  });
}

async function safeFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetchWithFailover(url);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchDramas(params?: {
  page?: number;
  per_page?: number;
  provider?: string;
  tag?: string;
  sort_by?: string;
  sort_order?: string;
}): Promise<PaginatedResponse<Drama[]>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));
  if (params?.provider) searchParams.set("provider", params.provider);
  if (params?.tag) searchParams.set("tag", params.tag);
  if (params?.sort_by) searchParams.set("sort_by", params.sort_by);
  if (params?.sort_order) searchParams.set("sort_order", params.sort_order);

  const cacheKey = `dramas:${searchParams.toString()}`;
  const cached = getCached<PaginatedResponse<Drama[]>>(cacheKey, CACHE_TTL);
  if (cached) return cached;

  const res = await fetchWithFailover(`${BASE_URL}/api/dramas?${searchParams}`);
  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}

export async function fetchPopularDramas(params?: {
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<Drama[]>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));

  const cacheKey = `popular:${searchParams.toString()}`;
  const cached = getCached<PaginatedResponse<Drama[]>>(cacheKey, CACHE_TTL);
  if (cached) return cached;

  const res = await fetchWithFailover(`${BASE_URL}/api/dramas/popular?${searchParams}`);
  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}

export async function fetchDramaDetail(id: number): Promise<{ data: DramaDetail } | null> {
  const cacheKey = `detail:${id}`;
  const cached = getCached<{ data: DramaDetail }>(cacheKey, CACHE_TTL);
  if (cached) return cached;

  const data = await safeFetch<{ data: DramaDetail }>(`${BASE_URL}/api/dramas/${id}`);
  if (data) setCache(cacheKey, data);
  return data;
}

export async function fetchDramaEpisodes(id: number, params?: {
  page?: number;
  per_page?: number;
  status?: string;
}): Promise<PaginatedResponse<Episode[]> | null> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));
  if (params?.status) searchParams.set("status", params.status);

  const cacheKey = `episodes:${id}:${searchParams.toString()}`;
  const cached = getCached<PaginatedResponse<Episode[]>>(cacheKey, CACHE_TTL);
  if (cached) return cached;

  const data = await safeFetch<PaginatedResponse<Episode[]>>(`${BASE_URL}/api/dramas/${id}/episodes?${searchParams}`);
  if (data) setCache(cacheKey, data);
  return data;
}

export async function fetchDramaFromList(id: number): Promise<Drama | null> {
  const cacheKey = `drama-single:${id}`;
  const cached = getCached<Drama>(cacheKey, CACHE_TTL);
  if (cached) return cached;

  const res = await safeFetch<PaginatedResponse<Drama[]>>(`${BASE_URL}/api/dramas?per_page=100`);
  if (res?.data) {
    const found = res.data.find((d) => d.id === id);
    if (found) { setCache(cacheKey, found); return found; }
  }
  const pop = await safeFetch<PaginatedResponse<Drama[]>>(`${BASE_URL}/api/dramas/popular?per_page=100`);
  if (pop?.data) {
    const found = pop.data.find((d) => d.id === id);
    if (found) { setCache(cacheKey, found); return found; }
  }
  return null;
}

export async function fetchTags(): Promise<{ data: Tag[] }> {
  const cacheKey = "tags";
  const cached = getCached<{ data: Tag[] }>(cacheKey, CACHE_TTL_TAGS);
  if (cached) return cached;

  const headers = await getHeaders();
  const res = await rateLimitedFetch(`${BASE_URL}/api/tags`, { headers });
  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}

export interface Provider {
  id: number;
  name: string;
  slug: string;
  drama_count: number;
  logo_url?: string;
}

export async function fetchProviders(): Promise<{ data: Provider[] }> {
  const cacheKey = "providers";
  const cached = getCached<{ data: Provider[] }>(cacheKey, CACHE_TTL_PROVIDERS);
  if (cached) return cached;

  const res = await safeFetch<{ data: Provider[] }>(`${BASE_URL}/api/providers`);
  if (res) { setCache(cacheKey, res); return res; }

  const dramas = await safeFetch<PaginatedResponse<Drama[]>>(`${BASE_URL}/api/dramas?per_page=100`);
  if (dramas?.data) {
    const map = new Map<string, Provider>();
    dramas.data.forEach((d) => {
      if (!map.has(d.provider_slug)) {
        map.set(d.provider_slug, { id: d.provider_id, name: d.provider_name, slug: d.provider_slug, drama_count: 0 });
      }
      map.get(d.provider_slug)!.drama_count++;
    });
    const result = { data: Array.from(map.values()) };
    setCache(cacheKey, result);
    return result;
  }
  return { data: [] };
}

export async function searchDramas(params: {
  q: string;
  page?: number;
  per_page?: number;
  tag?: string;
}): Promise<PaginatedResponse<Drama[]>> {
  const searchParams = new URLSearchParams();
  searchParams.set("q", params.q);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.per_page) searchParams.set("per_page", String(params.per_page));
  if (params.tag) searchParams.set("tag", params.tag);

  const cacheKey = `search:${searchParams.toString()}`;
  const cached = getCached<PaginatedResponse<Drama[]>>(cacheKey, CACHE_TTL);
  if (cached) return cached;

  const headers = await getHeaders();
  const res = await rateLimitedFetch(`${BASE_URL}/api/search?${searchParams}`, { headers });
  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}
