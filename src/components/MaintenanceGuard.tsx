import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAuth } from "@/hooks/useAuth";
import { Wrench } from "lucide-react";
import { ReactNode } from "react";

export default function MaintenanceGuard({ children }: { children: ReactNode }) {
  const { data: settings, isLoading } = useSiteSettings();
  const { isAdmin, loading: authLoading } = useAuth();

  // Don't block while loading
  if (isLoading || authLoading) return <>{children}</>;

  const maintenance = settings?.maintenance_mode;
  if (maintenance?.enabled && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Wrench className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Maintenance</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {maintenance.message || "Sedang dalam pemeliharaan. Silakan kembali nanti."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
