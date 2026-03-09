import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://api-short.stor.co.id";

// ─── API Key Management ───
interface ApiKeyConfig {
  keys: { key: string; label: string; active: boolean }[];
  rotation_mode: "round_robin" | "fallback";
}

let apiKeyConfig: ApiKeyConfig | null = null;
let apiKeyIndex = 0;
let apiKeyLastFetch = 0;
const API_KEY_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 min

// Fallback key if DB is unavailable
const FALLBACK_KEY = "sk_live_f9ee48172e0fbd1dfac36f9f69db9933092cc3c02400bd37";

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
    }
  } catch {
    // Use fallback
  }
}

function getNextApiKey(): string {
  if (!apiKeyConfig || apiKeyConfig.keys.length === 0) return FALLBACK_KEY;
  const activeKeys = apiKeyConfig.keys.filter((k) => k.active);
  if (activeKeys.length === 0) return FALLBACK_KEY;

  if (apiKeyConfig.rotation_mode === "round_robin") {
    const key = activeKeys[apiKeyIndex % activeKeys.length];
    apiKeyIndex = (apiKeyIndex + 1) % activeKeys.length;
    return key.key;
  }
  // fallback mode: try first active key
  return activeKeys[0].key;
}

async function getHeaders(): Promise<HeadersInit> {
  await loadApiKeys();
  return { Authorization: `Bearer ${getNextApiKey()}` };
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

// ─── Types ───
export interface Drama {
  id: number;
  provider_id: number;
  external_id: string;
  title: string;
  cover_url: string;
  introduction: string;
  chapter_count: number;
  play_count: number;
  shelf_time: string;
  is_dubbed: boolean;
  created_at: string;
  updated_at: string;
  provider_slug: string;
  provider_name: string;
}

export interface Episode {
  id: number;
  drama_id: number;
  external_id: string;
  episode_index: number;
  episode_name: string;
  video_url: string;
  subtitle_url: string;
  subtitles: { lang: string; url: string }[];
  qualities: Record<string, string>;
  status: string;
  released_at: string;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  en_name: string;
  drama_count: number;
}

export interface PaginatedResponse<T> {
  data: T;
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface DramaDetail {
  drama: Drama;
  tags: Tag[];
  episodes: Episode[];
}

async function safeFetch<T>(url: string): Promise<T | null> {
  try {
    const headers = await getHeaders();
    const res = await rateLimitedFetch(url, { headers });
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

  const headers = await getHeaders();
  const res = await rateLimitedFetch(`${BASE_URL}/api/dramas?${searchParams}`, { headers });
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

  const headers = await getHeaders();
  const res = await rateLimitedFetch(`${BASE_URL}/api/dramas/popular?${searchParams}`, { headers });
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
