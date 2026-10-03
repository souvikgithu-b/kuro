import { useState, useEffect, useCallback } from 'react';
import type { Movie, MovieFilterParams } from '../types/movie';
import { getPublishedMovies, getAllMoviesAdmin } from '../lib/movies';

export function usePublishedMovies(initialFilters?: MovieFilterParams) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MovieFilterParams>(initialFilters || {});

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublishedMovies(filters);
      setMovies(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load movie catalogue');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return {
    movies,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchMovies,
  };
}

export function useAdminMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllMoviesAdmin();
      setMovies(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load movies for admin');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminMovies();
  }, [fetchAdminMovies]);

  return {
    movies,
    loading,
    error,
    refetch: fetchAdminMovies,
  };
}
