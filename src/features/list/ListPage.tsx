import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useActiveList } from '../../hooks/useActiveList';
import { useBudgetStatus } from '../../hooks/useBudget';
import { vividGradient, softTint } from '../../utils/color';
import BudgetBar from '../../components/BudgetBar';
import ItemRow from './ItemRow';
import AddItemSheet from './AddItemSheet';
import CheckoutSheet from './CheckoutSheet';
import RecurringSuggestionsBanner from './RecurringSuggestionsBanner';

export default function ListPage() {
  const { activeListId } = useActiveList();
  const [addOpen, setAddOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const list = useLiveQuery(() => (activeListId ? db.lists.get(activeListId) : undefined), [activeListId]);
  const items = useLiveQuery(
    () => (activeListId ? db.items.where('listId').equals(activeListId).toArray() : []),
    [activeListId],
  ) ?? [];
  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray(), []) ?? [];
  const { monthSpent, limit } = useBudgetStatus(activeListId);

  const groups = useMemo(() => {
    return categories
      .map((cat) => ({
        category: cat,
        items: items
          .filter((i) => i.categoryId === cat.id)
          .sort((a, b) => Number(a.checked) - Number(b.checked) || a.createdAt - b.createdAt),
      }))
      .filter((g) => g.items.length > 0);
  }, [categories, items]);

  const checkedItems = items.filter((i) => i.checked);
  const listValue = items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);

  if (!activeListId || !list) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-gray-500">
        <p className="text-lg font-medium">Keine Liste vorhanden</p>
        <p className="text-sm">Lege in den Einstellungen eine neue Einkaufsliste an.</p>
      </div>
    );
  }

  return (
    <div className="pb-28">
      {limit != null && (
        <div className="px-4 pt-3">
          <BudgetBar spent={monthSpent} limit={limit} />
        </div>
      )}

      <RecurringSuggestionsBanner listId={activeListId} />

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 pt-20 text-center">
          <span
            className="flex h-20 w-20 items-center justify-center rounded-full text-4xl shadow-lg"
            style={{ backgroundImage: vividGradient('#34C759') }}
          >
            🛒
          </span>
          <p className="font-semibold text-gray-600 dark:text-gray-300">Diese Liste ist leer</p>
          <p className="text-sm text-gray-400">Tippe auf + um Artikel hinzuzufügen.</p>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-5">
          {groups.map(({ category, items: groupItems }) => (
            <div key={category.id} className="px-4">
              <div className="mb-2 flex items-center gap-2 px-1">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs shadow-sm"
                  style={{ backgroundImage: vividGradient(category.color) }}
                >
                  {category.icon}
                </span>
                <h3 className="text-sm font-bold tracking-tight" style={{ color: category.color }}>
                  {category.name}
                </h3>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[11px] font-semibold text-gray-500 dark:text-gray-300"
                  style={{ backgroundColor: softTint(category.color, 0.14) }}
                >
                  {groupItems.length}
                </span>
              </div>
              <div className="glass overflow-hidden rounded-2xl divide-y divide-black/5 shadow-sm dark:divide-white/5">
                {groupItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    accentColor={category.color}
                    onToggle={() => db.items.update(item.id, { checked: !item.checked, checkedAt: Date.now() })}
                    onDelete={() => db.items.delete(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {listValue > 0 && items.length > 0 && (
        <p className="mt-3 px-5 text-xs text-gray-400">Geschätzter Wert der Liste: {listValue.toFixed(2)} €</p>
      )}

      <div
        className="fixed inset-x-0 z-10 flex justify-center gap-3 px-4"
        style={{ bottom: 'calc(74px + env(safe-area-inset-bottom))' }}
      >
        {checkedItems.length > 0 && (
          <button
            onClick={() => setCheckoutOpen(true)}
            className="max-w-xs flex-1 rounded-full py-3.5 text-center text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(0,122,255,0.55)] active:scale-[0.98] transition-transform"
            style={{ backgroundImage: vividGradient('#007AFF') }}
          >
            ✅ Einkauf abschließen ({checkedItems.length})
          </button>
        )}
        <button
          onClick={() => setAddOpen(true)}
          className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white shadow-[0_8px_20px_-6px_rgba(52,199,89,0.65)] active:scale-95 transition-transform ${
            checkedItems.length > 0 ? '' : 'mx-auto'
          }`}
          style={{ backgroundImage: vividGradient('#34C759') }}
          aria-label="Artikel hinzufügen"
        >
          +
        </button>
      </div>

      <AddItemSheet open={addOpen} onClose={() => setAddOpen(false)} listId={activeListId} />
      <CheckoutSheet
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        listId={activeListId}
        listName={list.name}
        checkedItems={checkedItems}
      />
    </div>
  );
}
