import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND_CONFIG } from '../config/brand';
import { Shield, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-ink-950 border-t border-white/[0.08] pt-16 pb-12 overflow-hidden select-none">
      {/* Subtle Japanese ink watermark */}
      <div className="absolute right-6 -bottom-10 opacity-[0.035] kanji-watermark text-[180px] leading-none pointer-events-none text-white">
        {BRAND_CONFIG.kanji}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand info */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-ink-900 border border-white/20">
                <span className="font-serif text-lg font-bold text-ink-100">{BRAND_CONFIG.kanji}</span>
              </div>
              <span className="font-sans font-bold tracking-widest text-lg text-white">
                {BRAND_CONFIG.fullName}
              </span>
              <span className="hanko-stamp">{BRAND_CONFIG.stampText}</span>
            </div>

            <p className="text-ink-400 text-sm font-light max-w-md leading-relaxed">
              Curated minimal cinema archive inspired by Japanese editorial aesthetics, high-contrast monochrome design, and individual screening flows.
            </p>

            <div className="p-3 bg-ink-900/50 border border-white/5 rounded text-xs text-ink-400 font-mono flex items-start space-x-2">
              <Shield className="w-4 h-4 text-ink-300 mt-0.5 shrink-0" />
              <span>
                {BRAND_CONFIG.legalNotice}
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono tracking-widest uppercase text-white/90">
              Film Catalogue
            </h4>
            <ul className="space-y-2 text-xs font-mono text-ink-400">
              <li>
                <Link to="/movies" className="hover:text-white transition-colors">All Screenings</Link>
              </li>
              <li>
                <Link to="/movies?genre=Cyberpunk%20Noir" className="hover:text-white transition-colors">Cyberpunk Noir</Link>
              </li>
              <li>
                <Link to="/movies?genre=Psychological%20Thriller" className="hover:text-white transition-colors">Psychological</Link>
              </li>
              <li>
                <Link to="/movies?genre=Documentary" className="hover:text-white transition-colors">Documentary</Link>
              </li>
            </ul>
          </div>

          {/* Architecture & Admin */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono tracking-widest uppercase text-white/90">
              Architecture
            </h4>
            <ul className="space-y-2 text-xs font-mono text-ink-400">
              <li>
                <Link to="/admin" className="hover:text-vermilion transition-colors inline-flex items-center space-x-1">
                  <span>Admin Terminal</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <span className="text-ink-500">PostgreSQL + Supabase</span>
              </li>
              <li>
                <span className="text-ink-500">Generic Link Provider</span>
              </li>
              <li>
                <span className="text-ink-500">Vercel Production Ready</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-ink-500 space-y-4 sm:space-y-0">
          <div>
            &copy; {BRAND_CONFIG.copyrightYear} {BRAND_CONFIG.name}. All Rights Reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span>Ink & Cinema Protocol</span>
            <span>•</span>
            <span className="text-ink-400">Pure Black-and-White Aesthetic</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
