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
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [episodePage, setEpisodePage] = useState(1);

  // Drama passed via navigation state from the card
  const passedDrama = (location.state as { drama?: Drama })?.drama;

  // Try detail endpoint
  const { data: detailData, isLoading: loadingDetail } = useQuery({
    queryKey: ["drama-detail", id],
    queryFn: () => fetchDramaDetail(Number(id)),
    enabled: !!id,
  });

  // Try episodes endpoint separately
  const { data: episodesData, isLoading: loadingEpisodes } = useQuery({
    queryKey: ["drama-episodes", id, episodePage],
    queryFn: () => fetchDramaEpisodes(Number(id), { page: episodePage, per_page: 100, status: "published" }),
    enabled: !!id,
  });

  // Fallback: fetch from list if detail fails and no passed drama
  const { data: fallbackDrama, isLoading: loadingFallback } = useQuery({
    queryKey: ["drama-fallback", id],
    queryFn: () => fetchDramaFromList(Number(id)),
    enabled: !!id && !detailData && !passedDrama && !loadingDetail,
  });

  // Resolve drama data from best available source
  const drama: Drama | undefined = detailData?.data?.drama || passedDrama || fallbackDrama || undefined;
  const tags = detailData?.data?.tags || [];
  const detailEpisodes = detailData?.data?.episodes?.filter((e) => e.status === "published") || [];
  const separateEpisodes = episodesData?.data || [];
  const episodes = detailEpisodes.length > 0 ? detailEpisodes : separateEpisodes;

  const isLoading = loadingDetail && !passedDrama && loadingFallback;

  const handlePlayEpisode = (episode: Episode) => {
    setSelectedEpisode(episode);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

      <div className="pt-16">
        {/* Video Player */}
        {selectedEpisode && (
          <VideoPlayer episode={selectedEpisode} dramaTitle={drama.title} />
        )}

        {/* Drama Info */}
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-48 flex-shrink-0">
              <img
                src={drama.cover_url}
                alt={drama.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
                {drama.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Layers className="w-4 h-4" /> {drama.chapter_count} Episode
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {drama.provider_name}
                </span>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2.5 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                    >
                      {tag.en_name || tag.name}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                {drama.introduction || "Tidak ada deskripsi."}
              </p>

              {!selectedEpisode && episodes.length > 0 && (
                <button
                  onClick={() => handlePlayEpisode(episodes[0])}
                  className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <Play className="w-4 h-4" /> Tonton Sekarang
                </button>
              )}
            </div>
          </div>

          {/* Episodes */}
          {episodes.length > 0 ? (
            <div className="mt-10">
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Daftar Episode ({episodes.length})
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {episodes.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => handlePlayEpisode(ep)}
                    className={`py-2 px-1 rounded-md text-sm font-medium transition-colors ${
                      selectedEpisode?.id === ep.id
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
            <div className="mt-10 p-6 rounded-lg bg-muted/50 text-center">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Episode belum tersedia saat ini. Server mungkin sedang dalam perbaikan.
              </p>
            </div>
          ) : (
            <div className="mt-10">
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {Array.from({ length: 20 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-md" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DramaDetail;
