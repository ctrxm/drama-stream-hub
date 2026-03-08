import { Link, useNavigate } from "react-router-dom";
import { Search, Film } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { searchDramas, Drama } from "@/lib/api";

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchDramas({ q: query, per_page: 6 });
        setResults(res.data);
      } catch {
        setResults([]);
      }
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <Film className="w-7 h-7 text-primary" />
          <span className="text-xl font-display font-bold text-gradient">SDrama</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Beranda
          </Link>
          <Link to="/popular" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Populer
          </Link>

          <div className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Search className="w-4 h-4 text-foreground" />
            </button>

            {searchOpen && (
              <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari drama..."
                  className="w-full px-4 py-3 bg-transparent text-foreground text-sm outline-none border-b border-border placeholder:text-muted-foreground"
                />
                {loading && (
                  <div className="px-4 py-3 text-sm text-muted-foreground">Mencari...</div>
                )}
                {results.length > 0 && (
                  <div className="max-h-80 overflow-y-auto">
                    {results.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => handleSelect(d.id)}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-secondary transition-colors text-left"
                      >
                        <img src={d.cover_url} alt={d.title} className="w-10 h-14 object-cover rounded" />
                        <div>
                          <p className="text-sm text-foreground line-clamp-1">{d.title}</p>
                          <p className="text-xs text-muted-foreground">{d.provider_name} · {d.chapter_count} Ep</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {query && !loading && results.length === 0 && (
                  <div className="px-4 py-3 text-sm text-muted-foreground">Tidak ditemukan</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
