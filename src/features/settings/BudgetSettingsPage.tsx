import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import type { CategoryId } from '../../types/models';
import { formatCurrency } from '../../utils/format';
import { useBudgetStatus } from '../../hooks/useBudget';
import BudgetBar from '../../components/BudgetBar';

export default function BudgetSettingsPage() {
  const lists = useLiveQuery(() => db.lists.toArray(), []) ?? [];
  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray(), []) ?? [];
  const budgets = useLiveQuery(() => db.budgets.toArray(), []) ?? [];

  const [scope, setScope] = useState<'global' | string>('global');
  const [limit, setLimit] = useState('');
  const [categoryLimits, setCategoryLimits] = useState<Partial<Record<CategoryId, string>>>({});

  const status = useBudgetStatus(scope === 'global' ? null : scope);
  const existing = budgets.find((b) => b.listId === scope);

  useEffect(() => {
    setLimit(existing?.monthlyLimit ? String(existing.monthlyLimit) : '');
    const cl: Partial<Record<CategoryId, string>> = {};
    for (const [k, v] of Object.entries(existing?.categoryLimits ?? {})) {
      cl[k] = String(v);
    }
    setCategoryLimits(cl);
  }, [existing, scope]);

  const save = async () => {
    const parsedLimit = parseFloat(limit.replace(',', '.')) || 0;
    const parsedCategoryLimits: Partial<Record<CategoryId, number>> = {};
    for (const [k, v] of Object.entries(categoryLimits)) {
      const n = parseFloat((v ?? '').replace(',', '.'));
      if (n > 0) parsedCategoryLimits[k] = n;
    }

    if (existing) {
      await db.budgets.update(existing.id, { monthlyLimit: parsedLimit, categoryLimits: parsedCategoryLimits });
    } else {
      await db.budgets.add({
        id: crypto.randomUUID(),
        listId: scope,
        monthlyLimit: parsedLimit,
        categoryLimits: parsedCategoryLimits,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-3">
      <div>
        <p className="mb-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">Budget-Bereich</p>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-ios-green dark:border-gray-700 dark:bg-[#1c1c1e]"
        >
          <option value="global">🌐 Global (alle Listen)</option>
          {lists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.icon} {l.name}
            </option>
          ))}
        </select>
      </div>

      {status.limit != null && (
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-[#1c1c1e]">
          <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Aktueller Monat</p>
          <BudgetBar spent={status.monthSpent} limit={status.limit} />
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-[#1c1c1e]">
        <label className="mb-1.5 block text-sm font-medium text-gray-500 dark:text-gray-400">
          Monatliches Budget gesamt
        </label>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="1"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="z.B. 400"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-ios-green dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-[#1c1c1e]">
        <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Budget pro Kategorie (optional)</p>
        <div className="flex flex-col gap-3">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="w-6 text-center">{c.icon}</span>
              <span className="flex-1 text-sm">{c.name}</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="—"
                value={categoryLimits[c.id] ?? ''}
                onChange={(e) => setCategoryLimits((prev) => ({ ...prev, [c.id]: e.target.value }))}
                className="w-24 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-right text-sm outline-none focus:border-ios-green dark:border-gray-700 dark:bg-gray-800"
              />
              {status.categorySpent[c.id] != null && (
                <span className="w-16 shrink-0 text-right text-xs text-gray-400">
                  {formatCurrency(status.categorySpent[c.id] ?? 0)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <button onClick={save} className="w-full rounded-2xl bg-ios-green py-3.5 font-semibold text-white">
        Budget speichern
      </button>
    </div>
  );
}
