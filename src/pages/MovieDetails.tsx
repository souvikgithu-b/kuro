import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMovieBySlug, getPublishedMovies } from '../lib/movies';
import type { Movie } from '../types/movie';
import { WatchButton } from '../components/WatchButton';
import { MovieCard } from '../components/MovieCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { BRAND_CONFIG } from '../config/brand';
import { useTrackPageView } from '../hooks/useAnalytics';
import {
  Clock,
  Globe,
  Share2,
  Shield,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const MovieDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Track page view for this specific movie
  useTrackPageView(movie?.id);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!slug) return;
      setLoading(true);
      setError(null);

      try {
        const found = await getMovieBySlug(slug);
        if (!mounted) return;

        if (!found) {
          setError('Movie screening not found in the archive.');
          setMovie(null);
        } else {
          setMovie(found);

          // Update Document Title and Meta tags for SEO
          document.title = `${found.title} (${found.release_year}) — ${BRAND_CONFIG.name}`;

          // Fetch related movies in same genre
          const all = await getPublishedMovies({ genre: found.genre });
          if (mounted) {
            setRelatedMovies(all.filter((m) => m.id !== found.id).slice(0, 5));
          }
        }
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Error fetching movie details');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
      document.title = `${BRAND_CONFIG.name} // ${BRAND_CONFIG.kanji} — ${BRAND_CONFIG.tagline}`;
    };
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 p-8 max-w-7xl mx-auto space-y-8">
        <LoadingSkeleton variant="hero" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-ink-950 py-16 px-4">
        <ErrorState
          title="Screening Not Found"
          message={error || 'The requested film could not be located in our archive database.'}
          onRetry={() => navigate('/movies')}
        />
        <div className="text-center mt-4">
          <Link
            to="/movies"
            className="text-xs font-mono tracking-widest uppercase text-ink-300 hover:text-white"
          >
            ← Return to Full Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100 pb-20">
      {/* Backdrop Header with Vignette & Grayscale Texture */}
      <div className="relative w-full h-[50vh] sm:h-[60vh] max-h-[620px] overflow-hidden bg-ink-950 select-none">
        <img
          src={movie.backdrop_url || movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover object-center filter grayscale contrast-125 opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/40 to-transparent" />

        {/* Back Link */}
        <div className="absolute top-6 left-4 sm:left-8 z-20">
          <Link
            to="/movies"
            className="inline-flex items-center space-x-2 px-3 py-1.5 bg-ink-900/80 text-ink-300 hover:text-white border border-white/10 rounded-sm text-xs font-mono tracking-wider transition-all backdrop-blur-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Catalogue</span>
          </Link>
        </div>
      </div>

      {/* Main Details Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-36 sm:-mt-48 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Poster Image */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col items-center sm:items-start">
            <div className="w-64 sm:w-80 lg:w-full aspect-[2/3] bg-ink-900 border-2 border-white/15 rounded-sm overflow-hidden shadow-2xl relative group">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute top-3 left-3">
                <span className="hanko-stamp">{BRAND_CONFIG.stampText}</span>
              </div>
            </div>

            {/* Quick Share and Legal Protection notice */}
            <div className="w-64 sm:w-80 lg:w-full mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center space-x-1.5 text-xs font-mono text-ink-400 hover:text-white transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Screening</span>
                  </>
                )}
              </button>

              <div className="flex items-center space-x-1 text-[11px] font-mono text-ink-500">
                <Shield className="w-3 h-3" />
                <span>Verified Legal</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Synopsis, Metadata, and Primary Screening Button */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-6 pt-2">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono tracking-widest uppercase bg-white text-ink-950 font-bold rounded-sm">
                {movie.release_year}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono tracking-widest uppercase bg-ink-900 text-ink-200 border border-white/10 rounded-sm">
                {movie.genre}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono tracking-widest uppercase bg-ink-900 text-ink-300 border border-white/10 rounded-sm">
                {movie.content_type.toUpperCase()}
              </span>
              {movie.source_type === 'uploaded' ? (
                <span className="px-2.5 py-0.5 text-xs font-mono tracking-widest uppercase bg-ink-900 text-white border border-white/20 rounded-sm">
                  Direct Player
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-mono tracking-widest uppercase bg-ink-900 text-ink-300 border border-white/10 rounded-sm">
                  External Destination
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              {movie.title}
            </h1>

            {/* Director & Language strip */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-ink-400 pb-3 border-b border-white/[0.08]">
              {movie.director && (
                <div>
                  <span className="text-ink-500 uppercase tracking-wider mr-1.5">Director:</span>
                  <span className="text-ink-200 font-semibold">{movie.director}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-ink-400" />
                <span>{movie.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-ink-400" />
                <span>{movie.language}</span>
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono tracking-widest uppercase text-ink-400">
                Synopsis
              </h3>
              <p className="text-ink-200 text-sm sm:text-base font-light leading-relaxed whitespace-pre-line">
                {movie.description}
              </p>
            </div>

            {/* Watch CTA Box: Launches the 3-step link flow */}
            <div className="p-6 bg-ink-900/60 border border-white/15 rounded-sm space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-vermilion tracking-widest uppercase font-semibold">
                    Screening Access Protocol
                  </span>
                  <h4 className="font-sans font-bold text-white text-base">
                    Ready to stream this cinema title?
                  </h4>
                  <p className="text-xs text-ink-400 font-mono">
                    Proceeds through 3 sequential link steps before the final video stream begins.
                  </p>
                </div>

                {/* Primary Watch Action */}
                <WatchButton
                  movie={movie}
                  variant="hero"
                  label="Begin Screening"
                  className="sm:self-center"
                />
              </div>

              {/* Informational note */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center space-x-2 text-[11px] font-mono text-ink-400">
                <Sparkles className="w-3.5 h-3.5 text-ink-300 shrink-0" />
                <span>
                  No account registration required for visitors. Free access for authorized viewing.
                </span>
              </div>
            </div>

            {/* Specification Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="p-3 bg-ink-900/30 border border-white/5 rounded-sm">
                <span className="text-[10px] font-mono text-ink-500 uppercase block">Year</span>
                <span className="text-xs font-mono font-semibold text-white">{movie.release_year}</span>
              </div>
              <div className="p-3 bg-ink-900/30 border border-white/5 rounded-sm">
                <span className="text-[10px] font-mono text-ink-500 uppercase block">Duration</span>
                <span className="text-xs font-mono font-semibold text-white">{movie.duration}</span>
              </div>
              <div className="p-3 bg-ink-900/30 border border-white/5 rounded-sm">
                <span className="text-[10px] font-mono text-ink-500 uppercase block">Audio</span>
                <span className="text-xs font-mono font-semibold text-white truncate block">{movie.language}</span>
              </div>
              <div className="p-3 bg-ink-900/30 border border-white/5 rounded-sm">
                <span className="text-[10px] font-mono text-ink-500 uppercase block">Archival Type</span>
                <span className="text-xs font-mono font-semibold text-white">4K Master</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Screenings Strip */}
        {relatedMovies.length > 0 && (
          <section className="mt-20 pt-10 border-t border-white/[0.08] space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-ink-500">
                  Related Archive
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  More in {movie.genre}
                </h3>
              </div>
              <Link
                to={`/movies?genre=${encodeURIComponent(movie.genre)}`}
                className="text-xs font-mono uppercase tracking-wider text-ink-300 hover:text-white transition-colors"
              >
                View Category →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedMovies.map((rel) => (
                <MovieCard key={rel.id} movie={rel} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
