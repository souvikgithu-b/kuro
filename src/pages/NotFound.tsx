import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND_CONFIG } from '../config/brand';
import { ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center select-none bg-ink-950">
      <div className="relative mb-6">
        <span className="font-serif text-8xl sm:text-9xl font-extrabold text-ink-900 border-b border-white/10 pb-4 block">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center opacity-10 text-9xl font-serif text-white pointer-events-none">
          {BRAND_CONFIG.kanji}
        </div>
      </div>

      <div className="space-y-3 max-w-md">
        <div className="flex items-center justify-center space-x-2">
          <span className="hanko-stamp">NOT FOUND</span>
          <span className="text-xs font-mono tracking-widest uppercase text-ink-400">
            Lost Footage
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Screening Frame Unavailable
        </h1>

        <p className="text-xs sm:text-sm text-ink-400 font-mono leading-relaxed">
          The requested reel or screening address does not exist within the KURO cinema archive.
        </p>

        <div className="pt-6">
          <Link
            to="/"
            className="ink-btn-primary px-6 py-3 text-xs font-mono tracking-widest uppercase rounded-sm inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Archive</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
