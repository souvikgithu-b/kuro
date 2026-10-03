import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { trackEvent } from '../lib/analytics';
import type { Movie } from '../types/movie';

interface WatchButtonProps {
  movie: Movie;
  variant?: 'primary' | 'secondary' | 'hero';
  className?: string;
  label?: string;
}

export const WatchButton: React.FC<WatchButtonProps> = ({
  movie,
  variant = 'primary',
  className = '',
  label = 'Watch Screening',
}) => {
  const navigate = useNavigate();

  const handleWatch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Log legitimate watch click event
    trackEvent('watch_click', movie.id);

    // Navigate to individual 3-step link destination flow
    navigate(`/watch/${movie.slug}`);
  };

  if (variant === 'hero') {
    return (
      <button
        type="button"
        onClick={handleWatch}
        className={`group relative inline-flex items-center space-x-3 px-8 py-3.5 bg-white text-ink-950 font-bold tracking-wider uppercase text-sm sm:text-base border border-white hover:bg-ink-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all duration-300 active:scale-[0.98] select-none ${className}`}
      >
        <span className="w-7 h-7 rounded-full bg-ink-950 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
        </span>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleWatch}
      className={`inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-white text-ink-950 hover:bg-ink-100 font-bold text-xs uppercase tracking-widest border border-white transition-all shadow-md active:scale-95 select-none ${className}`}
    >
      <Play className="w-3 h-3 fill-ink-950" />
      <span>{label}</span>
    </button>
  );
};
