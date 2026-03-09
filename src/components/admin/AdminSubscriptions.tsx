import { motion } from "framer-motion";

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

export default function AdminSubscriptions({ subs, loading }: { subs: SubRow[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl shimmer-loading" />
        ))}
      </div>
    );
  }

  if (subs.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Belum ada subscription</p>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
      {subs.map((s, i) => (
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
      ))}
    </motion.div>
  );
}
