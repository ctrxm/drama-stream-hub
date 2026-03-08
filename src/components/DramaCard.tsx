import { Drama } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";

interface DramaCardProps {
  drama: Drama;
  index?: number;
}

const DramaCard = ({ drama, index = 0 }: DramaCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="group relative cursor-pointer card-hover rounded-xl overflow-hidden bg-card border border-border/30 animate-stagger"
      style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
      onClick={() => navigate(`/drama/${drama.id}`, { state: { drama } })}
    >
      <div className="aspect-[2/3] overflow-hidden relative">
        <img
          src={drama.cover_url}
          alt={drama.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
          </div>
        </div>
        <div className="absolute top-2 right-2 glass text-foreground text-[11px] px-2 py-0.5 rounded-md font-medium border border-border/20">
          {drama.chapter_count} Ep
        </div>
      </div>
      <div className="p-2.5">
        <h3 className="text-[13px] font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200">
          {drama.title}
        </h3>
        <p className="text-[11px] text-muted-foreground mt-1 font-medium">{drama.provider_name}</p>
      </div>
    </div>
  );
};

export default DramaCard;
