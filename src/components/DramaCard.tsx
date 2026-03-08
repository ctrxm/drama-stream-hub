import { Drama } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { motion } from "framer-motion";

interface DramaCardProps {
  drama: Drama;
  index?: number;
}

const DramaCard = ({ drama, index = 0 }: DramaCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.04, 0.3),
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -8, scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="group relative cursor-pointer rounded-xl overflow-hidden bg-card border border-border/30"
      onClick={() => navigate(`/drama/${drama.id}`, { state: { drama } })}
    >
      <div className="aspect-[2/3] overflow-hidden relative">
        <motion.img
          src={drama.cover_url}
          alt={drama.title}
          className="w-full h-full object-cover"
          loading="lazy"
          whileHover={{ scale: 1.12 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1 }}
            className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm"
          >
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
          </motion.div>
        </div>
        {/* Hover glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: "inset 0 0 40px hsl(262 83% 58% / 0.15)" }}
        />
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
    </motion.div>
  );
};

export default DramaCard;
