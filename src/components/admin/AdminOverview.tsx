import { motion } from "framer-motion";
import { Users, Crown, DollarSign, Clock, TrendingUp } from "lucide-react";

interface Stats {
  total_users: number;
  active_subscribers: number;
  total_revenue: number;
  pending_payments: number;
}

export default function AdminOverview({ stats }: { stats: Stats | null }) {
  const statCards = [
    { icon: Users, label: "Total User", value: stats?.total_users ?? 0, color: "text-primary" },
    { icon: Crown, label: "Subscriber Aktif", value: stats?.active_subscribers ?? 0, color: "text-accent" },
    { icon: DollarSign, label: "Total Revenue", value: `Rp ${((stats?.total_revenue ?? 0) / 1000).toFixed(0)}K`, color: "text-accent" },
    { icon: Clock, label: "Pending", value: stats?.pending_payments ?? 0, color: "text-muted-foreground" },
  ];

  return (
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
  );
}
