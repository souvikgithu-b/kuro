import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import type { MovieFilterParams } from '../types/movie';

interface FilterPanelProps {
  filters: MovieFilterParams;
  onChange: (newFilters: MovieFilterParams) => void;
  availableGenres?: string[];
  availableYears?: number[];
  availableLanguages?: string[];
}

const DEFAULT_GENRES = [
  'All',
  'Cyberpunk Noir',
  'Psychological Thriller',
  'Sci-Fi Mystery',
  'Documentary',
  'Neo-Noir',
  'Arthouse',
];

const DEFAULT_YEARS = [2026, 2025, 2024, 2023, 2022];
const DEFAULT_LANGUAGES = ['All', 'Japanese', 'English', 'German'];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  availableGenres = DEFAULT_GENRES,
  availableYears = DEFAULT_YEARS,
  availableLanguages = DEFAULT_LANGUAGES,
}) => {
  const hasActiveFilters = Boolean(
    (filters.genre && filters.genre !== 'All') ||
    filters.release_year ||
    (filters.language && filters.language !== 'All') ||
    filters.search
  );

  const handleGenreSelect = (genre: string) => {
    onChange({
      ...filters,
      genre: genre === 'All' ? undefined : genre,
    });
  };

  const handleYearSelect = (yearStr: string) => {
    onChange({
      ...filters,
      release_year: yearStr === 'All' ? undefined : Number(yearStr),
    });
  };

  const handleLanguageSelect = (lang: string) => {
    onChange({
      ...filters,
      language: lang === 'All' ? undefined : lang,
    });
  };

  const handleReset = () => {
    onChange({});
  };

  return (
    <div className="w-full space-y-4 py-3">
      {/* Genre Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
        <span className="text-[11px] font-mono uppercase tracking-widest text-ink-500 shrink-0 mr-1 flex items-center space-x-1">
          <Filter className="w-3 h-3" />
          <span className="hidden sm:inline">Genre:</span>
        </span>

        {availableGenres.map((genre) => {
          const isSelected =
            (!filters.genre && genre === 'All') ||
            filters.genre === genre;

          return (
            <button
              key={genre}
              type="button"
              onClick={() => handleGenreSelect(genre)}
              className={`px-3 py-1 text-xs font-mono tracking-wider rounded-sm shrink-0 transition-all ${
                isSelected
                  ? 'bg-white text-ink-950 font-semibold shadow-sm'
                  : 'bg-ink-900/80 text-ink-300 hover:text-white hover:bg-ink-800 border border-white/5'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Secondary dropdown row: Year, Language, and Reset button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.05]">
        <div className="flex flex-wrap items-center gap-3">
          {/* Year selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="filter-year" className="text-[11px] font-mono text-ink-400 uppercase tracking-wider">
              Year:
            </label>
            <select
              id="filter-year"
              value={filters.release_year || 'All'}
              onChange={(e) => handleYearSelect(e.target.value)}
              className="bg-ink-900 text-xs font-mono text-ink-200 border border-white/10 rounded-sm px-2.5 py-1 focus:outline-none focus:border-white/30"
            >
              <option value="All">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Language selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="filter-lang" className="text-[11px] font-mono text-ink-400 uppercase tracking-wider">
              Lang:
            </label>
            <select
              id="filter-lang"
              value={filters.language || 'All'}
              onChange={(e) => handleLanguageSelect(e.target.value)}
              className="bg-ink-900 text-xs font-mono text-ink-200 border border-white/10 rounded-sm px-2.5 py-1 focus:outline-none focus:border-white/30"
            >
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'All' ? 'All Languages' : lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1.5 text-xs font-mono tracking-wider text-ink-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
