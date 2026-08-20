import type { ShoppingItem } from '../../types/models';
import SwipeableRow from '../../components/SwipeableRow';
import { formatCurrency } from '../../utils/format';

interface ItemRowProps {
  item: ShoppingItem;
  onToggle: () => void;
  onDelete: () => void;
}

export default function ItemRow({ item, onToggle, onDelete }: ItemRowProps) {
  return (
    <SwipeableRow onDelete={onDelete}>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 bg-white px-4 py-3 text-left dark:bg-[#1c1c1e]"
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
            item.checked ? 'border-ios-green bg-ios-green text-white' : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          {item.checked && '✓'}
        </span>
        <span className="flex-1 min-w-0">
          <span
            className={`block truncate text-base ${
              item.checked ? 'text-gray-400 line-through dark:text-gray-600' : ''
            }`}
          >
            {item.name}
          </span>
          <span className="block text-sm text-gray-400 dark:text-gray-500">
            {item.quantity} {item.unit}
          </span>
        </span>
        {item.price != null && (
          <span className="shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400">
            {formatCurrency(item.price * item.quantity)}
          </span>
        )}
      </button>
    </SwipeableRow>
  );
}
