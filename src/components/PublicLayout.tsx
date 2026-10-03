import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SearchBar } from './SearchBar';
import { X } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseConfig';

export const PublicLayout: React.FC = () => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      navigate(`/movies?search=${encodeURIComponent(query.trim())}`);
      setSearchModalOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100 flex flex-col font-sans selection:bg-vermilion selection:text-white">
      <Navbar onOpenSearch={() => setSearchModalOpen(true)} />
      {!isSupabaseConfigured() && (
        <div className="border-b border-vermilion/20 bg-ink-900/80 px-4 py-2 text-center text-[10px] font-mono uppercase tracking-wider text-ink-300">
          <span className="font-bold text-vermilion">Demo Catalog</span>
          <span className="mx-2 text-ink-500">/</span>
          Sample entries and media for local development
        </div>
      )}

      {/* Global Quick Search Overlay Modal */}
      {searchModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search Films"
          className="fixed inset-0 z-50 bg-ink-950/85 backdrop-blur-md flex items-start justify-center pt-24 px-4 animate-fade-in"
        >
          <div className="w-full max-w-xl space-y-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-mono tracking-widest uppercase text-ink-400">
                Search Archive
              </span>
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="text-ink-400 hover:text-white p-1"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <SearchBar
              value={searchQuery}
              onChange={handleSearchSubmit}
              autoFocus={true}
              placeholder="Type movie title and press Enter..."
            />

            <p className="text-[11px] font-mono text-ink-500">
              Press <kbd className="px-1 py-0.5 bg-ink-900 border border-white/10 rounded">Esc</kbd> to exit.
            </p>
          </div>
        </div>
      )}

      <div className="flex-1">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
};
