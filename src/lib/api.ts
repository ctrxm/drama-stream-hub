const BASE_URL = "https://api-short.stor.co.id";

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
    const res = await fetch(url, { headers });
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
  const res = await fetch(`${BASE_URL}/api/dramas?${searchParams}`, { headers });
  return res.json();
}

export async function fetchPopularDramas(params?: {
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<Drama[]>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));
  const res = await fetch(`${BASE_URL}/api/dramas/popular?${searchParams}`, { headers });
  return res.json();
}

export async function fetchDramaDetail(id: number): Promise<{ data: DramaDetail } | null> {
  return safeFetch(`${BASE_URL}/api/dramas/${id}`);
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
  return safeFetch(`${BASE_URL}/api/dramas/${id}/episodes?${searchParams}`);
}

// Fallback: find drama from list endpoint by ID
export async function fetchDramaFromList(id: number): Promise<Drama | null> {
  // Try searching through recent dramas
  const res = await safeFetch<PaginatedResponse<Drama[]>>(`${BASE_URL}/api/dramas?per_page=100`);
  if (res?.data) {
    const found = res.data.find((d) => d.id === id);
    if (found) return found;
  }
  // Try popular
  const pop = await safeFetch<PaginatedResponse<Drama[]>>(`${BASE_URL}/api/dramas/popular?per_page=100`);
  if (pop?.data) {
    const found = pop.data.find((d) => d.id === id);
    if (found) return found;
  }
  return null;
}

export async function fetchTags(): Promise<{ data: Tag[] }> {
  const res = await fetch(`${BASE_URL}/api/tags`, { headers });
  return res.json();
}

export interface Provider {
  id: number;
  name: string;
  slug: string;
  drama_count: number;
  logo_url?: string;
}

export async function fetchProviders(): Promise<{ data: Provider[] }> {
  const res = await safeFetch<{ data: Provider[] }>(`${BASE_URL}/api/providers`);
  if (res) return res;
  // Fallback: extract unique providers from dramas list
  const dramas = await safeFetch<PaginatedResponse<Drama[]>>(`${BASE_URL}/api/dramas?per_page=100`);
  if (dramas?.data) {
    const map = new Map<string, Provider>();
    dramas.data.forEach((d) => {
      if (!map.has(d.provider_slug)) {
        map.set(d.provider_slug, {
          id: d.provider_id,
          name: d.provider_name,
          slug: d.provider_slug,
          drama_count: 0,
        });
      }
      const p = map.get(d.provider_slug)!;
      p.drama_count++;
    });
    return { data: Array.from(map.values()) };
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
  const res = await fetch(`${BASE_URL}/api/search?${searchParams}`, { headers });
  return res.json();
}
