import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'card' | 'hero' | 'table-row' | 'text';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant = 'card' }) => {
  if (variant === 'hero') {
    return (
      <div className="w-full h-[65vh] min-h-[480px] bg-ink-900 border border-white/5 relative overflow-hidden animate-pulse">
        <div className="absolute bottom-12 left-8 sm:left-16 space-y-4 max-w-xl">
          <div className="h-4 w-28 bg-ink-800 rounded" />
          <div className="h-10 w-96 max-w-full bg-ink-800 rounded" />
          <div className="h-4 w-72 bg-ink-800 rounded" />
          <div className="h-12 w-44 bg-ink-800 rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <tr className="animate-pulse border-b border-white/5">
        <td className="py-4 px-4">
          <div className="w-12 h-16 bg-ink-850 rounded" />
        </td>
        <td className="py-4 px-4 space-y-2">
          <div className="h-4 w-48 bg-ink-850 rounded" />
          <div className="h-3 w-24 bg-ink-850/60 rounded" />
        </td>
        <td className="py-4 px-4">
          <div className="h-4 w-16 bg-ink-850 rounded" />
        </td>
        <td className="py-4 px-4">
          <div className="h-4 w-20 bg-ink-850 rounded" />
        </td>
        <td className="py-4 px-4">
          <div className="h-6 w-20 bg-ink-850 rounded" />
        </td>
        <td className="py-4 px-4 text-right">
          <div className="h-8 w-24 bg-ink-850 rounded inline-block" />
        </td>
      </tr>
    );
  }

  // Default card variant
  return (
    <div className="flex flex-col bg-ink-900/40 border border-white/[0.05] rounded-sm overflow-hidden animate-pulse">
      <div className="aspect-[2/3] w-full bg-ink-850" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-3 w-16 bg-ink-800 rounded" />
        <div className="h-4 w-full bg-ink-800 rounded" />
        <div className="h-3 w-2/3 bg-ink-800/60 rounded" />
      </div>
    </div>
  );
};
