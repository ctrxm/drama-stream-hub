import { Episode } from "@/lib/api";
import { useState, useRef, useEffect } from "react";
import { Settings, Subtitles, Maximize, Minimize } from "lucide-react";

interface VideoPlayerProps {
  episode: Episode;
  dramaTitle: string;
}

const VideoPlayer = ({ episode, dramaTitle }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedQuality, setSelectedQuality] = useState<string>("");
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const qualities = episode.qualities || {};
  const qualityKeys = Object.keys(qualities);
  const subtitles = episode.subtitles || [];

  // Determine video source
  const videoSrc = selectedQuality && qualities[selectedQuality]
    ? qualities[selectedQuality]
    : qualityKeys.length > 0
      ? qualities[qualityKeys[0]]
      : episode.video_url;

  useEffect(() => {
    if (qualityKeys.length > 0 && !selectedQuality) {
      // prefer 720p, fallback to first
      setSelectedQuality(qualityKeys.includes("720p") ? "720p" : qualityKeys[0]);
    }
  }, [qualityKeys, selectedQuality]);

  useEffect(() => {
    if (subtitles.length > 0 && !selectedSubtitle) {
      const idSub = subtitles.find((s) => s.lang === "id");
      setSelectedSubtitle(idSub ? "id" : subtitles[0].lang);
    }
  }, [subtitles, selectedSubtitle]);

  // Reload video when source changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoSrc, episode.id]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative bg-background w-full">
      <div className="relative w-full aspect-video max-h-[70vh] bg-muted">
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          autoPlay
          playsInline
          crossOrigin="anonymous"
        >
          <source src={videoSrc} type="video/mp4" />
          {subtitles.map((sub) => (
            <track
              key={sub.lang}
              kind="subtitles"
              src={sub.url}
              srcLang={sub.lang}
              label={sub.lang === "id" ? "Indonesia" : sub.lang === "en" ? "English" : sub.lang}
              default={sub.lang === selectedSubtitle}
            />
          ))}
        </video>
      </div>

      {/* Controls Bar */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">{dramaTitle}</h3>
          <p className="text-xs text-muted-foreground">{episode.episode_name}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Quality Selector */}
          {qualityKeys.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <Settings className="w-4 h-4 text-foreground" />
              </button>
              {showSettings && (
                <div className="absolute bottom-10 right-0 bg-card border border-border rounded-lg p-2 min-w-[120px] shadow-lg">
                  <p className="text-xs text-muted-foreground px-2 py-1">Kualitas</p>
                  {qualityKeys.map((q) => (
                    <button
                      key={q}
                      onClick={() => { setSelectedQuality(q); setShowSettings(false); }}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
                        selectedQuality === q
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                  {subtitles.length > 0 && (
                    <>
                      <p className="text-xs text-muted-foreground px-2 py-1 mt-2">Subtitle</p>
                      {subtitles.map((sub) => (
                        <button
                          key={sub.lang}
                          onClick={() => { setSelectedSubtitle(sub.lang); setShowSettings(false); }}
                          className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
                            selectedSubtitle === sub.lang
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-secondary"
                          }`}
                        >
                          {sub.lang === "id" ? "Indonesia" : sub.lang === "en" ? "English" : sub.lang}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {subtitles.length > 0 && qualityKeys.length <= 1 && (
            <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <Subtitles className="w-4 h-4 text-foreground" />
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 text-foreground" />
            ) : (
              <Maximize className="w-4 h-4 text-foreground" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
