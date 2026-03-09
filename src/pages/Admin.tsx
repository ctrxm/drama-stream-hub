import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminSubscriptions from "@/components/admin/AdminSubscriptions";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminApiKeys from "@/components/admin/AdminApiKeys";

interface Stats {
  total_users: number;
  active_subscribers: number;
  total_revenue: number;
  pending_payments: number;
}

interface SubRow {
  id: string; user_id: string; invoice_id: string; status: string; amount: number;
  payment_method: string | null; starts_at: string | null; expires_at: string | null;
  paid_at: string | null; created_at: string; email: string; display_name: string | null;
}

interface ProfileRow {
  id: string; user_id: string; email: string; display_name: string | null; created_at: string;
}

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "users", label: "Users" },
  { key: "subscriptions", label: "Subs" },
  { key: "settings", label: "Settings" },
  { key: "apikeys", label: "API Keys" },
] as const;

type TabKey = typeof tabs[number]["key"];

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/");
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

        {activeTab === "overview" && <AdminOverview stats={stats} />}
        {activeTab === "users" && <AdminUsers users={users} loading={loadingData} />}
        {activeTab === "subscriptions" && <AdminSubscriptions subs={subs} loading={loadingData} />}
        {activeTab === "settings" && <AdminSettings />}
        {activeTab === "apikeys" && <AdminApiKeys />}
      </div>
    </div>
  );
};

export default Admin;
