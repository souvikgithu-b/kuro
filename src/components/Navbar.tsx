import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BRAND_CONFIG } from '../config/brand';
import { Film, ShieldCheck, Menu, X, Search, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-ink-950/85 backdrop-blur-md border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Wordmark & Hanko Stamp */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="group flex items-center space-x-3.5 select-none">
              <div className="relative flex items-center justify-center w-10 h-10 bg-ink-900 border border-white/20 group-hover:border-white/50 transition-colors">
                <span className="font-serif text-2xl font-bold text-ink-100 group-hover:text-white transition-colors">
                  {BRAND_CONFIG.kanji}
                </span>
                <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-vermilion rounded-full group-hover:scale-125 transition-transform" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="font-sans font-extrabold tracking-widest text-lg sm:text-xl text-white">
                    {BRAND_CONFIG.name}
                  </span>
                  <span className="text-ink-500 font-mono text-xs hidden sm:inline">//</span>
                  <span className="text-ink-400 font-serif text-sm hidden sm:inline tracking-wider">
                    {BRAND_CONFIG.tagline}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="hanko-stamp">{BRAND_CONFIG.stampText}</span>
                  <span className="text-[10px] tracking-widest uppercase text-ink-400 font-mono hidden md:inline">
                    {BRAND_CONFIG.stampTextEn}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
            <Link
              to="/"
              className={`px-3.5 py-2 text-xs font-mono tracking-widest uppercase transition-colors rounded-sm ${
                isActive('/') && !location.search
                  ? 'text-white bg-white/[0.06] border border-white/10'
                  : 'text-ink-300 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              Archive
            </Link>
            <Link
              to="/movies"
              className={`px-3.5 py-2 text-xs font-mono tracking-widest uppercase transition-colors rounded-sm ${
                isActive('/movies')
                  ? 'text-white bg-white/[0.06] border border-white/10'
                  : 'text-ink-300 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              All Films
            </Link>
            <Link
              to="/movies?genre=Cyberpunk%20Noir"
              className="px-3.5 py-2 text-xs font-mono tracking-widest uppercase text-ink-300 hover:text-white hover:bg-white/[0.03] transition-colors rounded-sm"
            >
              Noir & Cyber
            </Link>
            <Link
              to="/movies?genre=Documentary"
              className="px-3.5 py-2 text-xs font-mono tracking-widest uppercase text-ink-300 hover:text-white hover:bg-white/[0.03] transition-colors rounded-sm"
            >
              Documentary
            </Link>
          </nav>

          {/* Actions: Search Button & Admin Portal Link */}
          <div className="flex items-center space-x-3">
            {onOpenSearch && (
              <button
                type="button"
                onClick={onOpenSearch}
                aria-label="Search films"
                className="flex items-center space-x-2 px-3 py-1.5 text-xs font-mono text-ink-300 bg-ink-900 border border-white/10 hover:border-white/25 hover:text-white transition-all rounded-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden lg:inline px-1 py-0.2 text-[10px] text-ink-400 bg-ink-800 rounded border border-white/10">
                  /
                </kbd>
              </button>
            )}

            <Link
              to="/admin"
              className="group flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono tracking-wider uppercase text-ink-300 hover:text-white bg-ink-900/80 border border-white/10 hover:border-vermilion/50 transition-all rounded-sm"
              title="Admin Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-ink-400 group-hover:text-vermilion transition-colors" />
              <span className="hidden sm:inline">Admin</span>
            </Link>

            {/* Mobile menu toggle button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-ink-300 hover:text-white hover:bg-ink-800 border border-white/10 rounded-sm transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-ink-950 border-b border-white/10 px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <span className="text-xs font-mono text-ink-400 uppercase tracking-widest">
              Navigation
            </span>
            <span className="hanko-stamp">{BRAND_CONFIG.stampText}</span>
          </div>

          <div className="grid grid-cols-1 gap-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 text-sm font-mono tracking-wider text-ink-100 hover:bg-ink-900 rounded"
            >
              <Film className="w-4 h-4 text-ink-400" />
              <span>Archive Home</span>
            </Link>
            <Link
              to="/movies"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 text-sm font-mono tracking-wider text-ink-100 hover:bg-ink-900 rounded"
            >
              <Sparkles className="w-4 h-4 text-ink-400" />
              <span>All Catalog</span>
            </Link>
            <Link
              to="/movies?genre=Cyberpunk%20Noir"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 text-sm font-mono tracking-wider text-ink-200 hover:bg-ink-900 rounded"
            >
              <span>Cyberpunk & Noir</span>
            </Link>
            <Link
              to="/movies?genre=Psychological%20Thriller"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 text-sm font-mono tracking-wider text-ink-200 hover:bg-ink-900 rounded"
            >
              <span>Psychological</span>
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 text-sm font-mono tracking-wider text-vermilion hover:bg-ink-900 rounded mt-2 border-t border-white/5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
