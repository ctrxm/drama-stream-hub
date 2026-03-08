import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchDramaDetail, fetchDramaEpisodes, fetchDramaFromList, Drama, Episode } from "@/lib/api";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Play, Layers, Building2, AlertCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

const DramaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentEpIndex, setCurrentEpIndex] = useState<number | null>(null);
  const [episodePage, setEpisodePage] = useState(1);
  const [showAllDesc, setShowAllDesc] = useState(false);

  const passedDrama = (location.state as { drama?: Drama })?.drama;

  const { data: detailData, isLoading: loadingDetail } = useQuery({
    queryKey: ["drama-detail", id],
    queryFn: () => fetchDramaDetail(Number(id)),
    enabled: !!id,
  });

  const { data: episodesData, isLoading: loadingEpisodes } = useQuery({
    queryKey: ["drama-episodes", id, episodePage],
    queryFn: () => fetchDramaEpisodes(Number(id), { page: episodePage, per_page: 100, status: "published" }),
    enabled: !!id,
  });

  const { data: fallbackDrama, isLoading: loadingFallback } = useQuery({
    queryKey: ["drama-fallback", id],
    queryFn: () => fetchDramaFromList(Number(id)),
    enabled: !!id && !detailData && !passedDrama && !loadingDetail,
  });

  const drama: Drama | undefined = detailData?.data?.drama || passedDrama || fallbackDrama || undefined;
  const tags = detailData?.data?.tags || [];
  const detailEpisodes = detailData?.data?.episodes?.filter((e) => e.status === "published") || [];
  const separateEpisodes = episodesData?.data || [];
  const episodes = detailEpisodes.length > 0 ? detailEpisodes : separateEpisodes;
  const isLoading = loadingDetail && !passedDrama && loadingFallback;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 container mx-auto px-4">
          <div className="flex gap-4 animate-pulse">
            <Skeleton className="w-32 sm:w-44 aspect-[2/3] rounded-xl" />
            <div className="flex-1 space-y-3 pt-2">
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded" />
              <Skeleton className="h-4 w-1/3 rounded" />
              <Skeleton className="h-10 w-32 rounded-xl mt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!drama) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center gap-4 px-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center text-sm">Drama tidak ditemukan atau server sedang bermasalah.</p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {currentEpIndex !== null && episodes.length > 0 && (
        <VideoPlayer
          episodes={episodes}
          currentIndex={currentEpIndex}
          dramaTitle={drama.title}
          onClose={() => setCurrentEpIndex(null)}
          onEpisodeChange={setCurrentEpIndex}
        />
      )}

      {/* Backdrop blur cover */}
      <div className="pt-14 relative">
        <div className="absolute top-14 left-0 right-0 h-[260px] overflow-hidden">
          <img src={drama.cover_url} alt="" className="w-full h-full object-cover scale-110 blur-2xl opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
        </div>

        <div className="relative container mx-auto px-4 pt-6 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Kembali
          </button>

          <div className="flex gap-4 sm:gap-6">
            <div className="w-28 sm:w-40 flex-shrink-0">
              <img
                src={drama.cover_url}
                alt={drama.title}
                className="w-full rounded-xl shadow-2xl shadow-background/80 border border-border/20"
              />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-2 leading-tight line-clamp-3">
                {drama.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> {drama.chapter_count} Episode
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> {drama.provider_name}
                </span>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2.5 py-0.5 bg-secondary border border-border/20 text-secondary-foreground text-[10px] rounded-lg font-medium"
                    >
                      {tag.en_name || tag.name}
                    </span>
                  ))}
                </div>
              )}

              {episodes.length > 0 && (
                <button
                  onClick={() => setCurrentEpIndex(0)}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                  <Play className="w-4 h-4" /> Tonton Sekarang
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="container mx-auto px-4 py-4">
        <div className="glass rounded-xl border border-border/20 p-4">
          <p className={`text-sm text-muted-foreground leading-relaxed ${!showAllDesc ? "line-clamp-3" : ""}`}>
            {drama.introduction || "Tidak ada deskripsi."}
          </p>
          {drama.introduction && drama.introduction.length > 150 && (
            <button
              onClick={() => setShowAllDesc(!showAllDesc)}
              className="mt-2 text-xs text-primary font-medium flex items-center gap-1 hover:text-primary/80 transition-colors"
            >
              {showAllDesc ? "Sembunyikan" : "Selengkapnya"}
              <ChevronDown className={`w-3 h-3 transition-transform ${showAllDesc ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Episodes */}
      {episodes.length > 0 ? (
        <div className="container mx-auto px-4 pb-20">
          <div className="flex items-center gap-2.5 mb-4 mt-2">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-primary" />
            </div>
            <h2 className="text-base font-display font-bold text-foreground tracking-tight">
              Episode <span className="text-muted-foreground font-normal">({episodes.length})</span>
            </h2>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {episodes.map((ep, idx) => (
              <button
                key={ep.id}
                onClick={() => setCurrentEpIndex(idx)}
                className={`py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentEpIndex === idx
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105 active:scale-95"
                }`}
              >
                {ep.episode_index}
              </button>
            ))}
          </div>
        </div>
      ) : !loadingEpisodes ? (
        <div className="container mx-auto px-4 pb-20">
          <div className="p-8 rounded-xl glass border border-border/20 text-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Episode belum tersedia. Server mungkin sedang dalam perbaikan.
            </p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 pb-20">
          <Skeleton className="h-8 w-48 mb-4 rounded-lg" />
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DramaDetail;
