import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMovieBySlug, getMovieWatchFlow } from '../lib/movies';
import { getPublicMonetizationSettings } from '../lib/monetization';
import type { Movie } from '../types/movie';
import type { MonetizationSettings } from '../types/monetization';
import { VideoPlayer } from '../components/VideoPlayer';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { trackEvent } from '../lib/analytics';
import { BRAND_CONFIG } from '../config/brand';
import {
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Play,
  Film,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

type FlowStep = 'step_1' | 'step_2' | 'step_3' | 'ready';

export const Watch: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [monetization, setMonetization] = useState<MonetizationSettings | null>(null);
  const [currentStep, setCurrentStep] = useState<FlowStep>('step_1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load movie and global monetization settings
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!slug) return;
      setLoading(true);
      setError(null);

      try {
        const [foundMovie, globalSettings] = await Promise.all([
          getMovieBySlug(slug),
          getPublicMonetizationSettings(),
        ]);

        if (!mounted) return;

        if (!foundMovie) {
          setError('Movie screening not found.');
          setMovie(null);
        } else {
          const watchFlow = await getMovieWatchFlow(slug);
          if (!mounted) return;
          if (!watchFlow) {
            setError('This movie is not available for screening.');
            setMovie(null);
            return;
          }
          setMovie({
            ...foundMovie,
            ...watchFlow,
            movie_links: watchFlow.movie_links || undefined,
          });
          setMonetization(globalSettings);

          // Update Document Title
          document.title = `Screening Flow: ${foundMovie.title} — ${BRAND_CONFIG.name}`;
        }
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Error initializing screening flow');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 p-8 max-w-4xl mx-auto flex items-center justify-center">
        <LoadingSkeleton variant="hero" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-ink-950 py-16 px-4">
        <ErrorState
          title="Screening Unavailable"
          message={error || 'Unable to load the requested screening destination.'}
          onRetry={() => navigate('/movies')}
        />
        <div className="text-center mt-4">
          <Link
            to="/movies"
            className="text-xs font-mono tracking-widest uppercase text-ink-300 hover:text-white"
          >
            ← Back to Archive
          </Link>
        </div>
      </div>
    );
  }

  // Determine the effective step URLs (movie-specific link first, then global monetization fallback if enabled)
  const links = movie.movie_links;
  const step1Url = links?.step_1_url || (monetization?.enabled ? monetization.step_1_url : null);
  const step2Url = links?.step_2_url || (monetization?.enabled ? monetization.step_2_url : null);
  const step3Url = links?.step_3_url || (monetization?.enabled ? monetization.step_3_url : null);

  // Final destination
  const effectiveFinalUrl =
    links?.final_destination_type === 'custom_url' && links.final_url
      ? links.final_url
      : movie.source_type === 'uploaded'
      ? movie.video_url
      : movie.external_video_url;

  // STEP 1 HANDLER
  const handleStep1Continue = () => {
    trackEvent('step_1_click', movie.id);

    // Open Step 1 URL in new tab if configured
    if (step1Url) {
      window.open(step1Url, '_blank', 'noopener,noreferrer');
    }

    // Advance to Step 2
    setCurrentStep('step_2');
  };

  // STEP 2 HANDLER
  const handleStep2Continue = () => {
    trackEvent('step_2_click', movie.id);

    // Open Step 2 URL in new tab if configured
    if (step2Url) {
      window.open(step2Url, '_blank', 'noopener,noreferrer');
    }

    // Advance to Step 3
    setCurrentStep('step_3');
  };

  // STEP 3 HANDLER
  const handleStep3Continue = () => {
    trackEvent('step_3_click', movie.id);

    // Open Step 3 URL in new tab if configured
    if (step3Url) {
      window.open(step3Url, '_blank', 'noopener,noreferrer');
    }

    // Advance to final ready video destination
    setCurrentStep('ready');
    trackEvent('final_destination_click', movie.id);
  };

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100 py-10 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <Link
            to={`/movie/${movie.slug}`}
            className="inline-flex items-center space-x-2 text-xs font-mono text-ink-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Film Overview</span>
          </Link>

          <div className="flex items-center space-x-2">
            <span className="hanko-stamp">{BRAND_CONFIG.stampText}</span>
            <span className="text-[11px] font-mono text-ink-400 uppercase tracking-widest hidden sm:inline">
              Screening Gateway
            </span>
          </div>
        </div>

        {/* Screening Header */}
        <div className="flex items-center space-x-4 bg-ink-900/40 p-4 border border-white/[0.08] rounded-sm">
          <div className="w-16 h-24 bg-ink-950 border border-white/10 rounded-sm overflow-hidden shrink-0">
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-full h-full object-cover filter grayscale"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 text-[10px] font-mono text-ink-400 uppercase mb-0.5">
              <span>{movie.release_year}</span>
              <span>•</span>
              <span>{movie.genre}</span>
              <span>•</span>
              <span>{movie.duration}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-serif font-bold text-white truncate">
              {movie.title}
            </h1>
            <p className="text-xs text-ink-400 font-mono mt-0.5">
              Individual movie destination flow
            </p>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
          {/* Step 1 Pill */}
          <div
            className={`p-3 border rounded-sm transition-all ${
              currentStep === 'step_1'
                ? 'bg-white text-ink-950 border-white font-bold shadow-lg'
                : currentStep === 'step_2' || currentStep === 'step_3' || currentStep === 'ready'
                ? 'bg-ink-900/90 text-emerald-400 border-emerald-500/30 font-medium'
                : 'bg-ink-900/40 text-ink-500 border-white/5'
            }`}
          >
            <div className="text-[10px] font-mono tracking-widest uppercase">Step 01</div>
              <div className="text-xs font-sans mt-0.5 flex items-center justify-center space-x-1">
              {currentStep !== 'step_1' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              <span>Destination 1</span>
            </div>
          </div>

          {/* Step 2 Pill */}
          <div
            className={`p-3 border rounded-sm transition-all ${
              currentStep === 'step_2'
                ? 'bg-white text-ink-950 border-white font-bold shadow-lg'
                : currentStep === 'step_3' || currentStep === 'ready'
                ? 'bg-ink-900/90 text-emerald-400 border-emerald-500/30 font-medium'
                : 'bg-ink-900/40 text-ink-500 border-white/5'
            }`}
          >
            <div className="text-[10px] font-mono tracking-widest uppercase">Step 02</div>
            <div className="text-xs font-sans mt-0.5 flex items-center justify-center space-x-1">
              {(currentStep === 'step_3' || currentStep === 'ready') && (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              )}
              <span>Destination 2</span>
            </div>
          </div>

          {/* Step 3 Pill */}
          <div
            className={`p-3 border rounded-sm transition-all ${
              currentStep === 'step_3'
                ? 'bg-white text-ink-950 border-white font-bold shadow-lg'
                : currentStep === 'ready'
                ? 'bg-ink-900/90 text-emerald-400 border-emerald-500/30 font-medium'
                : 'bg-ink-900/40 text-ink-500 border-white/5'
            }`}
          >
            <div className="text-[10px] font-mono tracking-widest uppercase">Step 03</div>
            <div className="text-xs font-sans mt-0.5 flex items-center justify-center space-x-1">
              {currentStep === 'ready' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              <span>Destination 3</span>
            </div>
          </div>

          {/* Step 4: Final Ready Pill */}
          <div
            className={`p-3 border rounded-sm transition-all ${
              currentStep === 'ready'
                ? 'bg-white text-ink-950 border-white font-bold shadow-lg'
                : 'bg-ink-900/40 text-ink-500 border-white/5'
            }`}
          >
            <div className="text-[10px] font-mono tracking-widest uppercase">Final</div>
            <div className="text-xs font-sans mt-0.5">Movie</div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERMEDIATE STEP 1 */}
        {/* ========================================================================= */}
        {currentStep === 'step_1' && (
          <div className="p-8 sm:p-12 bg-ink-900/70 border border-white/15 rounded-sm text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-ink-800 border border-white/15 flex items-center justify-center text-white">
              <Film className="w-8 h-8 stroke-1" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="text-xs font-mono text-vermilion tracking-widest uppercase font-semibold">
                Step 1 of 3
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Ready to watch?
              </h2>
              <p className="text-xs sm:text-sm text-ink-300 font-mono leading-relaxed">
                Continue opens the configured Step 1 destination in a new tab. Use this page to proceed to Step 2 when ready.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleStep1Continue}
                className="w-full sm:w-auto px-10 py-4 bg-white text-ink-950 hover:bg-ink-100 font-bold text-sm uppercase tracking-widest border border-white transition-all shadow-xl active:scale-[0.98] inline-flex items-center justify-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

            {step1Url && (
              <p className="text-[11px] font-mono text-ink-500 pt-2">
                External Link: {step1Url.replace(/^https?:\/\//, '').split('/')[0]}...
              </p>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* INTERMEDIATE STEP 2 */}
        {/* ========================================================================= */}
        {currentStep === 'step_2' && (
          <div className="p-8 sm:p-12 bg-ink-900/70 border border-white/15 rounded-sm text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-ink-800 border border-white/15 flex items-center justify-center text-white">
              <Sparkles className="w-8 h-8 stroke-1 text-ink-200" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="text-xs font-mono text-vermilion tracking-widest uppercase font-semibold">
                Step 2 of 3
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Continue to Step 2
              </h2>
              <p className="text-xs sm:text-sm text-ink-300 font-mono leading-relaxed">
                Continue opens the configured Step 2 destination in a new tab. Use this page to proceed to Step 3 when ready.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleStep2Continue}
                className="w-full sm:w-auto px-10 py-4 bg-white text-ink-950 hover:bg-ink-100 font-bold text-sm uppercase tracking-widest border border-white transition-all shadow-xl active:scale-[0.98] inline-flex items-center justify-center space-x-2"
              >
                <span>Proceed</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

            {step2Url && (
              <p className="text-[11px] font-mono text-ink-500 pt-2">
                Destination: {step2Url.replace(/^https?:\/\//, '').split('/')[0]}...
              </p>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* INTERMEDIATE STEP 3 */}
        {/* ========================================================================= */}
        {currentStep === 'step_3' && (
          <div className="p-8 sm:p-12 bg-ink-900/70 border border-white/15 rounded-sm text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-ink-800 border border-white/15 flex items-center justify-center text-white">
              <CheckCircle2 className="w-8 h-8 stroke-1 text-emerald-400" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase font-semibold">
                Step 3 of 3
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Continue to the Movie
              </h2>
              <p className="text-xs sm:text-sm text-ink-300 font-mono leading-relaxed">
                Continue opens the configured Step 3 destination. The selected movie destination will then be shown here.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleStep3Continue}
                className="w-full sm:w-auto px-10 py-4 bg-white text-ink-950 hover:bg-ink-100 font-bold text-sm uppercase tracking-widest border border-white transition-all shadow-xl active:scale-[0.98] inline-flex items-center justify-center space-x-2"
              >
                <span>Next Step</span>
                <Play className="w-4 h-4 ml-1 fill-ink-950" />
              </button>

            </div>

            {step3Url && (
              <p className="text-[11px] font-mono text-ink-500 pt-2">
                Destination: {step3Url.replace(/^https?:\/\//, '').split('/')[0]}...
              </p>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* FINAL DESTINATION: VIDEO PLAYER / STREAM */}
        {/* ========================================================================= */}
        {currentStep === 'ready' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-sm flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-mono text-emerald-200">
                  Movie destination ready
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                READY
              </span>
            </div>

            {/* Embedded Video Player */}
            <div className="bg-ink-900 border border-white/20 rounded-sm overflow-hidden shadow-2xl">
              <VideoPlayer
                sourceType={movie.source_type}
                videoUrl={movie.video_url}
                externalUrl={effectiveFinalUrl}
                title={movie.title}
                posterUrl={movie.backdrop_url || movie.poster_url}
                autoPlay={true}
              />
            </div>

            {/* Stream Details & External launch option */}
            <div className="p-6 bg-ink-900/40 border border-white/[0.08] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-white">{movie.title}</h3>
                <p className="text-xs font-mono text-ink-400">
                  {movie.release_year} • {movie.genre} • {movie.duration} • {movie.language}
                </p>
              </div>

              {effectiveFinalUrl && (
                <a
                  href={effectiveFinalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ink-btn-secondary px-4 py-2.5 text-xs font-mono uppercase tracking-wider inline-flex items-center justify-center space-x-2"
                >
                  <span>Open Direct Destination</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Security & Disclaimer Footer */}
        <div className="p-4 bg-ink-900/20 border border-white/5 rounded-sm text-center text-xs font-mono text-ink-500 flex items-center justify-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-ink-400" />
          <span>
            KURO Cinema Archive — Only authorized & legal distributions. No piracy or DRM circumvention.
          </span>
        </div>
      </div>
    </div>
  );
};
