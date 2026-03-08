import { useQuery } from "@tanstack/react-query";
import { fetchPopularDramas, fetchDramas, fetchTags, fetchProviders } from "@/lib/api";
import DramaCard from "@/components/DramaCard";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Flame, Sparkles, Tag, Building2 } from "lucide-react";

const Index = () => {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data: popular, isLoading: loadingPopular } = useQuery({
    queryKey: ["popular-dramas"],
    queryFn: () => fetchPopularDramas({ per_page: 12 }),
  });

  const { data: latest, isLoading: loadingLatest } = useQuery({
    queryKey: ["latest-dramas", page, activeTag],
    queryFn: () =>
      fetchDramas({
        page,
        per_page: 18,
        sort_by: "updated_at",
        sort_order: "desc",
        tag: activeTag || undefined,
      }),
  });

  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-16">
        <div className="relative h-[340px] sm:h-[400px] overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          <div className="container mx-auto px-4 relative z-10 flex flex-col justify-end h-full pb-10">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-gradient mb-3">
              Drama China Terlengkap
            </h1>
            <p className="text-muted-foreground max-w-xl text-sm sm:text-base">
              Tonton ribuan drama China terbaru dengan subtitle Indonesia. Gratis, tanpa iklan, kualitas HD.
            </p>
          </div>
        </div>
      </section>

      {/* Popular */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-display font-semibold text-foreground">Drama Populer</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loadingPopular
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))
            : popular?.data.map((drama) => <DramaCard key={drama.id} drama={drama} />)}
        </div>
      </section>

      {/* Tags Filter */}
      {tags?.data && (
        <section className="container mx-auto px-4 mt-12">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-medium text-muted-foreground">Filter Genre</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            <button
              onClick={() => { setActiveTag(null); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                !activeTag ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Semua
            </button>
            {tags.data.slice(0, 20).map((tag) => (
              <button
                key={tag.id}
                onClick={() => { setActiveTag(tag.en_name); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTag === tag.en_name
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {tag.en_name} ({tag.drama_count})
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Latest */}
      <section className="container mx-auto px-4 mt-8 pb-16">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-display font-semibold text-foreground">
            {activeTag ? `Genre: ${activeTag}` : "Terbaru"}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loadingLatest
            ? Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))
            : latest?.data.map((drama) => <DramaCard key={drama.id} drama={drama} />)}
        </div>

        {/* Pagination */}
        {latest?.meta && latest.meta.total_pages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center disabled:opacity-30 hover:bg-secondary/80 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <span className="text-sm text-muted-foreground">
              {page} / {latest.meta.total_pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(latest.meta.total_pages, p + 1))}
              disabled={page >= latest.meta.total_pages}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center disabled:opacity-30 hover:bg-secondary/80 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
