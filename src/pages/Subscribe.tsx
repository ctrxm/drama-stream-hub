import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Crown, Check, Zap, Shield, Tv } from "lucide-react";
import Navbar from "@/components/Navbar";

const Subscribe = () => {
  const { user, isSubscribed, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (!user && !authLoading) {
    navigate("/login");
    return null;
  }

  if (isSubscribed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex flex-col items-center justify-center px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">Kamu Sudah Berlangganan!</h2>
            <p className="text-sm text-muted-foreground mb-6">Nikmati semua drama tanpa batas.</p>
            <button onClick={() => navigate("/")} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium">
              Tonton Sekarang
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const handleSubscribe = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-payment", {
        body: {
          amount: 20000,
          description: "Langganan OVRSD - 1 Bulan",
          customer_email: user?.email,
          payment_method: "gopay_qris",
        },
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || "Gagal membuat pembayaran");

      // Open payment URL
      if (data.payment_url) {
        window.open(data.payment_url, "_blank");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    }
    setLoading(false);
  };

  const features = [
    { icon: Tv, text: "Akses semua drama tanpa batas" },
    { icon: Zap, text: "Streaming HD tanpa iklan" },
    { icon: Shield, text: "Subtitle Indonesia lengkap" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-20 flex flex-col items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="text-center mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4"
            >
              <Crown className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-2xl font-display font-bold text-foreground">Berlangganan</h1>
            <p className="text-sm text-muted-foreground mt-1">Nikmati akses penuh ke semua drama</p>
          </div>

          <div className="glass rounded-2xl border border-border/30 p-6 mb-6">
            <div className="flex items-baseline justify-center gap-1 mb-4">
              <span className="text-3xl font-display font-bold text-foreground">Rp 20.000</span>
              <span className="text-sm text-muted-foreground">/bulan</span>
            </div>

            <div className="space-y-3 mb-6">
              {features.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <span className="text-sm text-foreground">{f.text}</span>
                </motion.div>
              ))}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
                {error}
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <motion.div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
              ) : (
                "Bayar dengan QRIS GoPay"
              )}
            </motion.button>

            <p className="text-[11px] text-muted-foreground text-center mt-3">
              Pembayaran melalui QRIS GoPay · Aktif 30 hari
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Subscribe;
