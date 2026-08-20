import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { isRuleDue } from '../../utils/recurrence';

interface Props {
  listId: string;
}

export default function RecurringSuggestionsBanner({ listId }: Props) {
  const rules = useLiveQuery(
    () => db.recurringRules.where('listId').equals(listId).and((r) => r.active).toArray(),
    [listId],
  ) ?? [];
  const existingItems = useLiveQuery(() => db.items.where('listId').equals(listId).toArray(), [listId]) ?? [];

  const dueRules = rules.filter((r) => {
    const alreadyInList = existingItems.some((i) => i.recurringRuleId === r.id);
    return !alreadyInList && isRuleDue(r.lastAddedAt, r.interval);
  });

  if (dueRules.length === 0) return null;

  const addOne = async (ruleId: string) => {
    const rule = dueRules.find((r) => r.id === ruleId);
    if (!rule) return;
    await db.items.add({
      id: crypto.randomUUID(),
      listId,
      name: rule.itemName,
      quantity: rule.quantity,
      unit: rule.unit,
      categoryId: rule.categoryId,
      checked: false,
      recurringRuleId: rule.id,
      createdAt: Date.now(),
    });
    await db.recurringRules.update(ruleId, { lastAddedAt: Date.now() });
  };

  const addAll = async () => {
    for (const rule of dueRules) {
      await addOne(rule.id);
    }
  };

  return (
    <div className="mx-4 mt-3 rounded-2xl border border-ios-blue/20 bg-ios-blue/5 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-ios-blue">🔁 Wiederkehrende Artikel fällig</p>
        <button onClick={addAll} className="text-sm font-semibold text-ios-blue">
          Alle hinzufügen
        </button>
      </div>
      <ul className="flex flex-wrap gap-2">
        {dueRules.map((r) => (
          <li key={r.id}>
            <button
              onClick={() => addOne(r.id)}
              className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200"
            >
              + {r.itemName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
