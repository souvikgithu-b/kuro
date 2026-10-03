import React from 'react';
import type { Movie } from '../types/movie';
import { MovieCard } from './MovieCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  onResetFilters?: () => void;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  loading = false,
  emptyTitle = 'No screenings found',
  emptySubtitle = 'Try adjusting your search query or filter tags to discover other cinema titles.',
  onResetFilters,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <LoadingSkeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        subtitle={emptySubtitle}
        actionLabel={onResetFilters ? 'Clear Filter Tags' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {movies.map((movie, index) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          priority={index < 5}
        />
      ))}
    </div>
  );
};
