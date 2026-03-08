import { useQuery } from "@tanstack/react-query";
import { fetchPopularDramas } from "@/lib/api";
import DramaCard from "@/components/DramaCard";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";

const Popular = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["popular", page],
    queryFn: () => fetchPopularDramas({ page, per_page: 24 }),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 container mx-auto px-4 pb-16">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-display font-bold text-foreground">Drama Populer</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {isLoading
            ? Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))
            : data?.data.map((drama) => <DramaCard key={drama.id} drama={drama} />)}
        </div>

        {data?.meta && data.meta.total_pages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center disabled:opacity-30 hover:bg-secondary/80 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <span className="text-sm text-muted-foreground">{page} / {data.meta.total_pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(data.meta.total_pages, p + 1))}
              disabled={page >= data.meta.total_pages}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center disabled:opacity-30 hover:bg-secondary/80 transition-colors"
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
