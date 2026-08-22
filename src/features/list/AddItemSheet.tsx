import { Suspense, lazy, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import Sheet from '../../components/Sheet';
import { UNITS, type RecurrenceInterval } from '../../types/models';
import { INTERVAL_LABELS } from '../../utils/recurrence';
import { useBudgetStatus } from '../../hooks/useBudget';
import { formatCurrency } from '../../utils/format';
import { vividGradient } from '../../utils/color';

const BarcodeScanner = lazy(() => import('../../components/BarcodeScanner'));

interface AddItemSheetProps {
  open: boolean;
  onClose: () => void;
  listId: string;
}

export default function AddItemSheet({ open, onClose, listId }: AddItemSheetProps) {
  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray(), []) ?? [];
  const items = useLiveQuery(() => db.items.where('listId').equals(listId).toArray(), [listId]) ?? [];
  const { limit, monthSpent } = useBudgetStatus(listId);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState(UNITS[0]);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [price, setPrice] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [interval, setInterval] = useState<RecurrenceInterval>('weekly');
  const [barcode, setBarcode] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanHint, setScanHint] = useState<string | null>(null);

  const handleDetected = async (code: string) => {
    setScannerOpen(false);
    setBarcode(code);
    const known = await db.barcodeCatalog.get(code);
    if (known) {
      setName(known.name);
      setUnit(known.unit);
      setCategoryId(known.categoryId);
      setScanHint(`Bekannter Artikel erkannt: ${known.name}`);
    } else {
      setScanHint('Neuer Barcode – bitte Artikel einmal benennen, danach wird er gemerkt.');
    }
  };

  const activeCategoryId = categoryId || categories[0]?.id || '';
  const priceNum = parseFloat(price.replace(',', '.')) || 0;
  const currentListValue = items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);
  const projected = monthSpent + currentListValue + priceNum;
  const willExceed = limit != null && priceNum > 0 && projected > limit;

  const reset = () => {
    setName('');
    setQuantity('1');
    setUnit(UNITS[0]);
    setPrice('');
    setIsRecurring(false);
    setInterval('weekly');
    setBarcode(null);
    setScanHint(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !activeCategoryId) return;

    let recurringRuleId: string | undefined;
    if (isRecurring) {
      recurringRuleId = crypto.randomUUID();
      await db.recurringRules.add({
        id: recurringRuleId,
        itemName: name.trim(),
        categoryId: activeCategoryId,
        listId,
        quantity: parseFloat(quantity) || 1,
        unit,
        interval,
        lastAddedAt: Date.now(),
        active: true,
      });
    }

    await db.items.add({
      id: crypto.randomUUID(),
      listId,
      name: name.trim(),
      quantity: parseFloat(quantity) || 1,
      unit,
      categoryId: activeCategoryId,
      checked: false,
      price: priceNum > 0 ? priceNum : undefined,
      recurringRuleId,
      barcode: barcode ?? undefined,
      createdAt: Date.now(),
    });

    if (barcode) {
      await db.barcodeCatalog.put({ barcode, name: name.trim(), categoryId: activeCategoryId, unit });
    }

    reset();
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Artikel hinzufügen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400">Artikel</label>
          <div className="flex gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Bananen"
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base outline-none focus:border-ios-green dark:border-gray-700 dark:bg-gray-800"
            />
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              aria-label="Barcode scannen"
              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-xl dark:border-gray-700 dark:bg-gray-800"
            >
              📷
            </button>
          </div>
          {scanHint && <p className="mt-1.5 text-xs text-gray-400">{scanHint}</p>}
        </div>

        <div className="flex gap-3">
          <div className="w-24">
            <label className="mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400">Menge</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-base outline-none focus:border-ios-green dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400">Einheit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-base outline-none focus:border-ios-green dark:border-gray-700 dark:bg-gray-800"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400">
            Preis (optional, für Budget)
          </label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0,00 €"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base outline-none focus:border-ios-green dark:border-gray-700 dark:bg-gray-800"
          />
          {willExceed && (
            <p className="mt-2 rounded-lg bg-ios-red/10 px-3 py-2 text-sm font-medium text-ios-red">
              ⚠️ Mit diesem Artikel überschreitest du dein Monatsbudget ({formatCurrency(projected)} von{' '}
              {formatCurrency(limit ?? 0)}).
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400">Kategorie</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold transition-all ${
                  activeCategoryId === c.id
                    ? 'border-transparent text-white shadow-sm scale-[1.03]'
                    : 'border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-200'
                }`}
                style={activeCategoryId === c.id ? { backgroundImage: vividGradient(c.color) } : undefined}
              >
                <span>{c.icon}</span>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
          <span className="font-medium">Wiederkehrender Artikel</span>
          <button
            type="button"
            role="switch"
            aria-checked={isRecurring}
            onClick={() => setIsRecurring((v) => !v)}
            className={`h-7 w-12 rounded-full transition-colors ${isRecurring ? '' : 'bg-gray-300 dark:bg-gray-700'}`}
            style={isRecurring ? { backgroundImage: vividGradient('#34C759') } : undefined}
          >
            <span
              className={`block h-6 w-6 translate-x-0.5 rounded-full bg-white shadow transition-transform ${
                isRecurring ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>

        {isRecurring && (
          <div className="flex gap-2">
            {(Object.keys(INTERVAL_LABELS) as RecurrenceInterval[]).map((key) => (
              <button
                type="button"
                key={key}
                onClick={() => setInterval(key)}
                className={`flex-1 rounded-xl border py-2 text-sm font-medium ${
                  interval === key
                    ? 'border-ios-green bg-ios-green/10 text-ios-green'
                    : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300'
                }`}
              >
                {INTERVAL_LABELS[key]}
              </button>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={!name.trim()}
          className="mt-2 w-full rounded-xl py-3.5 text-base font-bold text-white shadow-md active:scale-[0.98] transition-transform disabled:opacity-40"
          style={{ backgroundImage: vividGradient('#34C759') }}
        >
          Hinzufügen
        </button>
      </form>
      {scannerOpen && (
        <Suspense fallback={null}>
          <BarcodeScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onDetected={handleDetected} />
        </Suspense>
      )}
    </Sheet>
  );
}
