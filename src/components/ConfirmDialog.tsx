import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-ink-900 border border-white/15 p-6 shadow-2xl rounded-sm">
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-ink-400 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start space-x-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-vermilion-muted/50 text-vermilion border border-vermilion/30'
                : 'bg-white/10 text-white border border-white/20'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-2">
            <h3 className="font-sans font-bold text-base text-white">{title}</h3>
            <p className="text-xs text-ink-300 font-mono leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-mono tracking-wider uppercase text-ink-300 hover:text-white bg-ink-800 border border-white/10 rounded-sm"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-sm ${
              isDestructive
                ? 'bg-vermilion hover:bg-vermilion-hover text-white'
                : 'bg-white text-ink-950 hover:bg-ink-100 font-bold'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
