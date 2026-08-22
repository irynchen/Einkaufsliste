import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="safe-bottom relative w-full max-w-lg animate-[slideUp_0.25s_ease-out] rounded-t-3xl bg-white shadow-2xl dark:bg-[#1c1c1e]">
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
        {title && (
          <div className="flex items-center justify-between px-5 pt-3 pb-1">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300"
              aria-label="Schließen"
            >
              ✕
            </button>
          </div>
        )}
        <div className="max-h-[75vh] overflow-y-auto px-5 pt-2 pb-6">{children}</div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body,
  );
}
