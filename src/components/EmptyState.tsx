import React from 'react';
import { Film, RefreshCw } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found in archive',
  subtitle = 'Try refining your search terms or clearing your filter selection.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 sm:p-16 my-8 text-center bg-ink-900/30 border border-white/[0.06] rounded-sm relative overflow-hidden select-none">
      {/* Background Japanese Enso / Ink brush motif */}
      <div className="absolute opacity-[0.03] text-[160px] font-serif select-none pointer-events-none text-white">
        {BRAND_CONFIG.kanji}
      </div>

      <div className="w-14 h-14 mb-4 rounded-full bg-ink-850 border border-white/10 flex items-center justify-center text-ink-300">
        <Film className="w-6 h-6 stroke-1 text-ink-400" />
      </div>

      <h3 className="font-sans font-bold text-lg text-white tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-sm text-ink-400 max-w-md font-light leading-relaxed mb-6">
        {subtitle}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="ink-btn-secondary px-5 py-2 text-xs font-mono tracking-widest uppercase rounded-sm inline-flex items-center space-x-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
