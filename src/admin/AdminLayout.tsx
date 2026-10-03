import React, { useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BRAND_CONFIG } from '../config/brand';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  LayoutDashboard,
  Film,
  PlusCircle,
  Coins,
  BarChart3,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Database,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { admin, loading, logout } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If loading session
  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center text-ink-400 font-mono text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span>Verifying administrator credentials...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to /admin/login
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  const isNavActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'All Movies', path: '/admin/movies', icon: Film },
    { label: 'Add Movie', path: '/admin/movies/new', icon: PlusCircle },
    { label: 'Monetization', path: '/admin/settings/monetization', icon: Coins },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100 flex flex-col md:flex-row">
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 bg-ink-900 border-r border-white/[0.08] p-5 shrink-0 select-none justify-between">
        <div className="space-y-6">
          {/* Brand Header */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-ink-950 border border-white/20 flex items-center justify-center font-serif text-lg font-bold text-white group-hover:border-vermilion transition-colors">
              {BRAND_CONFIG.kanji}
            </div>
            <div>
              <div className="font-sans font-extrabold text-sm tracking-widest text-white">
                {BRAND_CONFIG.name} // ADMIN
              </div>
              <div className="text-[10px] font-mono text-ink-400 tracking-wider">
                Terminal v2.5
              </div>
            </div>
          </Link>

          {/* Database Mode indicator */}
          <div className="p-2.5 bg-ink-950 border border-white/5 rounded text-[11px] font-mono flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className={`w-3.5 h-3.5 ${isSupabaseConfigured() ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="text-ink-300">
                {isSupabaseConfigured() ? 'Supabase Live' : 'Demo Storage'}
              </span>
            </div>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-sm text-xs font-mono tracking-wider uppercase transition-all ${
                    active
                      ? 'bg-white text-ink-950 font-bold shadow-md'
                      : 'text-ink-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Site Link & Sign Out */}
        <div className="space-y-3 pt-6 border-t border-white/[0.08]">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs font-mono text-ink-400 hover:text-white hover:bg-white/[0.03] rounded-sm transition-colors"
          >
            <span>Live Showcase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="p-2.5 bg-ink-950/70 border border-white/5 rounded-sm flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-sans font-bold text-white truncate">
                {admin.name || 'Administrator'}
              </p>
              <p className="text-[10px] font-mono text-ink-500 truncate">{admin.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="p-1.5 text-ink-400 hover:text-vermilion transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE HEADER BAR */}
      {/* ========================================================================= */}
      <div className="md:hidden bg-ink-900 border-b border-white/[0.08] px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-ink-950 border border-white/20 flex items-center justify-center font-serif text-sm font-bold text-white">
            {BRAND_CONFIG.kanji}
          </div>
          <span className="font-sans font-bold text-sm tracking-wider text-white">
            {BRAND_CONFIG.name} ADMIN
          </span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-ink-300 hover:text-white border border-white/10 rounded-sm"
            aria-label="Toggle navigation"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileSidebarOpen && (
        <div className="md:hidden bg-ink-900 border-b border-white/10 px-4 py-4 space-y-2 animate-fade-in select-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-sm text-xs font-mono uppercase tracking-wider ${
                  active
                    ? 'bg-white text-ink-950 font-bold'
                    : 'text-ink-300 hover:bg-ink-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <Link
              to="/"
              onClick={() => setMobileSidebarOpen(false)}
              className="text-xs font-mono text-ink-400 hover:text-white inline-flex items-center space-x-1"
            >
              <span>View Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileSidebarOpen(false);
                logout();
              }}
              className="text-xs font-mono text-vermilion hover:underline flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN ADMIN CONTENT OUTLET */}
      {/* ========================================================================= */}
      <main className="flex-1 bg-ink-950 overflow-y-auto min-h-screen p-4 sm:p-8 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
};
