import { type ReactNode, useRef, useState } from 'react';

interface SwipeableRowProps {
  children: ReactNode;
  onDelete: () => void;
  deleteLabel?: string;
}

const ACTION_WIDTH = 84;

export default function SwipeableRow({ children, onDelete, deleteLabel = 'Löschen' }: SwipeableRowProps) {
  const [translateX, setTranslateX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startTranslate = useRef(0);
  const pointerId = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerId.current = e.pointerId;
    startX.current = e.clientX;
    startTranslate.current = translateX;
    setDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (pointerId.current !== e.pointerId || !dragging) return;
    const delta = e.clientX - startX.current;
    const next = Math.min(0, Math.max(-ACTION_WIDTH, startTranslate.current + delta));
    setTranslateX(next);
  };

  const endDrag = () => {
    setDragging(false);
    setTranslateX((prev) => (prev < -ACTION_WIDTH / 2 ? -ACTION_WIDTH : 0));
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        <button
          onClick={() => {
            onDelete();
            setTranslateX(0);
          }}
          style={{ width: ACTION_WIDTH }}
          className="flex items-center justify-center bg-ios-red text-sm font-semibold text-white"
        >
          {deleteLabel}
        </button>
      </div>
      <div
        className="relative bg-inherit transition-transform"
        style={{
          transform: `translateX(${translateX}px)`,
          transitionDuration: dragging ? '0ms' : '200ms',
          touchAction: 'pan-y',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {children}
      </div>
    </div>
  );
}
