import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertTriangle, ExternalLink } from 'lucide-react';
import type { SourceType } from '../types/movie';

interface VideoPlayerProps {
  sourceType: SourceType;
  videoUrl?: string | null;
  externalUrl?: string | null;
  title: string;
  posterUrl?: string;
  autoPlay?: boolean;
}

/**
 * Helper to determine if an external URL is a YouTube/Vimeo embed or direct video file.
 */
function getEmbedDetails(url: string) {
  if (!url) return { type: 'unknown', embedUrl: '' };

  // YouTube match
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
    };
  }

  // Vimeo match
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }

  // Direct MP4 / WebM / OGG check
  if (/\.(mp4|webm|ogg|m4v)(\?.*)?$/i.test(url)) {
    return {
      type: 'direct',
      embedUrl: url,
    };
  }

  return {
    type: 'generic_iframe',
    embedUrl: url,
  };
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  sourceType,
  videoUrl,
  externalUrl,
  title,
  posterUrl,
  autoPlay = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);

  const effectiveUrl = sourceType === 'uploaded' ? videoUrl : externalUrl;
  const embedInfo = getEmbedDetails(effectiveUrl || '');

  // Hide controls on inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2800);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

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

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  if (!effectiveUrl) {
    return (
      <div className="aspect-video w-full bg-ink-950 border border-white/10 flex flex-col items-center justify-center p-8 text-center rounded-sm">
        <AlertTriangle className="w-10 h-10 text-ink-500 mb-3" />
        <h4 className="text-white font-bold font-sans text-sm mb-1">Video Stream Pending</h4>
        <p className="text-xs text-ink-400 font-mono max-w-sm">
          No destination video stream has been configured for this title yet.
        </p>
      </div>
    );
  }

  // Handle YouTube, Vimeo, or standard iframe embed
  if (sourceType === 'external' && embedInfo.type !== 'direct') {
    return (
      <div className="relative aspect-video w-full bg-ink-950 border border-white/10 rounded-sm overflow-hidden shadow-2xl">
        <iframe
          src={embedInfo.embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
        <div className="absolute top-3 right-3 pointer-events-none">
          <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-ink-950/80 text-white border border-white/20">
            External Destination Stream
          </span>
        </div>
      </div>
    );
  }

  // Direct Video Stream (HTML5 Video)
  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="group relative aspect-video w-full bg-black border border-white/10 rounded-sm overflow-hidden shadow-2xl select-none"
    >
      <video
        ref={videoRef}
        src={effectiveUrl}
        poster={posterUrl}
        autoPlay={autoPlay}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={() => setHasError(true)}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Ambient Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-ink-950 flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-vermilion mb-2" />
          <p className="text-white text-sm font-sans mb-1">Stream Playback Notice</p>
          <p className="text-xs font-mono text-ink-400 max-w-md mb-4">
            Could not stream directly from source. You can open the raw stream URL directly.
          </p>
          <a
            href={effectiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ink-btn-secondary px-4 py-2 text-xs font-mono tracking-wider inline-flex items-center space-x-2"
          >
            <span>Launch External Stream</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Big Center Play/Pause button when paused */}
      {!isPlaying && !hasError && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/90 text-ink-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
          aria-label="Play video"
        >
          <Play className="w-6 h-6 ml-1 fill-ink-950" />
        </button>
      )}

      {/* Video Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Seek Bar */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hover:h-1.5 transition-all mb-3"
        />

        <div className="flex items-center justify-between text-white text-xs font-mono">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1 hover:text-ink-300 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="p-1 hover:text-ink-300 transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-vermilion" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <span className="text-[11px] text-ink-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[10px] tracking-widest uppercase text-ink-400 hidden sm:inline">
              HD 1080P
            </span>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1 hover:text-ink-300 transition-colors"
              aria-label="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
