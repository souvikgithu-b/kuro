import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Movie } from '../types/movie';
import { Film, Play, Clock } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, priority = false }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <article className="group relative flex flex-col bg-ink-900/60 border border-white/[0.08] hover:border-white/30 transition-all duration-300 rounded-sm overflow-hidden select-none">
      <Link
        to={`/movie/${movie.slug}`}
        className="relative block aspect-[2/3] w-full overflow-hidden bg-ink-950"
      >
        {/* Poster Image */}
        {!imageError && movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            loading={priority ? 'eager' : 'lazy'}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 filter grayscale contrast-125 group-hover:grayscale-0 group-hover:contrast-100 transition-filter"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-ink-900 text-ink-500 p-4 text-center">
            <Film className="w-12 h-12 mb-2 stroke-1 text-ink-600" />
            <span className="font-mono text-xs uppercase tracking-wider">{movie.title}</span>
          </div>
        )}

        {/* Ink Wash Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-ink-950/85 text-ink-200 border border-white/10 backdrop-blur-sm">
            {movie.release_year}
          </span>

          {movie.source_type === 'uploaded' ? (
            <span className="px-1.5 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-ink-950/90 text-white border border-white/20">
              4K / Direct
            </span>
          ) : (
            <span className="px-1.5 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-ink-950/90 text-ink-300 border border-white/10">
              Stream
            </span>
          )}
        </div>

        {/* Floating Quick Play Indicator on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-white/90 text-ink-950 flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 ml-0.5 fill-ink-950" />
          </div>
        </div>
      </Link>

      {/* Card Details */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-ink-900/40">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono tracking-wider text-ink-400 uppercase mb-1">
            <span className="text-white/80">{movie.genre}</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-2.5 h-2.5" />
              <span>{movie.duration}</span>
            </span>
          </div>

          <h3 className="font-sans font-bold text-sm sm:text-base text-ink-100 group-hover:text-white line-clamp-1 tracking-tight transition-colors">
            <Link to={`/movie/${movie.slug}`}>
              {movie.title}
            </Link>
          </h3>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/[0.05] flex items-center justify-between">
          <span className="text-[11px] font-mono text-ink-400 truncate max-w-[130px]">
            {movie.director || movie.language}
          </span>
          <Link
            to={`/movie/${movie.slug}`}
            className="text-[10px] font-mono tracking-widest uppercase text-white/70 hover:text-white transition-colors"
          >
            Details →
          </Link>
        </div>
      </div>
    </article>
  );
};
