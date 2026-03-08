import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchDramaDetail, Episode } from "@/lib/api";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Play, Clock, Layers } from "lucide-react";
import { useState } from "react";

const DramaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["drama", id],
    queryFn: () => fetchDramaDetail(Number(id)),
    enabled: !!id,
  });

  const drama = data?.data?.drama;
  const tags = data?.data?.tags || [];
  const episodes = (data?.data?.episodes || []).filter((e) => e.status === "published");

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Drama tidak ditemukan</p>
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
                      {tag.en_name}
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

          {/* Episodes List */}
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
        </div>
      </div>
    </div>
  );
};

export default DramaDetail;
