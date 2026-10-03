import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminMovies } from '../hooks/useMovies';
import { useAnalyticsData } from '../hooks/useAnalytics';
import { getMonetizationSettings } from '../lib/monetization';
import type { MonetizationSettings } from '../types/monetization';
import { togglePublishMovie } from '../lib/movies';
import { useToast } from '../components/Toast';
import { BRAND_CONFIG } from '../config/brand';
import {
  Film,
  CheckCircle2,
  Clock,
  MousePointerClick,
  Eye,
  PlusCircle,
  Coins,
  ExternalLink,
  Edit,
  ArrowRight,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { movies, refetch } = useAdminMovies();
  const { data: analytics } = useAnalyticsData();
  const [monetization, setMonetization] = useState<MonetizationSettings | null>(null);
  const toast = useToast();

  useEffect(() => {
    getMonetizationSettings().then(setMonetization);
  }, []);

  const totalMovies = movies.length;
  const publishedMovies = movies.filter((m) => m.is_published).length;
  const draftMovies = totalMovies - publishedMovies;
  const totalClicks = analytics?.totalWatchClicks || 0;
  const todayViews = analytics?.todayViews || 0;

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await togglePublishMovie(id, !currentStatus);
      toast.success(
        !currentStatus ? 'Movie Published' : 'Movie Moved to Drafts',
        'Public catalogue visibility has been updated.'
      );
      refetch();
    } catch (err: any) {
      toast.error('Failed to update status', err?.message);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="hanko-stamp">{BRAND_CONFIG.stampText}</span>
            <span className="text-xs font-mono uppercase tracking-widest text-ink-400">
              Operations Center
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Admin Overview
          </h1>
          <p className="text-xs font-mono text-ink-400">
            Catalog administration, monetization routing, and conversion metrics.
          </p>
        </div>

        {/* Quick Add CTA */}
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/movies/new"
            className="ink-btn-primary px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-sm inline-flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Movie</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Movies */}
        <div className="p-5 bg-ink-900/60 border border-white/10 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-ink-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Movies</span>
            <Film className="w-4 h-4 text-ink-300" />
          </div>
          <div className="font-serif text-3xl font-bold text-white">{totalMovies}</div>
          <div className="text-[10px] font-mono text-ink-500">In database archive</div>
        </div>

        {/* Published */}
        <div className="p-5 bg-ink-900/60 border border-white/10 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-ink-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-serif text-3xl font-bold text-emerald-400">{publishedMovies}</div>
          <div className="text-[10px] font-mono text-ink-500">Visible to public visitors</div>
        </div>

        {/* Drafts */}
        <div className="p-5 bg-ink-900/60 border border-white/10 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-ink-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Drafts</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-serif text-3xl font-bold text-amber-400">{draftMovies}</div>
          <div className="text-[10px] font-mono text-ink-500">Pending review / unpublished</div>
        </div>

        {/* Total Link Clicks */}
        <div className="p-5 bg-ink-900/60 border border-white/10 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-ink-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Link Clicks</span>
            <MousePointerClick className="w-4 h-4 text-ink-300" />
          </div>
          <div className="font-serif text-3xl font-bold text-white">{totalClicks}</div>
          <div className="text-[10px] font-mono text-ink-500">Across 3-step screening flows</div>
        </div>

        {/* Today's Views */}
        <div className="p-5 bg-ink-900/60 border border-white/10 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-ink-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Today's Views</span>
            <Eye className="w-4 h-4 text-ink-300" />
          </div>
          <div className="font-serif text-3xl font-bold text-white">{todayViews}</div>
          <div className="text-[10px] font-mono text-ink-500">Visitors in last 24h</div>
        </div>
      </div>

      {/* Monetization Status Banner */}
      <div className="p-5 bg-ink-900/40 border border-white/10 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded bg-ink-850 border border-white/10 flex items-center justify-center text-ink-200 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-ink-400 uppercase tracking-wider">
                Active Provider:
              </span>
              <span className="text-xs font-mono font-bold text-white uppercase">
                {monetization?.provider_name || 'Monetag'}
              </span>
              <span
                className={`px-1.5 py-0.2 text-[9px] font-mono rounded ${
                  monetization?.enabled
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                    : 'bg-ink-800 text-ink-400'
                }`}
              >
                {monetization?.enabled ? 'ENABLED' : 'PAUSED'}
              </span>
            </div>
            <p className="text-xs text-ink-400 font-mono mt-0.5">
              Individual movie step links take precedence over global default settings.
            </p>
          </div>
        </div>

        <Link
          to="/admin/settings/monetization"
          className="ink-btn-secondary px-3.5 py-2 text-xs font-mono uppercase tracking-wider rounded-sm shrink-0 inline-flex items-center space-x-1.5 self-start md:self-auto"
        >
          <span>Configure Provider URLs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Recent Movies Table */}
      <div className="bg-ink-900/60 border border-white/10 rounded-sm overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center space-x-2">
            <Film className="w-4 h-4 text-ink-400" />
            <h2 className="font-serif text-lg font-bold text-white">Recent Cinema Titles</h2>
          </div>
          <Link
            to="/admin/movies"
            className="text-xs font-mono text-ink-400 hover:text-white uppercase tracking-wider"
          >
            Manage All ({movies.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-mono uppercase tracking-widest text-ink-400">
                <th className="py-2.5 px-3">Film</th>
                <th className="py-2.5 px-3">Year / Genre</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-mono">
              {movies.slice(0, 5).map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-12 bg-ink-950 border border-white/10 rounded-sm overflow-hidden shrink-0">
                        <img src={m.poster_url} alt="" className="w-full h-full object-cover filter grayscale" />
                      </div>
                      <div>
                        <div className="font-sans font-bold text-white text-sm line-clamp-1">{m.title}</div>
                        <div className="text-[10px] text-ink-500 font-mono">/{m.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-ink-300">
                    <div>{m.release_year}</div>
                    <div className="text-[10px] text-ink-500">{m.genre}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase bg-ink-950 border border-white/10 rounded-sm text-ink-300">
                      {m.source_type}
                    </span>
                  </td>
                  <td className="py-3 px-3">
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
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/movie/${m.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-ink-400 hover:text-white transition-colors"
                        title="Public Preview"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/admin/movies/${m.id}/edit`}
                        className="p-1.5 text-ink-400 hover:text-white transition-colors"
                        title="Edit Movie"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
