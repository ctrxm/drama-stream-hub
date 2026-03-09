import { motion } from "framer-motion";

interface ProfileRow {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  created_at: string;
}

export default function AdminUsers({ users, loading }: { users: ProfileRow[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl shimmer-loading" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Belum ada user</p>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
      {users.map((u, i) => (
        <motion.div key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="glass rounded-xl border border-border/30 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{u.display_name || "—"}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(u.created_at).toLocaleDateString("id-ID")}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
