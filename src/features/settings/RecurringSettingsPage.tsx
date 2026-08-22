import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import type { RecurringRule } from '../../types/models';
import { INTERVAL_LABELS, isRuleDue } from '../../utils/recurrence';
import RecurringRuleSheet from './RecurringRuleSheet';

export default function RecurringSettingsPage() {
  const rules = useLiveQuery(() => db.recurringRules.toArray(), []) ?? [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const lists = useLiveQuery(() => db.lists.toArray(), []) ?? [];
  const [editRule, setEditRule] = useState<RecurringRule | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const categoryOf = (id: string) => categories.find((c) => c.id === id);
  const listOf = (id: string) => lists.find((l) => l.id === id);

  return (
    <div className="flex flex-col gap-3 px-4 pt-3">
      <button
        onClick={() => {
          setEditRule(null);
          setSheetOpen(true);
        }}
        className="w-full rounded-2xl bg-ios-green py-3 text-center font-semibold text-white"
      >
        + Wiederkehrenden Artikel anlegen
      </button>

      {rules.length === 0 && (
        <p className="mt-8 text-center text-sm text-gray-400">
          Noch keine wiederkehrenden Artikel. Markiere Artikel beim Hinzufügen als wiederkehrend oder lege sie hier
          an.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {rules.map((rule) => {
          const cat = categoryOf(rule.categoryId);
          const list = listOf(rule.listId);
          const due = isRuleDue(rule.lastAddedAt, rule.interval);
          return (
            <li
              key={rule.id}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-[#1c1c1e]"
            >
              <span className="text-2xl">{cat?.icon ?? '🛒'}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{rule.itemName}</p>
                <p className="truncate text-xs text-gray-400">
                  {INTERVAL_LABELS[rule.interval]} · {list?.name ?? '—'} {due && '· fällig'}
                </p>
              </div>
              <button
                role="switch"
                aria-checked={rule.active}
                onClick={() => db.recurringRules.update(rule.id, { active: !rule.active })}
                className={`h-6 w-11 rounded-full transition-colors ${
                  rule.active ? 'bg-ios-green' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform ${
                    rule.active ? 'translate-x-5' : ''
                  }`}
                />
              </button>
              <button
                onClick={() => {
                  setEditRule(rule);
                  setSheetOpen(true);
                }}
                className="text-sm font-medium text-ios-blue"
              >
                Bearbeiten
              </button>
              <button
                onClick={() => db.recurringRules.delete(rule.id)}
                className="text-sm font-medium text-ios-red"
              >
                Löschen
              </button>
            </li>
          );
        })}
      </ul>

      <RecurringRuleSheet open={sheetOpen} onClose={() => setSheetOpen(false)} rule={editRule} />
    </div>
  );
}
