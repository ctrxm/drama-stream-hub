import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  maintenance_mode: { enabled: boolean; message: string };
  subscription_price: { amount: number; currency: string; duration_days: number };
  rate_limit: { requests_per_minute: number };
  site_info: { name: string; description: string; announcement: string };
  registration: { enabled: boolean; gmail_only: boolean };
}

type SettingKey = keyof SiteSettings;

async function fetchSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value");

  if (error) throw error;

  const settings: Record<string, unknown> = {};
  for (const row of data || []) {
    settings[row.key] = row.value;
  }
  return settings as unknown as SiteSettings;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: fetchSettings,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: SettingKey; value: unknown }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Anda harus login terlebih dahulu");
      
      const { error } = await supabase
        .from("site_settings")
        .update({ value: value as any, updated_at: new Date().toISOString(), updated_by: user.id })
        .eq("key", key);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site_settings"] }),
  });
}
