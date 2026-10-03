import React from 'react';
import { Link } from 'react-router-dom';
import type { Movie } from '../types/movie';
import { WatchButton } from './WatchButton';
import { Clock, Globe, Info } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';

interface MovieHeroProps {
  movie: Movie;
}

export const MovieHero: React.FC<MovieHeroProps> = ({ movie }) => {
  return (
    <section className="relative w-full min-h-[580px] lg:min-h-[660px] flex items-end pb-12 sm:pb-16 pt-24 overflow-hidden border-b border-white/[0.08] select-none bg-ink-950">
      {/* Cinematic Backdrop Image with Vignette & Ink Wash */}
      <div className="absolute inset-0 z-0">
        <img
          src={movie.backdrop_url || movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover object-center filter grayscale contrast-125 opacity-35"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/60 to-transparent" />
        <div className="absolute inset-0 bg-noise-pattern opacity-40" />
      </div>

      {/* Subtle Japanese Watermark */}
      <div className="absolute right-8 top-12 opacity-[0.04] select-none pointer-events-none text-[220px] font-serif leading-none text-white hidden md:block">
        {BRAND_CONFIG.kanji}
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl space-y-5 animate-slide-up">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="hanko-stamp">{BRAND_CONFIG.stampText}</span>
            <span className="px-2.5 py-0.5 text-xs font-mono tracking-widest uppercase bg-ink-900/90 text-white border border-white/15">
              {movie.release_year}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-mono tracking-widest uppercase bg-ink-900/70 text-ink-300 border border-white/10">
              {movie.genre}
            </span>
            <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-0.5 text-xs font-mono tracking-widest uppercase bg-ink-900/70 text-ink-300 border border-white/10">
              <Clock className="w-3 h-3 text-ink-400 mr-1" />
              <span>{movie.duration}</span>
            </span>
            <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-0.5 text-xs font-mono tracking-widest uppercase bg-ink-900/70 text-ink-300 border border-white/10">
              <Globe className="w-3 h-3 text-ink-400 mr-1" />
              <span>{movie.language}</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08] text-balance">
            {movie.title}
          </h1>

          {/* Description */}
          <p className="text-ink-300 text-sm sm:text-base font-light leading-relaxed line-clamp-3 max-w-xl">
            {movie.description}
          </p>

          {/* Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <WatchButton movie={movie} variant="hero" label="Begin Screening" />

            <Link
              to={`/movie/${movie.slug}`}
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-ink-900/80 text-ink-200 hover:text-white font-mono text-xs uppercase tracking-widest border border-white/15 hover:border-white/30 transition-all rounded-sm"
            >
              <Info className="w-4 h-4 text-ink-400" />
              <span>Film Overview</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
