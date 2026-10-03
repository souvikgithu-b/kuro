import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdminMovies } from '../hooks/useMovies';
import { deleteMovie, togglePublishMovie } from '../lib/movies';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  PlusCircle,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  Play,
} from 'lucide-react';

export const Movies: React.FC = () => {
  const { movies, loading, refetch } = useAdminMovies();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetTitle, setDeleteTargetTitle] = useState<string>('');

  const filteredMovies = useMemo(() => {
    let result = [...movies];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genre.toLowerCase().includes(q) ||
          m.slug.toLowerCase().includes(q)
      );
    }

    if (statusFilter === 'published') {
      result = result.filter((m) => m.is_published);
    } else if (statusFilter === 'draft') {
      result = result.filter((m) => !m.is_published);
    }

    return result;
  }, [movies, search, statusFilter]);

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await togglePublishMovie(id, !currentStatus);
      toast.success(
        !currentStatus ? 'Movie Published' : 'Moved to Drafts',
        'Visitor access state changed.'
      );
      refetch();
    } catch (err: any) {
      toast.error('Failed to change publish status', err?.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteMovie(deleteTargetId);
      toast.success('Movie Deleted', `"${deleteTargetTitle}" was permanently removed.`);
      setDeleteTargetId(null);
      refetch();
    } catch (err: any) {
      toast.error('Failed to delete movie', err?.message);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Movie Management
          </h1>
          <p className="text-xs font-mono text-ink-400 mt-1">
            Manage movie listings, link routing steps, video destinations, and public states.
          </p>
        </div>

        <Link
          to="/admin/movies/new"
          className="ink-btn-primary px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-sm inline-flex items-center space-x-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Movie</span>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-ink-900/40 p-3.5 border border-white/[0.06] rounded-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, genre, or slug..."
            className="w-full pl-9 pr-3 py-1.5 bg-ink-950 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-sm uppercase tracking-wider ${
              statusFilter === 'all'
                ? 'bg-white text-ink-950 font-bold'
                : 'text-ink-400 hover:text-white bg-ink-950 border border-white/5'
            }`}
          >
            All ({movies.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-sm uppercase tracking-wider ${
              statusFilter === 'published'
                ? 'bg-white text-ink-950 font-bold'
                : 'text-ink-400 hover:text-white bg-ink-950 border border-white/5'
            }`}
          >
            Published ({movies.filter((m) => m.is_published).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-sm uppercase tracking-wider ${
              statusFilter === 'draft'
                ? 'bg-white text-ink-950 font-bold'
                : 'text-ink-400 hover:text-white bg-ink-950 border border-white/5'
            }`}
          >
            Drafts ({movies.filter((m) => !m.is_published).length})
          </button>
        </div>
      </div>

      {/* Movies Table */}
      <div className="bg-ink-900/60 border border-white/10 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-mono uppercase tracking-widest text-ink-400 bg-ink-950/60">
                <th className="py-3 px-4">Poster</th>
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">Year / Genre</th>
                <th className="py-3 px-4">Video Source</th>
                <th className="py-3 px-4">Links Configured</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-mono">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <LoadingSkeleton key={i} variant="table-row" />
                ))
              ) : filteredMovies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-500">
                    No movies match the selected search or filter.
                  </td>
                </tr>
              ) : (
                filteredMovies.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Poster */}
                    <td className="py-3 px-4">
                      <div className="w-10 h-14 bg-ink-950 border border-white/10 rounded-sm overflow-hidden shrink-0">
                        <img
                          src={m.poster_url}
                          alt=""
                          className="w-full h-full object-cover filter grayscale"
                        />
                      </div>
                    </td>

                    {/* Title & Slug */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-sans font-bold text-white text-sm line-clamp-1">{m.title}</div>
                      <div className="text-[11px] text-ink-500 font-mono">/{m.slug}</div>
                      <div className="text-[10px] text-ink-400 truncate mt-0.5">{m.duration} • {m.language}</div>
                    </td>

                    {/* Year / Genre */}
                    <td className="py-3 px-4 text-ink-300">
                      <div>{m.release_year}</div>
                      <div className="text-[10px] text-ink-500">{m.genre}</div>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase bg-ink-950 border border-white/10 rounded-sm text-ink-300">
                        {m.source_type === 'uploaded' ? 'Uploaded File' : 'External Stream'}
                      </span>
                    </td>

                    {/* Link steps */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1 text-[10px] font-mono">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            m.movie_links?.step_1_url ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-ink-800 text-ink-500'
                          }`}
                          title="Step 1 URL"
                        >
                          1
                        </span>
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            m.movie_links?.step_2_url ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-ink-800 text-ink-500'
                          }`}
                          title="Step 2 URL"
                        >
                          2
                        </span>
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            m.movie_links?.step_3_url ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-ink-800 text-ink-500'
                          }`}
                          title="Step 3 URL"
                        >
                          3
                        </span>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(m.id, m.is_published)}
                        className={`px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-sm border transition-colors ${
                          m.is_published
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/80'
                            : 'bg-amber-950/60 text-amber-400 border-amber-500/30 hover:bg-amber-900/80'
                        }`}
                      >
                        {m.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Live Preview */}
                        <Link
                          to={`/movie/${m.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-ink-400 hover:text-white transition-colors"
                          title="Preview Film"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Test Screening Flow */}
                        <Link
                          to={`/watch/${m.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-ink-400 hover:text-white transition-colors"
                          title="Test 3-Step Flow"
                        >
                          <Play className="w-4 h-4" />
                        </Link>

                        {/* Edit Movie & Manage Links */}
                        <Link
                          to={`/admin/movies/${m.id}/edit`}
                          className="p-1.5 text-ink-400 hover:text-white transition-colors"
                          title="Edit Details & Links"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTargetId(m.id);
                            setDeleteTargetTitle(m.title);
                          }}
                          className="p-1.5 text-ink-400 hover:text-vermilion transition-colors"
                          title="Delete Movie"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Movie Screening"
        message={`Are you sure you want to permanently delete "${deleteTargetTitle}"? This will also remove all configured step links and analytics history.`}
        confirmLabel="Delete Permanently"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
