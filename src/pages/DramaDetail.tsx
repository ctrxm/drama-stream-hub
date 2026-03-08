import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchDramaDetail, fetchDramaEpisodes, fetchDramaFromList, Drama, Episode } from "@/lib/api";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Play, Layers, Building2, AlertCircle, ChevronDown, Crown, Lock } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

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
          <div className="flex gap-4">
            <div className="w-32 sm:w-44 aspect-[2/3] rounded-xl shimmer-loading" />
            <div className="flex-1 space-y-3 pt-2">
              <div className="h-6 w-3/4 rounded-lg shimmer-loading" />
              <div className="h-4 w-1/2 rounded shimmer-loading" />
              <div className="h-4 w-1/3 rounded shimmer-loading" />
              <div className="h-10 w-32 rounded-xl mt-4 shimmer-loading" />
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
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center"
          >
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </motion.div>
          <p className="text-muted-foreground text-center text-sm">Drama tidak ditemukan atau server sedang bermasalah.</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Kembali ke Beranda
          </motion.button>
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
        <div className="absolute top-14 left-0 right-0 h-[280px] overflow-hidden">
          <img src={drama.cover_url} alt="" className="w-full h-full object-cover scale-110 blur-2xl opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
          {/* Animated accent orbs */}
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary/8 blur-3xl orb" />
          <div className="absolute bottom-0 right-20 w-24 h-24 rounded-full bg-accent/10 blur-2xl orb-delayed" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative container mx-auto px-4 pt-6 pb-4"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Kembali
          </motion.button>

          <div className="flex gap-4 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="w-28 sm:w-40 flex-shrink-0"
            >
              <img
                src={drama.cover_url}
                alt={drama.title}
                className="w-full rounded-xl shadow-2xl shadow-background/80 border border-border/20"
              />
            </motion.div>
            <div className="flex-1 min-w-0 pt-1">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="text-xl sm:text-2xl font-display font-bold text-foreground mb-2 leading-tight line-clamp-3"
              >
                {drama.title}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3"
              >
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> {drama.chapter_count} Episode
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> {drama.provider_name}
                </span>
              </motion.div>

              {tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-1.5 mb-4"
                >
                  {tags.map((tag, i) => (
                    <motion.span
                      key={tag.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.03 }}
                      className="px-2.5 py-0.5 bg-secondary border border-border/20 text-secondary-foreground text-[10px] rounded-lg font-medium"
                    >
                      {tag.en_name || tag.name}
                    </motion.span>
                  ))}
                </motion.div>
              )}

              {episodes.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCurrentEpIndex(0)}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  <Play className="w-4 h-4" /> Tonton Sekarang
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="container mx-auto px-4 py-4"
      >
        <div className="glass rounded-xl border border-border/20 p-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={showAllDesc ? "full" : "clamp"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-sm text-muted-foreground leading-relaxed ${!showAllDesc ? "line-clamp-3" : ""}`}
            >
              {drama.introduction || "Tidak ada deskripsi."}
            </motion.p>
          </AnimatePresence>
          {drama.introduction && drama.introduction.length > 150 && (
            <button
              onClick={() => setShowAllDesc(!showAllDesc)}
              className="mt-2 text-xs text-primary font-medium flex items-center gap-1 hover:text-primary/80 transition-colors"
            >
              {showAllDesc ? "Sembunyikan" : "Selengkapnya"}
              <motion.span animate={{ rotate: showAllDesc ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3 h-3" />
              </motion.span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Episodes */}
      {episodes.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="container mx-auto px-4 pb-20"
        >
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
              <motion.button
                key={ep.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(idx * 0.02, 0.5), duration: 0.2 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentEpIndex(idx)}
                className={`py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  currentEpIndex === idx
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {ep.episode_index}
              </motion.button>
            ))}
          </div>
        </motion.div>
      ) : !loadingEpisodes ? (
        <div className="container mx-auto px-4 pb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-xl glass border border-border/20 text-center"
          >
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Episode belum tersedia. Server mungkin sedang dalam perbaikan.
            </p>
          </motion.div>
        </div>
      ) : (
        <div className="container mx-auto px-4 pb-20">
          <div className="h-8 w-48 mb-4 rounded-lg shimmer-loading" />
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg shimmer-loading" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DramaDetail;
