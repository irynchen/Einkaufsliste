import { formatCurrency } from '../utils/format';

interface BudgetBarProps {
  spent: number;
  limit: number | null;
  compact?: boolean;
}

export function budgetColor(ratio: number | null): string {
  if (ratio === null) return 'bg-gray-300 dark:bg-gray-700';
  if (ratio >= 1) return 'bg-ios-red';
  if (ratio >= 0.8) return 'bg-ios-yellow';
  return 'bg-ios-green';
}

export default function BudgetBar({ spent, limit, compact }: BudgetBarProps) {
  if (!limit) return null;
  const ratio = spent / limit;
  const pct = Math.min(ratio, 1) * 100;

  return (
    <div className={compact ? '' : 'rounded-2xl bg-white p-3.5 shadow-sm dark:bg-[#1c1c1e]'}>
      {!compact && (
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-lg font-bold">{formatCurrency(spent)}</span>
          <span className="text-sm text-gray-400">
            von {formatCurrency(limit)} · {Math.round(ratio * 100)}%
          </span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${budgetColor(ratio)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {ratio >= 1 && <p className="mt-1.5 text-xs font-semibold text-ios-red">⚠️ Budget überschritten</p>}
      {ratio >= 0.8 && ratio < 1 && (
        <p className="mt-1.5 text-xs font-semibold text-ios-orange">Budget fast ausgeschöpft</p>
      )}
    </div>
  );
}
