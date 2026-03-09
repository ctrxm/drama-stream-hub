import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, Plus, Trash2, RotateCcw, Eye, EyeOff, Save, Loader2, Shield } from "lucide-react";
import { useSiteSettings, useUpdateSetting, ApiKeyEntry } from "@/hooks/useSiteSettings";
import { toast } from "sonner";

export default function AdminApiKeys() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSetting();

  const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
  const [rotationMode, setRotationMode] = useState<"round_robin" | "fallback">("round_robin");
  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [showKeys, setShowKeys] = useState<Set<number>>(new Set());
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!settings?.api_keys) return;
    setKeys(settings.api_keys.keys || []);
    setRotationMode(settings.api_keys.rotation_mode || "round_robin");
  }, [settings]);

  const maskKey = (key: string) => {
    if (key.length <= 12) return "••••••••";
    return key.slice(0, 8) + "••••••••" + key.slice(-4);
  };

  const addKey = () => {
    if (!newKey.trim()) { toast.error("API Key tidak boleh kosong"); return; }
    if (keys.some((k) => k.key === newKey.trim())) { toast.error("Key sudah ada"); return; }
    setKeys([...keys, { key: newKey.trim(), label: newLabel.trim() || `Key ${keys.length + 1}`, active: true }]);
    setNewKey("");
    setNewLabel("");
    setDirty(true);
  };

  const removeKey = (index: number) => {
    if (keys.length <= 1) { toast.error("Minimal harus ada 1 API key"); return; }
    setKeys(keys.filter((_, i) => i !== index));
    setDirty(true);
  };

  const toggleKey = (index: number) => {
    const activeCount = keys.filter((k) => k.active).length;
    if (keys[index].active && activeCount <= 1) { toast.error("Minimal 1 key harus aktif"); return; }
    setKeys(keys.map((k, i) => i === index ? { ...k, active: !k.active } : k));
    setDirty(true);
  };

  const toggleShowKey = (index: number) => {
    setShowKeys((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const saveKeys = async () => {
    try {
      await updateSetting.mutateAsync({
        key: "api_keys" as any,
        value: { keys, rotation_mode: rotationMode },
      });
      setDirty(false);
      toast.success("API Keys berhasil disimpan!");
    } catch {
      toast.error("Gagal menyimpan API Keys");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl shimmer-loading" />
        ))}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Header */}
      <div className="glass rounded-xl border border-border/30 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Key className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">API Keys Management</h3>
            <p className="text-xs text-muted-foreground">Kelola dan rotasi API key untuk drama API</p>
          </div>
        </div>

        {/* Rotation Mode */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/20">
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-xs font-medium text-foreground">Mode Rotasi</p>
          </div>
          <select
            value={rotationMode}
            onChange={(e) => { setRotationMode(e.target.value as any); setDirty(true); }}
            className="bg-secondary border border-border/30 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="round_robin">Round Robin</option>
            <option value="fallback">Fallback</option>
          </select>
        </div>

        <p className="text-[10px] text-muted-foreground mt-2 pl-7">
          {rotationMode === "round_robin"
            ? "Setiap request akan bergantian menggunakan key yang aktif."
            : "Gunakan key pertama, pindah ke key berikutnya jika gagal."}
        </p>
      </div>

      {/* Key List */}
      <div className="space-y-2">
        {keys.map((keyEntry, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`glass rounded-xl border p-3 ${
              keyEntry.active ? "border-primary/30" : "border-border/20 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className={`w-3.5 h-3.5 ${keyEntry.active ? "text-green-400" : "text-muted-foreground"}`} />
                <span className="text-xs font-medium text-foreground">{keyEntry.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  keyEntry.active ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"
                }`}>
                  {keyEntry.active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleShowKey(index)} className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
                  {showKeys.has(index)
                    ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                    : <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  }
                </button>
                <button onClick={() => toggleKey(index)} className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className={`w-8 h-4 rounded-full transition-colors ${keyEntry.active ? "bg-primary" : "bg-muted"}`}>
                    <div className={`w-3 h-3 rounded-full bg-foreground transition-transform mt-0.5 ${keyEntry.active ? "translate-x-4 ml-0.5" : "translate-x-0.5"}`} />
                  </div>
                </button>
                <button onClick={() => removeKey(index)} className="p-1.5 rounded-lg hover:bg-destructive/20 transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </div>
            <code className="text-[11px] text-muted-foreground font-mono break-all">
              {showKeys.has(index) ? keyEntry.key : maskKey(keyEntry.key)}
            </code>
          </motion.div>
        ))}
      </div>

      {/* Add New Key */}
      <div className="glass rounded-xl border border-dashed border-border/40 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">Tambah API Key Baru</span>
        </div>
        <input
          type="text"
          placeholder="Label (contoh: Key 3)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="w-full bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="sk_live_..."
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="w-full bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={addKey}
          className="w-full py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Tambahkan Key
        </button>
      </div>

      {/* Save */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={saveKeys}
        disabled={!dirty || updateSetting.isPending}
        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
          dirty
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-secondary text-muted-foreground cursor-not-allowed"
        }`}
      >
        {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {dirty ? "Simpan API Keys" : "Tidak Ada Perubahan"}
      </motion.button>
    </motion.div>
  );
}
