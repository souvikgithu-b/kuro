import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MovieForm } from './MovieForm';
import { getMovieById, updateMovie } from '../lib/movies';
import type { Movie, MovieFormData } from '../types/movie';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { ArrowLeft } from 'lucide-react';

export const EditMovie: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const found = await getMovieById(id);
        if (!found) {
          setError('Movie not found');
        } else {
          setMovie(found);
        }
      } catch (err: any) {
        setError(err?.message || 'Error fetching movie');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleUpdate = async (formData: MovieFormData) => {
    if (!id) return;
    await updateMovie(id, formData);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="hero" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <ErrorState
        title="Movie Not Found"
        message={error || 'Unable to locate movie for editing.'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-white/[0.08]">
        <Link
          to="/admin/movies"
          className="p-1.5 text-ink-400 hover:text-white transition-colors"
          title="Back to Movies"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Edit Film: {movie.title}
          </h1>
          <p className="text-xs font-mono text-ink-400 mt-0.5">
            Update movie metadata, replacement video files, or individual 3-step routing links.
          </p>
        </div>
      </div>

      <MovieForm
        initialMovie={movie}
        onSubmit={handleUpdate}
        submitLabel="Update Movie"
        isEditing={true}
      />
    </div>
  );
};
