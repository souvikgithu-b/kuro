import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'System Error',
  message = 'An unexpected error occurred while communicating with the cinema database.',
  onRetry,
}) => {
  return (
    <div className="p-8 my-8 text-center bg-vermilion-muted/20 border border-vermilion-border rounded-sm max-w-lg mx-auto">
      <div className="w-12 h-12 mb-3 rounded-full bg-vermilion-muted/40 border border-vermilion/30 flex items-center justify-center mx-auto text-vermilion">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h3 className="font-sans font-bold text-base text-white tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-xs text-ink-300 font-mono leading-relaxed mb-5">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="ink-btn-secondary px-4 py-2 text-xs font-mono tracking-widest uppercase rounded-sm inline-flex items-center space-x-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
};
