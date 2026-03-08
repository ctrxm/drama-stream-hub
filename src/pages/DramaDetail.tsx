import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchDramaDetail, fetchDramaEpisodes, fetchDramaFromList, Drama, Episode } from "@/lib/api";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Play, Clock, Layers, AlertCircle } from "lucide-react";
import { useState } from "react";

const DramaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentEpIndex, setCurrentEpIndex] = useState<number | null>(null);
  const [episodePage, setEpisodePage] = useState(1);

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

  const handlePlayEpisode = (index: number) => {
    setCurrentEpIndex(index);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 container mx-auto px-4">
          <Skeleton className="w-full h-[400px] rounded-lg" />
        </div>
      </div>
    );
  }

  if (!drama) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center gap-4 px-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground text-center">Drama tidak ditemukan atau server sedang bermasalah.</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
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

      {/* TikTok-style fullscreen player */}
      {currentEpIndex !== null && episodes.length > 0 && (
        <VideoPlayer
          episodes={episodes}
          currentIndex={currentEpIndex}
          dramaTitle={drama.title}
          onClose={() => setCurrentEpIndex(null)}
          onEpisodeChange={setCurrentEpIndex}
        />
      )}

      <div className="pt-16">
        {/* Drama Info */}
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>

          <div className="flex gap-4">
            <div className="w-28 sm:w-40 flex-shrink-0">
              <img
                src={drama.cover_url}
                alt={drama.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-1 line-clamp-2">
                {drama.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> {drama.chapter_count} Ep
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {drama.provider_name}
                </span>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 bg-secondary text-secondary-foreground text-[10px] rounded-full"
                    >
                      {tag.en_name || tag.name}
                    </span>
                  ))}
                </div>
              )}

              {episodes.length > 0 && (
                <button
                  onClick={() => handlePlayEpisode(0)}
                  className="mt-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <Play className="w-4 h-4" /> Tonton
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mt-4 line-clamp-3">
            {drama.introduction || "Tidak ada deskripsi."}
          </p>
        </div>

        {/* Episodes grid */}
        {episodes.length > 0 ? (
          <div className="container mx-auto px-4 pb-16">
            <h2 className="text-base font-display font-semibold text-foreground mb-3">
              Episode ({episodes.length})
            </h2>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
              {episodes.map((ep, idx) => (
                <button
                  key={ep.id}
                  onClick={() => handlePlayEpisode(idx)}
                  className={`py-2 rounded-md text-sm font-medium transition-colors ${
                    currentEpIndex === idx
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {ep.episode_index}
                </button>
              ))}
            </div>
          </div>
        ) : !loadingEpisodes ? (
          <div className="container mx-auto px-4 pb-16">
            <div className="p-6 rounded-lg bg-muted/50 text-center">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Episode belum tersedia. Server mungkin sedang dalam perbaikan.
              </p>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 pb-16">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-md" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DramaDetail;
