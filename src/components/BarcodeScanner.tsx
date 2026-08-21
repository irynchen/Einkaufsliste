import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BrowserMultiFormatReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onDetected: (code: string) => void;
}

export default function BarcodeScanner({ open, onClose, onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !videoRef.current) return;
    setError(null);
    const reader = new BrowserMultiFormatReader();
    let cancelled = false;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
        if (cancelled) return;
        if (result) {
          onDetected(result.getText());
          controlsRef.current?.stop();
        } else if (err && err.name !== 'NotFoundException') {
          // andere Fehler ignorieren wir stillschweigend während des Scannens
        }
      })
      .then((controls) => {
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
      })
      .catch(() => {
        if (!cancelled) setError('Kein Kamerazugriff möglich. Bitte Berechtigung in den Einstellungen prüfen.');
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [open, onDetected]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      <div className="safe-top flex items-center justify-between px-4 pt-3 pb-2">
        <h2 className="text-base font-semibold text-white">Barcode scannen</h2>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg text-white"
          aria-label="Schließen"
        >
          ✕
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
        {!error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-64 rounded-2xl border-2 border-ios-green/80 shadow-[0_0_0_2000px_rgba(0,0,0,0.35)]" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center px-8">
            <p className="text-center text-sm text-white">{error}</p>
          </div>
        )}
      </div>

      <p className="safe-bottom px-6 py-4 text-center text-sm text-gray-300">
        Barcode im Rahmen positionieren – die Erkennung läuft automatisch.
      </p>
    </div>,
    document.body,
  );
}
