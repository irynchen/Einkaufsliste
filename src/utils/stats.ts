import type { Purchase } from '../types/models';

export type PeriodPreset = '7d' | '30d' | '1y' | 'custom';

export function periodRange(preset: PeriodPreset, customFrom?: number, customTo?: number): { from: number; to: number } {
  const to = Date.now();
  if (preset === 'custom') {
    return { from: customFrom ?? to - 30 * 86400000, to: customTo ?? to };
  }
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 365;
  return { from: to - days * 86400000, to };
}

export interface CategoryTotal {
  categoryId: string;
  total: number;
}

export function categoryTotals(purchases: Purchase[]): CategoryTotal[] {
  const map = new Map<string, number>();
  for (const p of purchases) {
    for (const item of p.items) {
      map.set(item.categoryId, (map.get(item.categoryId) ?? 0) + item.price * item.quantity);
    }
  }
  return Array.from(map.entries()).map(([categoryId, total]) => ({ categoryId, total }));
}

export interface TimeBucket {
  label: string;
  total: number;
  sortKey: number;
}

export function bucketTotals(purchases: Purchase[], granularity: 'week' | 'month'): TimeBucket[] {
  const map = new Map<string, TimeBucket>();
  for (const p of purchases) {
    const d = new Date(p.date);
    let key: string;
    let label: string;
    let sortKey: number;
    if (granularity === 'week') {
      const weekStart = new Date(d);
      const day = (weekStart.getDay() + 6) % 7; // Montag = 0
      weekStart.setDate(weekStart.getDate() - day);
      weekStart.setHours(0, 0, 0, 0);
      key = weekStart.toISOString();
      label = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' }).format(weekStart);
      sortKey = weekStart.getTime();
    } else {
      key = `${d.getFullYear()}-${d.getMonth()}`;
      label = new Intl.DateTimeFormat('de-DE', { month: 'short', year: '2-digit' }).format(d);
      sortKey = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    }
    const existing = map.get(key);
    if (existing) {
      existing.total += p.totalAmount;
    } else {
      map.set(key, { label, total: p.totalAmount, sortKey });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.sortKey - b.sortKey);
}

export interface ItemAggregate {
  name: string;
  count: number;
  total: number;
}

export function topItems(purchases: Purchase[]): { mostFrequent: ItemAggregate[]; mostExpensive: ItemAggregate[] } {
  const map = new Map<string, ItemAggregate>();
  for (const p of purchases) {
    for (const item of p.items) {
      const existing = map.get(item.name);
      const total = item.price * item.quantity;
      if (existing) {
        existing.count += 1;
        existing.total += total;
      } else {
        map.set(item.name, { name: item.name, count: 1, total });
      }
    }
  }
  const all = Array.from(map.values());
  return {
    mostFrequent: [...all].sort((a, b) => b.count - a.count).slice(0, 5),
    mostExpensive: [...all].sort((a, b) => b.total - a.total).slice(0, 5),
  };
}
