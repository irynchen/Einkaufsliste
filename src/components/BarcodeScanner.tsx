import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import type { IScannerControls } from '@zxing/browser';

const HINTS = new Map<DecodeHintType, unknown>([
  [
    DecodeHintType.POSSIBLE_FORMATS,
    [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE,
    ],
  ],
  [DecodeHintType.TRY_HARDER, true],
]);

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onDetected: (code: string) => void;
}

export default function BarcodeScanner({ open, onClose, onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);

  useEffect(() => {
    if (!open || !videoRef.current) return;
    setError(null);
    setTorchOn(false);
    setTorchAvailable(false);
    const reader = new BrowserMultiFormatReader(HINTS);
    let cancelled = false;

    const start = async (constraints: MediaStreamConstraints) => {
      const controls = await reader.decodeFromConstraints(constraints, videoRef.current!, (result, err) => {
        if (cancelled) return;
        if (result) {
          onDetected(result.getText());
          controlsRef.current?.stop();
        } else if (err && err.name !== 'NotFoundException') {
          // andere Fehler ignorieren wir stillschweigend während des Scannens
        }
      });
      if (cancelled) {
        controls.stop();
        return;
      }
      controlsRef.current = controls;
      setTorchAvailable(!!controls.switchTorch);
    };

    // Rückkamera erzwingen – ohne explizite Vorgabe wählen manche Geräte sonst die Frontkamera,
    // womit ein Barcode praktisch nie lesbar ist.
    start({ video: { facingMode: { ideal: 'environment' } } }).catch(() => {
      if (cancelled) return;
      start({ video: true }).catch(() => {
        if (!cancelled) setError('Kein Kamerazugriff möglich. Bitte Berechtigung in den Einstellungen prüfen.');
      });
    });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [open, onDetected]);

  const toggleTorch = async () => {
    try {
      await controlsRef.current?.switchTorch?.(!torchOn);
      setTorchOn((v) => !v);
    } catch {
      setTorchAvailable(false);
    }
  };

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
        {torchAvailable && (
          <button
            onClick={toggleTorch}
            className={`absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full text-xl ${
              torchOn ? 'bg-ios-yellow text-black' : 'bg-white/15 text-white'
            }`}
            aria-label="Blitz umschalten"
          >
            🔦
          </button>
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
