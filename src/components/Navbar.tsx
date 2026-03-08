import { Link, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { searchDramas, Drama } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "@/assets/logo.png";

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchDramas({ q: query, per_page: 6 });
        setResults(res.data);
      } catch { setResults([]); }
      setLoading(false);
    }, 400);
  }, [query]);

  const handleSelect = (id: number) => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
    navigate(`/drama/${id}`);
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
    >
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.img
            src={logoImg}
            alt="OVRSD"
            className="w-8 h-8 object-contain"
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          />
          <span className="text-lg font-display font-bold tracking-tight text-foreground">
            OVRSD
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link to="/" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 hidden sm:block">
            Beranda
          </Link>

          <div className="relative ml-1">
            <motion.button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary/80 hover:bg-secondary transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              {searchOpen ? <X className="w-4 h-4 text-foreground" /> : <Search className="w-4 h-4 text-foreground" />}
            </motion.button>

            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-[calc(100vw-2rem)] sm:w-80 glass border border-border/50 rounded-xl shadow-2xl overflow-hidden"
                >
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari drama..."
                    className="w-full px-4 py-3 bg-transparent text-foreground text-sm outline-none border-b border-border/50 placeholder:text-muted-foreground"
                  />
                  {loading && (
                    <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Mencari...
                    </div>
                  )}
                  {results.length > 0 && (
                    <div className="max-h-80 overflow-y-auto">
                      {results.map((d, i) => (
                        <motion.button
                          key={d.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => handleSelect(d.id)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors text-left"
                        >
                          <img src={d.cover_url} alt={d.title} className="w-10 h-14 object-cover rounded-md" />
                          <div className="min-w-0">
                            <p className="text-sm text-foreground line-clamp-1 font-medium">{d.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{d.provider_name} · {d.chapter_count} Ep</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                  {query && !loading && results.length === 0 && (
                    <div className="px-4 py-3 text-sm text-muted-foreground">Tidak ditemukan</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
