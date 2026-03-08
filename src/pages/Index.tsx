import { useQuery } from "@tanstack/react-query";
import { fetchPopularDramas, fetchDramas, fetchTags, fetchProviders } from "@/lib/api";
import DramaCard from "@/components/DramaCard";
import Navbar from "@/components/Navbar";
import { useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Clock, SlidersHorizontal, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: popular, isLoading: loadingPopular } = useQuery({
    queryKey: ["popular-dramas"],
    queryFn: () => fetchPopularDramas({ per_page: 12 }),
  });

  const { data: latest, isLoading: loadingLatest } = useQuery({
    queryKey: ["latest-dramas", page, activeTag, activeProvider],
    queryFn: () =>
      fetchDramas({
        page,
        per_page: 18,
        sort_by: "updated_at",
        sort_order: "desc",
        tag: activeTag || undefined,
        provider: activeProvider || undefined,
      }),
  });

  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });

  const { data: providers } = useQuery({
    queryKey: ["providers"],
    queryFn: fetchProviders,
  });

  const hasActiveFilter = activeTag || activeProvider;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero with animated orbs */}
      <section className="pt-14">
        <div className="relative h-[220px] sm:h-[280px] overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          {/* Animated orbs */}
          <div className="absolute -top-16 -left-16 w-52 h-52 rounded-full bg-primary/10 blur-3xl orb" />
          <div className="absolute top-10 right-10 w-36 h-36 rounded-full bg-accent/8 blur-3xl orb-delayed" />
          <div className="absolute -bottom-20 left-1/3 w-44 h-44 rounded-full bg-primary/6 blur-3xl orb-slow" />
          <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-accent/10 blur-2xl pulse-glow" />
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />
          
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          <div className="container mx-auto px-4 relative z-10 flex flex-col justify-end h-full pb-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div
                className="flex items-center gap-2 mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="h-px flex-1 max-w-[40px] bg-primary/50" />
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-primary">Streaming Platform</span>
              </motion.div>
              <h1 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-2 leading-tight">
                Drama China{" "}
                <span className="text-gradient gradient-animate bg-[length:200%_200%]">Sub Indo</span>
              </h1>
              <motion.p
                className="text-muted-foreground text-xs sm:text-sm max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Ribuan judul terbaru · Gratis · HD · Tanpa iklan
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Provider chips */}
      {providers?.data && providers.data.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="container mx-auto px-4 -mt-3 relative z-10 mb-4"
        >
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setActiveProvider(null); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                !activeProvider
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                  : "bg-card text-secondary-foreground border-border/40 hover:border-primary/40"
              }`}
            >
              Semua Provider
            </motion.button>
            {providers.data.map((prov, i) => (
              <motion.button
                key={prov.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05, duration: 0.3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setActiveProvider(prov.slug); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                  activeProvider === prov.slug
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                    : "bg-card text-secondary-foreground border-border/40 hover:border-primary/40"
                }`}
              >
                {prov.name}
                <span className="ml-1 text-[10px] opacity-60">{prov.drama_count}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}

      {/* Genre filter */}
      {tags?.data && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="container mx-auto px-4 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Genre</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => { setActiveTag(null); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all duration-200 ${
                !activeTag
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Semua
            </motion.button>
            {tags.data.slice(0, 25).map((tag) => (
              <motion.button
                key={tag.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => { setActiveTag(tag.en_name); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTag === tag.en_name
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {tag.en_name}
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}

      <div ref={contentRef}>
        {/* Popular — only show when no filter active */}
        <AnimatePresence mode="wait">
          {!hasActiveFilter && (
            <motion.section
              key="popular"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="container mx-auto px-4 mb-10"
            >
              <div className="flex items-center gap-2.5 mb-5">
                <motion.div
                  className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                </motion.div>
                <h2 className="text-base font-display font-bold text-foreground tracking-tight">Populer</h2>
                <div className="h-px flex-1 bg-border/40" />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                {loadingPopular
                  ? Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="aspect-[2/3] w-full rounded-xl shimmer-loading" />
                        <div className="h-3 w-3/4 rounded shimmer-loading" />
                      </div>
                    ))
                  : popular?.data.map((drama, i) => <DramaCard key={drama.id} drama={drama} index={i} />)}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Latest / Filtered */}
        <motion.section
          key={`${activeTag}-${activeProvider}-${page}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto px-4 pb-20"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-accent" />
            </div>
            <h2 className="text-base font-display font-bold text-foreground tracking-tight">
              {hasActiveFilter
                ? [activeProvider, activeTag].filter(Boolean).join(" · ")
                : "Update Terbaru"}
            </h2>
            <div className="h-px flex-1 bg-border/40" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {loadingLatest
              ? Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="aspect-[2/3] w-full rounded-xl shimmer-loading" />
                    <div className="h-3 w-3/4 rounded shimmer-loading" />
                  </div>
                ))
              : latest?.data.map((drama, i) => <DramaCard key={drama.id} drama={drama} index={i} />)}
          </div>

          {/* Pagination */}
          {latest?.meta && latest.meta.total_pages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 mt-10"
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={page <= 1}
                className="w-9 h-9 rounded-lg bg-secondary border border-border/30 flex items-center justify-center disabled:opacity-20 hover:bg-secondary/80 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </motion.button>
              {Array.from({ length: Math.min(5, latest.meta.total_pages) }, (_, i) => {
                let pageNum: number;
                const tp = latest.meta.total_pages;
                if (tp <= 5) pageNum = i + 1;
                else if (page <= 3) pageNum = i + 1;
                else if (page >= tp - 2) pageNum = tp - 4 + i;
                else pageNum = page - 2 + i;
                return (
                  <motion.button
                    key={pageNum}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all ${
                      page === pageNum
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => { setPage((p) => Math.min(latest.meta.total_pages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={page >= latest.meta.total_pages}
                className="w-9 h-9 rounded-lg bg-secondary border border-border/30 flex items-center justify-center disabled:opacity-20 hover:bg-secondary/80 transition-all"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </motion.button>
            </motion.div>
          )}
        </motion.section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/20 py-5">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground font-medium">© 2024 OVRSD</span>
          <span className="text-[11px] text-muted-foreground">Drama China Sub Indonesia Terlengkap</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
