import { useQuery } from "@tanstack/react-query";
import { fetchPopularDramas } from "@/lib/api";
import DramaCard from "@/components/DramaCard";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";

const Popular = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["popular", page],
    queryFn: () => fetchPopularDramas({ page, per_page: 24 }),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 container mx-auto px-4 pb-20">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground tracking-tight">Drama Populer</h1>
            <p className="text-xs text-muted-foreground">Drama paling banyak ditonton</p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
          {isLoading
            ? Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                </div>
              ))
            : data?.data.map((drama, i) => <DramaCard key={drama.id} drama={drama} index={i} />)}
        </div>

        {data?.meta && data.meta.total_pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page <= 1}
              className="w-10 h-10 rounded-xl bg-secondary border border-border/30 flex items-center justify-center disabled:opacity-20 hover:bg-secondary/80 transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <span className="text-sm text-muted-foreground font-medium tabular-nums">
              {page} / {data.meta.total_pages}
            </span>
            <button
              onClick={() => { setPage((p) => Math.min(data.meta.total_pages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page >= data.meta.total_pages}
              className="w-10 h-10 rounded-xl bg-secondary border border-border/30 flex items-center justify-center disabled:opacity-20 hover:bg-secondary/80 transition-all"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Popular;
