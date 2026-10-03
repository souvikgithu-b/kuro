import React from 'react';
import { MovieForm } from './MovieForm';
import { createMovie } from '../lib/movies';
import type { MovieFormData } from '../types/movie';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AddMovie: React.FC = () => {
  const handleCreate = async (formData: MovieFormData) => {
    await createMovie(formData);
  };

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
            Add New Movie
          </h1>
          <p className="text-xs font-mono text-ink-400 mt-0.5">
            Create an archival cinema entry with metadata, upload video or external link, and 3-step routing.
          </p>
        </div>
      </div>

      <MovieForm onSubmit={handleCreate} submitLabel="Publish Screening" />
    </div>
  );
};
