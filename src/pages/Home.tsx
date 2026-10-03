import React, { useState, useMemo } from 'react';
import { usePublishedMovies } from '../hooks/useMovies';
import { MovieHero } from '../components/MovieHero';
import { MovieGrid } from '../components/MovieGrid';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import type { MovieFilterParams } from '../types/movie';
import { BRAND_CONFIG } from '../config/brand';
import { useTrackPageView } from '../hooks/useAnalytics';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  // Track page view for general home portal
  useTrackPageView(null);

  const { movies, loading } = usePublishedMovies();
  const [filters, setFilters] = useState<MovieFilterParams>({});

  // Pick featured movie for the hero banner (first with featured = true, or first in list)
  const featuredMovie = useMemo(() => {
    return movies.find((m) => m.featured) || movies[0];
  }, [movies]);

  // Filter movies for the grid below hero
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.genre.toLowerCase().includes(q) ||
          (m.director && m.director.toLowerCase().includes(q))
      );
    }

    if (filters.genre && filters.genre !== 'All') {
      result = result.filter((m) => m.genre.toLowerCase().includes(filters.genre!.toLowerCase()));
    }

    if (filters.release_year) {
      result = result.filter((m) => m.release_year === Number(filters.release_year));
    }

    if (filters.language && filters.language !== 'All') {
      result = result.filter((m) => m.language.toLowerCase().includes(filters.language!.toLowerCase()));
    }

    return result;
  }, [movies, filters]);

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100 flex flex-col">
      {/* Hero Section */}
      {featuredMovie && <MovieHero movie={featuredMovie} />}

      {/* Main Content Catalog */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-10">
        {/* Section Header with Search & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="hanko-stamp">{BRAND_CONFIG.stampText}</span>
              <span className="text-xs font-mono tracking-widest uppercase text-ink-400">
                Latest Additions
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Archive Catalogue
            </h2>
            <p className="text-xs text-ink-400 font-mono">
              Independent cinematic works and direct destination screenings.
            </p>
          </div>

          {/* Search bar */}
          <div className="w-full md:w-auto md:min-w-[320px]">
            <SearchBar
              value={filters.search || ''}
              onChange={(search) => setFilters({ ...filters, search })}
              placeholder="Search catalogue titles..."
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-ink-900/40 p-4 border border-white/[0.06] rounded-sm">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
          />
        </div>

        {/* Results Counter and View All link */}
        <div className="flex items-center justify-between text-xs font-mono text-ink-400">
          <div>
            Showing <span className="text-white font-semibold">{filteredMovies.length}</span>{' '}
            {filteredMovies.length === 1 ? 'film screening' : 'film screenings'}
          </div>

          <Link
            to="/movies"
            className="flex items-center space-x-1.5 text-ink-300 hover:text-white transition-colors"
          >
            <span>View Full Archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Poster Grid */}
        <MovieGrid
          movies={filteredMovies}
          loading={loading}
          onResetFilters={() => setFilters({})}
        />

        {/* Curated Editorial Strip / Concept Statement */}
        <div className="mt-16 p-8 sm:p-12 bg-ink-900/30 border border-white/[0.07] rounded-sm grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="space-y-2">
            <span className="text-xs font-mono text-vermilion uppercase tracking-widest">
              01 // Archival Concept
            </span>
            <h3 className="font-serif text-xl font-bold text-white">
              Individual Destination Screening
            </h3>
            <p className="text-xs text-ink-400 font-light leading-relaxed">
              Every title features an individual 3-step link verification pathway prior to streaming playback.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono text-ink-400 uppercase tracking-widest">
              02 // Legal & Authorized
            </span>
            <h3 className="font-serif text-xl font-bold text-white">
              Independent Distribution
            </h3>
            <p className="text-xs text-ink-400 font-light leading-relaxed">
              Only content that the site owner has the legal rights or authorized distribution permissions to screen.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono text-ink-400 uppercase tracking-widest">
              03 // Generic Integration
            </span>
            <h3 className="font-serif text-xl font-bold text-white">
              Modular Monetization
            </h3>
            <p className="text-xs text-ink-400 font-light leading-relaxed">
              Flexible provider architecture supporting Monetag SmartLinks or custom link verification flows.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
