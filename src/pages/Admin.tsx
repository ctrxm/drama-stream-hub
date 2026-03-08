import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Users, Crown, DollarSign, Clock, Shield, TrendingUp, ArrowLeft } from "lucide-react";

interface Stats {
  total_users: number;
  active_subscribers: number;
  total_revenue: number;
  pending_payments: number;
}

interface SubRow {
  id: string;
  user_id: string;
  invoice_id: string;
  status: string;
  amount: number;
  payment_method: string | null;
  starts_at: string | null;
  expires_at: string | null;
  paid_at: string | null;
  created_at: string;
  email: string;
  display_name: string | null;
}

interface ProfileRow {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  created_at: string;
}

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "subscriptions">("overview");
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    setLoadingData(true);
    const [statsRes, usersRes, subsRes] = await Promise.all([
      supabase.rpc("admin_get_stats"),
      supabase.rpc("admin_get_all_profiles"),
      supabase.rpc("admin_get_all_subscriptions"),
    ]);

    if (statsRes.data && Array.isArray(statsRes.data) && statsRes.data.length > 0) {
      setStats(statsRes.data[0] as Stats);
    }
    if (usersRes.data) setUsers(usersRes.data as ProfileRow[]);
    if (subsRes.data) setSubs(subsRes.data as SubRow[]);
    setLoadingData(false);
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: "Total User", value: stats?.total_users ?? 0, color: "text-primary" },
    { icon: Crown, label: "Subscriber Aktif", value: stats?.active_subscribers ?? 0, color: "text-accent" },
    { icon: DollarSign, label: "Total Revenue", value: `Rp ${((stats?.total_revenue ?? 0) / 1000).toFixed(0)}K`, color: "text-accent" },
    { icon: Clock, label: "Pending", value: stats?.pending_payments ?? 0, color: "text-muted-foreground" },
  ];

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users" },
    { key: "subscriptions", label: "Subscriptions" },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 pb-20 container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-display font-bold text-foreground">Admin Panel</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-secondary/50 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {statCards.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl border border-border/30 p-4">
                  <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                  <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="glass rounded-xl border border-border/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Info</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Rate limit API: 60 request/menit</p>
                <p>• Harga langganan: Rp 20.000/bulan</p>
                <p>• Pembayaran via QRIS GoPay (bayar.gg)</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {loadingData ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl shimmer-loading" />
              ))
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada user</p>
            ) : (
              users.map((u, i) => (
                <motion.div key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="glass rounded-xl border border-border/30 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.display_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("id-ID")}
                  </p>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === "subscriptions" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {loadingData ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl shimmer-loading" />
              ))
            ) : subs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada subscription</p>
            ) : (
              subs.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="glass rounded-xl border border-border/30 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{s.email}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      s.status === "active" ? "bg-accent/15 text-accent" :
                      s.status === "pending" ? "bg-primary/15 text-primary" :
                      "bg-destructive/15 text-destructive"
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Rp {s.amount.toLocaleString("id-ID")}</span>
                    <span>{s.invoice_id}</span>
                    {s.expires_at && <span>Exp: {new Date(s.expires_at).toLocaleDateString("id-ID")}</span>}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Admin;
