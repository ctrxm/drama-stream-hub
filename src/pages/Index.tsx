import { useQuery } from "@tanstack/react-query";
import { fetchPopularDramas, fetchDramas, fetchTags, fetchProviders } from "@/lib/api";
import DramaCard from "@/components/DramaCard";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, TrendingUp, Clock, SlidersHorizontal } from "lucide-react";

const Index = () => {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [page, setPage] = useState(1);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-14">
        <div className="relative h-[220px] sm:h-[300px] overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          {/* Decorative orbs */}
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute -bottom-10 right-10 w-40 h-40 rounded-full bg-accent/6 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          <div className="container mx-auto px-4 relative z-10 flex flex-col justify-end h-full pb-8">
            <div className="animate-slide-up">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 max-w-[40px] bg-primary/50" />
                <span className="text-xs font-medium tracking-widest uppercase text-primary">Streaming</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-2 leading-tight">
                Nonton Drama China<br />
                <span className="text-gradient">Sub Indonesia</span>
              </h1>
              <p className="text-muted-foreground max-w-md text-sm">
                Ribuan judul terbaru, gratis, HD, tanpa iklan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 -mt-2 relative z-10 mb-8">
        <div className="glass rounded-xl border border-border/30 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span className="text-xs font-display font-semibold text-foreground uppercase tracking-wider">Filter</span>
          </div>

          {tags?.data && (
            <div>
              <p className="text-[11px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Genre</p>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                <button
                  onClick={() => { setActiveTag(null); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    !activeTag
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  Semua
                </button>
                {tags.data.slice(0, 20).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => { setActiveTag(tag.en_name); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                      activeTag === tag.en_name
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {tag.en_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {providers?.data && providers.data.length > 0 && (
            <div>
              <p className="text-[11px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Provider</p>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                <button
                  onClick={() => { setActiveProvider(null); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    !activeProvider
                      ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  Semua
                </button>
                {providers.data.map((prov) => (
                  <button
                    key={prov.id}
                    onClick={() => { setActiveProvider(prov.slug); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                      activeProvider === prov.slug
                        ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {prov.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Popular */}
      <section className="container mx-auto px-4 mb-10">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-display font-bold text-foreground tracking-tight">Populer</h2>
          <div className="h-px flex-1 bg-border/50" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
          {loadingPopular
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                </div>
              ))
            : popular?.data.map((drama, i) => <DramaCard key={drama.id} drama={drama} index={i} />)}
        </div>
      </section>

      {/* Latest / Filtered */}
      <section className="container mx-auto px-4 pb-20">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
            <Clock className="w-4 h-4 text-accent" />
          </div>
          <h2 className="text-lg font-display font-bold text-foreground tracking-tight">
            {activeTag || activeProvider
              ? `${activeTag ? activeTag : ""} ${activeProvider ? `· ${activeProvider}` : ""}`
              : "Update Terbaru"}
          </h2>
          <div className="h-px flex-1 bg-border/50" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
          {loadingLatest
            ? Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                </div>
              ))
            : latest?.data.map((drama, i) => <DramaCard key={drama.id} drama={drama} index={i} />)}
        </div>

        {/* Pagination */}
        {latest?.meta && latest.meta.total_pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page <= 1}
              className="w-10 h-10 rounded-xl bg-secondary border border-border/30 flex items-center justify-center disabled:opacity-20 hover:bg-secondary/80 hover:border-primary/30 transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, latest.meta.total_pages) }, (_, i) => {
                let pageNum: number;
                if (latest.meta.total_pages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= latest.meta.total_pages - 2) {
                  pageNum = latest.meta.total_pages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => { setPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                      page === pageNum
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => { setPage((p) => Math.min(latest.meta.total_pages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page >= latest.meta.total_pages}
              className="w-10 h-10 rounded-xl bg-secondary border border-border/30 flex items-center justify-center disabled:opacity-20 hover:bg-secondary/80 hover:border-primary/30 transition-all"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">© 2024 OVRSD. All rights reserved.</span>
          <span className="text-xs text-muted-foreground">Drama China Sub Indonesia Terlengkap</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
