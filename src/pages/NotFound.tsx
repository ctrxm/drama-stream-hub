import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="text-7xl font-display font-bold text-gradient mb-4">404</div>
        <p className="text-muted-foreground mb-6 text-sm">Halaman tidak ditemukan</p>
        <Link
          to="/"
          className="inline-flex px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
