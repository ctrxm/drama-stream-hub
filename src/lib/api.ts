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
  const res = await fetch(`${BASE_URL}/api/dramas?${searchParams}`);
  return res.json();
}

export async function fetchPopularDramas(params?: {
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<Drama[]>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));
  const res = await fetch(`${BASE_URL}/api/dramas/popular?${searchParams}`);
  return res.json();
}

export async function fetchDramaDetail(id: number): Promise<{ data: DramaDetail }> {
  const res = await fetch(`${BASE_URL}/api/dramas/${id}`);
  return res.json();
}

export async function fetchTags(): Promise<{ data: Tag[] }> {
  const res = await fetch(`${BASE_URL}/api/tags`);
  return res.json();
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
  const res = await fetch(`${BASE_URL}/api/search?${searchParams}`);
  return res.json();
}
