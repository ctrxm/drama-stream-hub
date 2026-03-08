import { Episode } from "@/lib/api";
import { useState, useRef, useEffect, useCallback } from "react";
import { Settings, ChevronUp, ChevronDown, X, List, Play, Pause, Volume2, VolumeX } from "lucide-react";

interface VideoPlayerProps {
  episodes: Episode[];
  currentIndex: number;
  dramaTitle: string;
  onClose: () => void;
  onEpisodeChange: (index: number) => void;
}

const VideoPlayer = ({ episodes, currentIndex, dramaTitle, onClose, onEpisodeChange }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedQuality, setSelectedQuality] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef<NodeJS.Timeout>();
  const touchStartY = useRef(0);

  const episode = episodes[currentIndex];
  const qualities = episode?.qualities || {};
  const qualityKeys = Object.keys(qualities);
  const subtitles = episode?.subtitles || [];

  const videoSrc = selectedQuality && qualities[selectedQuality]
    ? qualities[selectedQuality]
    : qualityKeys.length > 0
      ? qualities[qualityKeys[0]]
      : episode?.video_url || "";

  useEffect(() => {
    if (qualityKeys.length > 0 && !selectedQuality) {
      setSelectedQuality(qualityKeys.includes("720p") ? "720p" : qualityKeys[0]);
    }
  }, [qualityKeys, selectedQuality]);

  useEffect(() => {
    if (videoRef.current && episode) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [videoSrc, episode?.id]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => clearTimeout(controlsTimeout.current);
  }, [resetControlsTimer]);

  if (!episode) return null;

  const handleVideoEnd = () => {
    if (currentIndex < episodes.length - 1) {
      onEpisodeChange(currentIndex + 1);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(isNaN(pct) ? 0 : pct);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 80) {
      if (diff > 0 && currentIndex < episodes.length - 1) {
        onEpisodeChange(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        onEpisodeChange(currentIndex - 1);
      }
    }
  };

  const goNext = () => {
    if (currentIndex < episodes.length - 1) onEpisodeChange(currentIndex + 1);
  };
  const goPrev = () => {
    if (currentIndex > 0) onEpisodeChange(currentIndex - 1);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-background flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={resetControlsTimer}
    >
      {/* Video */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          autoPlay
          playsInline
          crossOrigin="anonymous"
          onEnded={handleVideoEnd}
          onTimeUpdate={handleTimeUpdate}
          onClick={togglePlay}
        >
          <source src={videoSrc} type="video/mp4" />
          {subtitles.map((sub) => (
            <track
              key={sub.lang}
              kind="subtitles"
              src={sub.url}
              srcLang={sub.lang}
              label={sub.lang === "id" ? "Indonesia" : sub.lang === "en" ? "English" : sub.lang}
              default={sub.lang === "id"}
            />
          ))}
        </video>

        {/* Overlay controls */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 pt-[env(safe-area-inset-top,16px)]">
            <div className="flex items-center justify-between">
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center">
                <X className="w-5 h-5 text-foreground" />
              </button>
              <div className="text-center flex-1 mx-4">
                <p className="text-foreground text-sm font-medium truncate">{dramaTitle}</p>
                <p className="text-muted-foreground text-xs">Episode {episode.episode_index}</p>
              </div>
              <button onClick={() => setShowEpisodeList(true)} className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center">
                <List className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>

          {/* Center play/pause */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {!isPlaying && (
              <div className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center animate-fade-in">
                <Play className="w-8 h-8 text-primary-foreground ml-1" />
              </div>
            )}
          </div>

          {/* Right side nav */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-4">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center disabled:opacity-30"
            >
              <ChevronUp className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex === episodes.length - 1}
              className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center disabled:opacity-30"
            >
              <ChevronDown className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pb-[env(safe-area-inset-bottom,16px)]">
            <div className="w-full h-1.5 bg-muted/40 rounded-full mb-3 cursor-pointer" onClick={handleProgressClick}>
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="w-8 h-8 flex items-center justify-center">
                  {isPlaying ? <Pause className="w-5 h-5 text-foreground" /> : <Play className="w-5 h-5 text-foreground" />}
                </button>
                <button onClick={toggleMute} className="w-8 h-8 flex items-center justify-center">
                  {isMuted ? <VolumeX className="w-5 h-5 text-foreground" /> : <Volume2 className="w-5 h-5 text-foreground" />}
                </button>
              </div>
              <div className="flex items-center gap-2">
                {qualityKeys.length > 1 && (
                  <button
                    onClick={() => { setShowSettings(!showSettings); setShowEpisodeList(false); }}
                    className="px-3 py-1.5 rounded-full bg-secondary/60 text-xs text-foreground font-medium"
                  >
                    {selectedQuality || "HD"}
                  </button>
                )}
                <span className="text-xs text-muted-foreground">
                  {currentIndex + 1}/{episodes.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quality picker */}
        {showSettings && (
          <div className="absolute bottom-24 right-4 bg-card border border-border rounded-lg p-3 min-w-[140px] shadow-lg z-10">
            <p className="text-xs text-muted-foreground mb-2">Kualitas</p>
            {qualityKeys.map((q) => (
              <button
                key={q}
                onClick={() => { setSelectedQuality(q); setShowSettings(false); }}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  selectedQuality === q ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Episode list drawer */}
      {showEpisodeList && (
        <div className="absolute inset-0 z-20 flex items-end" onClick={() => setShowEpisodeList(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative w-full max-h-[60vh] bg-card rounded-t-2xl overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-foreground font-medium">Daftar Episode</h3>
              <button onClick={() => setShowEpisodeList(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(60vh-60px)] p-4">
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {episodes.map((ep, idx) => (
                  <button
                    key={ep.id}
                    onClick={() => { onEpisodeChange(idx); setShowEpisodeList(false); }}
                    className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      idx === currentIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {ep.episode_index}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
