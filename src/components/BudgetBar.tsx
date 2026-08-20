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
    <div>
      {!compact && (
        <div className="mb-1 flex items-baseline justify-between text-sm">
          <span className="font-medium">{formatCurrency(spent)}</span>
          <span className="text-gray-500 dark:text-gray-400">von {formatCurrency(limit)}</span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
        <div
          className={`h-full rounded-full transition-all ${budgetColor(ratio)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {ratio >= 1 && (
        <p className="mt-1 text-xs font-medium text-ios-red">Budget überschritten</p>
      )}
      {ratio >= 0.8 && ratio < 1 && (
        <p className="mt-1 text-xs font-medium text-ios-orange">Budget fast ausgeschöpft</p>
      )}
    </div>
  );
}
