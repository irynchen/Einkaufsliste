import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { startOfMonth, endOfMonth } from '../utils/format';
import type { Budget, CategoryId } from '../types/models';

export interface BudgetStatus {
  budget: Budget | undefined;
  monthSpent: number;
  categorySpent: Partial<Record<CategoryId, number>>;
  limit: number | null;
  ratio: number | null; // 0..n
}

/**
 * Liefert den Budget-Status für eine Liste (oder 'global') im laufenden Monat.
 * Fällt auf das globale Budget zurück, wenn für die Liste kein eigenes gesetzt ist.
 */
export function useBudgetStatus(listId: string | null, referenceDate = new Date()): BudgetStatus {
  const from = startOfMonth(referenceDate);
  const to = endOfMonth(referenceDate);

  const budgets = useLiveQuery(() => db.budgets.toArray(), []) ?? [];
  const budget =
    budgets.find((b) => b.listId === listId) ?? budgets.find((b) => b.listId === 'global');

  const purchases =
    useLiveQuery(async () => {
      const all = await db.purchases.where('date').between(from, to, true, true).toArray();
      if (!budget || budget.listId === 'global') return all;
      return all.filter((p) => p.listId === budget.listId);
    }, [from, to, budget?.id, budget?.listId]) ?? [];

  const monthSpent = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

  const categorySpent: Partial<Record<CategoryId, number>> = {};
  for (const p of purchases) {
    for (const item of p.items) {
      categorySpent[item.categoryId] = (categorySpent[item.categoryId] ?? 0) + item.price;
    }
  }

  const limit = budget?.monthlyLimit ?? null;
  const ratio = limit && limit > 0 ? monthSpent / limit : null;

  return { budget, monthSpent, categorySpent, limit, ratio };
}
