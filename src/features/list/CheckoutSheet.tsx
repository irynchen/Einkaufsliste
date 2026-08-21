import { useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import Sheet from '../../components/Sheet';
import Confetti from '../../components/Confetti';
import type { ShoppingItem } from '../../types/models';
import { formatCurrency } from '../../utils/format';
import { vividGradient } from '../../utils/color';

interface CheckoutSheetProps {
  open: boolean;
  onClose: () => void;
  listId: string;
  listName: string;
  checkedItems: ShoppingItem[];
}

export default function CheckoutSheet({ open, onClose, listId, listName, checkedItems }: CheckoutSheetProps) {
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [store, setStore] = useState('');
  const [celebrating, setCelebrating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const knownStores = useLiveQuery(async () => {
    const purchases = await db.purchases.toArray();
    return Array.from(new Set(purchases.map((p) => p.store).filter((s): s is string => !!s))).sort();
  }, []) ?? [];

  const priceFor = (item: ShoppingItem) => prices[item.id] ?? (item.price != null ? String(item.price) : '');

  const total = useMemo(
    () =>
      checkedItems.reduce((sum, item) => {
        const p = parseFloat((priceFor(item) || '0').replace(',', '.')) || 0;
        return sum + p * item.quantity;
      }, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checkedItems, prices],
  );

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleConfirm = async () => {
    const purchaseId = crypto.randomUUID();
    await db.purchases.add({
      id: purchaseId,
      listId,
      listName,
      date: Date.now(),
      totalAmount: total,
      store: store.trim() || undefined,
      items: checkedItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        categoryId: item.categoryId,
        price: parseFloat((priceFor(item) || '0').replace(',', '.')) || 0,
        barcode: item.barcode,
      })),
    });

    if (photo) {
      await db.receipts.add({
        id: crypto.randomUUID(),
        purchaseId,
        blob: photo,
        createdAt: Date.now(),
      });
    }

    await db.items.bulkDelete(checkedItems.map((i) => i.id));

    setCelebrating(true);
    onClose();
    window.setTimeout(() => {
      setPrices({});
      setPhoto(null);
      setPhotoPreview(null);
      setStore('');
      setCelebrating(false);
    }, 1100);
  };

  return (
    <>
    <Sheet open={open} onClose={onClose} title="Einkauf abschließen">
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400">
            Geschäft (optional, für Preisvergleich)
          </label>
          <input
            list="known-stores"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            placeholder="z.B. Rewe, Edeka, Aldi"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base outline-none focus:border-ios-green dark:border-gray-700 dark:bg-gray-800"
          />
          <datalist id="known-stores">
            {knownStores.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {checkedItems.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-2.5">
              <span className="flex-1 min-w-0 truncate text-sm">
                {item.name}{' '}
                <span className="text-gray-400">
                  ({item.quantity} {item.unit})
                </span>
              </span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={priceFor(item)}
                onChange={(e) => setPrices((p) => ({ ...p, [item.id]: e.target.value }))}
                className="w-20 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-right text-sm outline-none focus:border-ios-green dark:border-gray-700 dark:bg-gray-800"
              />
              <span className="text-xs text-gray-400">€</span>
            </li>
          ))}
        </ul>

        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ backgroundColor: 'rgba(52, 199, 89, 0.10)' }}
        >
          <span className="font-semibold">Gesamt</span>
          <span className="text-lg font-extrabold text-ios-green">{formatCurrency(total)}</span>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoChange}
          />
          {photoPreview ? (
            <div className="relative">
              <img src={photoPreview} alt="Kassenbon" className="w-full rounded-xl object-cover" style={{ maxHeight: 220 }} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 rounded-full bg-black/60 px-3 py-1.5 text-sm font-medium text-white"
              >
                Neu aufnehmen
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-4 text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400"
            >
              📷 Kassenbon fotografieren
            </button>
          )}
        </div>

        <button
          onClick={handleConfirm}
          className="mt-1 w-full rounded-xl py-3.5 text-base font-bold text-white shadow-md active:scale-[0.98] transition-transform"
          style={{ backgroundImage: vividGradient('#34C759') }}
        >
          🎉 Einkauf speichern
        </button>
      </div>
    </Sheet>
    <Confetti active={celebrating} />
    </>
  );
}
