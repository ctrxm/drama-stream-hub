import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUp, isGmailEmail } from "@/lib/auth";
import { motion } from "framer-motion";
import { Mail, Lock, UserPlus, Eye, EyeOff } from "lucide-react";
import logoImg from "@/assets/logo.png";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isGmailEmail(email)) {
      setError("Hanya email @gmail.com yang diizinkan untuk mendaftar.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password tidak cocok.");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground mb-2">Cek Email Kamu</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Kami telah mengirim link konfirmasi ke <span className="text-foreground font-medium">{email}</span>. Klik link tersebut untuk mengaktifkan akun.
          </p>
          <button onClick={() => navigate("/login")} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium">
            Ke Halaman Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img src={logoImg} alt="OVRSD" className="w-10 h-10" />
            <span className="text-2xl font-display font-bold text-foreground">OVRSD</span>
          </Link>
          <h1 className="text-xl font-display font-bold text-foreground">Daftar</h1>
          <p className="text-sm text-muted-foreground mt-1">Buat akun baru dengan Gmail</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </motion.div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Gmail"
              required
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
            />
          </div>
          {email && !isGmailEmail(email) && (
            <p className="text-xs text-destructive">Hanya email @gmail.com yang diizinkan</p>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min. 6 karakter)"
              required
              className="w-full pl-10 pr-10 py-3 bg-card border border-border rounded-xl text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Konfirmasi Password"
              required
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <motion.div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
            ) : (
              <><UserPlus className="w-4 h-4" /> Daftar</>
            )}
          </motion.button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Masuk</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
