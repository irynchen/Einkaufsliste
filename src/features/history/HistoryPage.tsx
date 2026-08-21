import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { db } from '../../db/db';
import { useActiveList } from '../../hooks/useActiveList';
import { formatCurrency, formatDateTime } from '../../utils/format';
import type { Purchase } from '../../types/models';
import ReceiptThumbnail from './ReceiptThumbnail';

export default function HistoryPage() {
  const purchases = useLiveQuery(() => db.purchases.orderBy('date').reverse().toArray(), []) ?? [];
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [repeatingId, setRepeatingId] = useState<string | null>(null);
  const { activeListId, setActiveListId } = useActiveList();
  const navigate = useNavigate();

  const repeatPurchase = async (purchase: Purchase) => {
    setRepeatingId(purchase.id);
    try {
      const targetListId = (await db.lists.get(purchase.listId)) ? purchase.listId : activeListId;
      if (!targetListId) return;

      await db.lists.update(purchase.listId, { archived: false }).catch(() => undefined);
      await db.items.bulkAdd(
        purchase.items.map((item) => ({
          id: crypto.randomUUID(),
          listId: targetListId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          categoryId: item.categoryId,
          checked: false,
          barcode: item.barcode,
          createdAt: Date.now(),
        })),
      );

      setActiveListId(targetListId);
      navigate('/');
    } finally {
      setRepeatingId(null);
    }
  };

  if (purchases.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 pt-20 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-ios-blue/10 text-4xl">🧾</span>
        <p className="font-semibold text-gray-600 dark:text-gray-300">Noch keine abgeschlossenen Einkäufe</p>
        <p className="text-sm text-gray-400">Schließe einen Einkauf ab, um ihn hier zu sehen.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 pt-3">
      {purchases.map((purchase) => (
        <div key={purchase.id} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/[0.03] dark:bg-[#1c1c1e] dark:ring-white/[0.04]">
          <button
            onClick={() => setExpandedId((id) => (id === purchase.id ? null : purchase.id))}
            className="flex w-full items-center gap-3 text-left"
          >
            <ReceiptThumbnail purchaseId={purchase.id} onOpen={setFullscreenUrl} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{purchase.listName}</p>
              <p className="text-sm text-gray-400">
                {formatDateTime(purchase.date)}
                {purchase.store ? ` · ${purchase.store}` : ''}
              </p>
              <p className="text-sm text-gray-400">{purchase.items.length} Artikel</p>
            </div>
            <p className="shrink-0 text-lg font-bold text-ios-green">{formatCurrency(purchase.totalAmount)}</p>
          </button>

          {expandedId === purchase.id && (
            <>
              <ul className="mt-3 divide-y divide-gray-100 border-t border-gray-100 pt-2 text-sm dark:divide-gray-800 dark:border-gray-800">
                {purchase.items.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between py-1.5">
                    <span className="text-gray-600 dark:text-gray-300">
                      {item.name} ({item.quantity} {item.unit})
                    </span>
                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  repeatPurchase(purchase);
                }}
                disabled={repeatingId === purchase.id}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-ios-green/10 py-2.5 text-sm font-semibold text-ios-green disabled:opacity-50"
              >
                🔁 {repeatingId === purchase.id ? 'Wird hinzugefügt…' : 'Nochmal kaufen'}
              </button>
            </>
          )}
        </div>
      ))}

      {fullscreenUrl &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setFullscreenUrl(null)}
          >
            <img src={fullscreenUrl} alt="Kassenbon" className="max-h-full max-w-full rounded-lg object-contain" />
            <button
              onClick={() => setFullscreenUrl(null)}
              className="safe-top absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl text-white"
            >
              ✕
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
