import { Drama } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";

interface DramaCardProps {
  drama: Drama;
}

const DramaCard = ({ drama }: DramaCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="group relative cursor-pointer card-hover rounded-lg overflow-hidden bg-card"
      onClick={() => navigate(`/drama/${drama.id}`)}
    >
      <div className="aspect-[3/4] overflow-hidden relative">
        <img
          src={drama.cover_url}
          alt={drama.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
          </div>
        </div>
        <div className="absolute top-2 right-2 bg-secondary/80 backdrop-blur-sm text-foreground text-xs px-2 py-0.5 rounded-md font-medium">
          {drama.chapter_count} Ep
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {drama.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{drama.provider_name}</p>
      </div>
    </div>
  );
};

export default DramaCard;
