import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePublishedMovies } from '../hooks/useMovies';
import { MovieGrid } from '../components/MovieGrid';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import type { MovieFilterParams } from '../types/movie';
import { BRAND_CONFIG } from '../config/brand';
import { SlidersHorizontal } from 'lucide-react';
import { useTrackPageView } from '../hooks/useAnalytics';

export const Movies: React.FC = () => {
  useTrackPageView(null);

  const [searchParams] = useSearchParams();
  const urlGenre = searchParams.get('genre');

  const { movies, loading } = usePublishedMovies();
  const [filters, setFilters] = useState<MovieFilterParams>({
    genre: urlGenre || undefined,
  });
  const [sortBy, setSortBy] = useState<'newest' | 'year' | 'title'>('newest');

  // Update filter if query parameter changes
  useEffect(() => {
    if (urlGenre) {
      setFilters((prev) => ({ ...prev, genre: urlGenre }));
    }
  }, [urlGenre]);

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

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'year') {
        return b.release_year - a.release_year;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      // 'newest' default by created_at
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [movies, filters, sortBy]);

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-2 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2">
            <span className="hanko-stamp">{BRAND_CONFIG.stampText}</span>
            <span className="text-xs font-mono tracking-widest uppercase text-ink-400">
              Complete Archive
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Cinematic Screenings Catalog
          </h1>
          <p className="text-sm text-ink-400 font-light max-w-2xl">
            Browse our complete collection of curated films, documentaries, and archival pieces with individual destination pathways.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 max-w-xl">
            <SearchBar
              value={filters.search || ''}
              onChange={(search) => setFilters({ ...filters, search })}
              placeholder="Search by title, director, or keyword..."
            />
          </div>

          <div className="flex items-center space-x-3 self-end md:self-auto">
            <label htmlFor="sort-select" className="text-xs font-mono text-ink-400 uppercase tracking-wider flex items-center space-x-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-ink-900 text-xs font-mono text-white border border-white/10 rounded-sm px-3 py-2 focus:outline-none focus:border-white/30"
            >
              <option value="newest">Recently Added</option>
              <option value="year">Release Year (Newest First)</option>
              <option value="title">Title (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="bg-ink-900/40 p-4 border border-white/[0.06] rounded-sm">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
          />
        </div>

        {/* Count Indicator */}
        <div className="text-xs font-mono text-ink-400">
          Archive contains <span className="text-white font-bold">{filteredMovies.length}</span> titles
          {filters.genre ? ` in "${filters.genre}"` : ''}
        </div>

        {/* Film Grid */}
        <MovieGrid
          movies={filteredMovies}
          loading={loading}
          onResetFilters={() => setFilters({})}
        />
      </div>
    </div>
  );
};
