import type { RecurrenceInterval } from '../types/models';

const INTERVAL_DAYS: Record<RecurrenceInterval, number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};

export const INTERVAL_LABELS: Record<RecurrenceInterval, string> = {
  weekly: 'Wöchentlich',
  biweekly: 'Alle 2 Wochen',
  monthly: 'Monatlich',
};

/** Ist ein wiederkehrender Artikel wieder fällig, um zu einer Liste vorgeschlagen zu werden? */
export function isRuleDue(lastAddedAt: number | undefined, interval: RecurrenceInterval): boolean {
  if (!lastAddedAt) return true;
  const daysSince = (Date.now() - lastAddedAt) / (1000 * 60 * 60 * 24);
  return daysSince >= INTERVAL_DAYS[interval];
}
