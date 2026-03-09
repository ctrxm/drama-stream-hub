import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Wrench, CreditCard, Shield, Globe, UserPlus, AlertTriangle, Save, Loader2 } from "lucide-react";
import { useSiteSettings, useUpdateSetting, SiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";

function SettingCard({ icon: Icon, title, description, children }: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl border border-border/30 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-3 pl-11">{children}</div>
    </motion.div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-foreground">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </label>
  );
}

function InputField({ label, value, onChange, type = "text", suffix }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string; suffix?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {suffix && <span className="text-xs text-muted-foreground whitespace-nowrap">{suffix}</span>}
      </div>
    </div>
  );
}

function TextArea({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
      />
    </div>
  );
}

export default function AdminSettings() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSetting();

  const [maintenance, setMaintenance] = useState({ enabled: false, message: "" });
  const [pricing, setPricing] = useState({ amount: 20000, currency: "IDR", duration_days: 30 });
  const [rateLimit, setRateLimit] = useState({ requests_per_minute: 60 });
  const [siteInfo, setSiteInfo] = useState({ name: "", description: "", announcement: "" });
  const [registration, setRegistration] = useState({ enabled: true, gmail_only: true });
  const [dirty, setDirty] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!settings) return;
    setMaintenance(settings.maintenance_mode);
    setPricing(settings.subscription_price);
    setRateLimit(settings.rate_limit);
    setSiteInfo(settings.site_info);
    setRegistration(settings.registration);
  }, [settings]);

  const markDirty = (key: string) => setDirty((prev) => new Set(prev).add(key));

  const saveAll = async () => {
    const updates: { key: keyof SiteSettings; value: unknown }[] = [];
    if (dirty.has("maintenance_mode")) updates.push({ key: "maintenance_mode", value: maintenance });
    if (dirty.has("subscription_price")) updates.push({ key: "subscription_price", value: pricing });
    if (dirty.has("rate_limit")) updates.push({ key: "rate_limit", value: rateLimit });
    if (dirty.has("site_info")) updates.push({ key: "site_info", value: siteInfo });
    if (dirty.has("registration")) updates.push({ key: "registration", value: registration });

    if (updates.length === 0) {
      toast.info("Tidak ada perubahan");
      return;
    }

    try {
      await Promise.all(updates.map((u) => updateSetting.mutateAsync(u)));
      setDirty(new Set());
      toast.success("Pengaturan berhasil disimpan!");
    } catch {
      toast.error("Gagal menyimpan pengaturan");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl shimmer-loading" />
        ))}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      {/* Maintenance */}
      <SettingCard icon={Wrench} title="Mode Maintenance" description="Aktifkan untuk menutup sementara akses user non-admin.">
        <Toggle
          checked={maintenance.enabled}
          onChange={(v) => { setMaintenance((p) => ({ ...p, enabled: v })); markDirty("maintenance_mode"); }}
          label="Aktifkan Maintenance"
        />
        {maintenance.enabled && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-xs text-destructive">Site sedang dalam mode maintenance!</p>
          </div>
        )}
        <TextArea
          label="Pesan Maintenance"
          value={maintenance.message}
          onChange={(v) => { setMaintenance((p) => ({ ...p, message: v })); markDirty("maintenance_mode"); }}
        />
      </SettingCard>

      {/* Subscription Pricing */}
      <SettingCard icon={CreditCard} title="Harga Langganan" description="Atur harga dan durasi subscription.">
        <InputField
          label="Harga (Rupiah)"
          type="number"
          value={pricing.amount}
          onChange={(v) => { setPricing((p) => ({ ...p, amount: Number(v) })); markDirty("subscription_price"); }}
          suffix="IDR"
        />
        <InputField
          label="Durasi"
          type="number"
          value={pricing.duration_days}
          onChange={(v) => { setPricing((p) => ({ ...p, duration_days: Number(v) })); markDirty("subscription_price"); }}
          suffix="hari"
        />
      </SettingCard>

      {/* Rate Limit */}
      <SettingCard icon={Shield} title="Rate Limit API" description="Batasi jumlah request per menit ke API drama.">
        <InputField
          label="Max Request"
          type="number"
          value={rateLimit.requests_per_minute}
          onChange={(v) => { setRateLimit({ requests_per_minute: Number(v) }); markDirty("rate_limit"); }}
          suffix="req/menit"
        />
      </SettingCard>

      {/* Site Info */}
      <SettingCard icon={Globe} title="Informasi Site" description="Nama, deskripsi, dan pengumuman.">
        <InputField
          label="Nama Site"
          value={siteInfo.name}
          onChange={(v) => { setSiteInfo((p) => ({ ...p, name: v })); markDirty("site_info"); }}
        />
        <InputField
          label="Deskripsi"
          value={siteInfo.description}
          onChange={(v) => { setSiteInfo((p) => ({ ...p, description: v })); markDirty("site_info"); }}
        />
        <TextArea
          label="Pengumuman (kosongkan jika tidak ada)"
          value={siteInfo.announcement}
          onChange={(v) => { setSiteInfo((p) => ({ ...p, announcement: v })); markDirty("site_info"); }}
        />
      </SettingCard>

      {/* Registration */}
      <SettingCard icon={UserPlus} title="Registrasi" description="Atur siapa yang boleh mendaftar.">
        <Toggle
          checked={registration.enabled}
          onChange={(v) => { setRegistration((p) => ({ ...p, enabled: v })); markDirty("registration"); }}
          label="Registrasi Dibuka"
        />
        <Toggle
          checked={registration.gmail_only}
          onChange={(v) => { setRegistration((p) => ({ ...p, gmail_only: v })); markDirty("registration"); }}
          label="Hanya Gmail (@gmail.com)"
        />
      </SettingCard>

      {/* Save Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={saveAll}
        disabled={dirty.size === 0 || updateSetting.isPending}
        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
          dirty.size > 0
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-secondary text-muted-foreground cursor-not-allowed"
        }`}
      >
        {updateSetting.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {dirty.size > 0 ? `Simpan ${dirty.size} Perubahan` : "Tidak Ada Perubahan"}
      </motion.button>
    </motion.div>
  );
}
