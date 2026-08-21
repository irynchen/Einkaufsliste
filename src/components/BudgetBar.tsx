import { formatCurrency } from '../utils/format';
import { vividGradient } from '../utils/color';

interface BudgetBarProps {
  spent: number;
  limit: number | null;
  compact?: boolean;
}

export function budgetColor(ratio: number | null): string {
  if (ratio === null) return '#8E8E93';
  if (ratio >= 1) return '#FF3B30';
  if (ratio >= 0.8) return '#FFCC00';
  return '#34C759';
}

export default function BudgetBar({ spent, limit, compact }: BudgetBarProps) {
  if (!limit) return null;
  const ratio = spent / limit;
  const pct = Math.min(ratio, 1) * 100;

  return (
    <div className={compact ? '' : 'glass rounded-2xl p-3.5 shadow-sm'}>
      {!compact && (
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-lg font-extrabold">{formatCurrency(spent)}</span>
          <span className="text-sm font-medium text-gray-400">
            von {formatCurrency(limit)} · {Math.round(ratio * 100)}%
          </span>
        </div>
      )}
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200/70 dark:bg-gray-800">
        <div
          className="h-full rounded-full shadow-sm transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundImage: vividGradient(budgetColor(ratio), 90) }}
        />
      </div>
      {ratio >= 1 && <p className="mt-1.5 text-xs font-bold text-ios-red">⚠️ Budget überschritten</p>}
      {ratio >= 0.8 && ratio < 1 && (
        <p className="mt-1.5 text-xs font-bold text-ios-orange">🔥 Budget fast ausgeschöpft</p>
      )}
    </div>
  );
}
