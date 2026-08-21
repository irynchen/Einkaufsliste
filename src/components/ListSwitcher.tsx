import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import { useActiveList } from '../hooks/useActiveList';
import Sheet from './Sheet';

export default function ListSwitcher() {
  const [open, setOpen] = useState(false);
  const { activeListId, setActiveListId } = useActiveList();
  const lists = useLiveQuery(() => db.lists.toArray(), []) ?? [];
  const activeList = lists.find((l) => l.id === activeListId);
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-gray-100 py-1.5 pl-1.5 pr-3 shadow-sm active:scale-[0.97] dark:bg-gray-800 transition-transform"
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-base leading-none"
          style={{ backgroundColor: `${activeList?.color ?? '#34C759'}22` }}
        >
          {activeList?.icon ?? '🛒'}
        </span>
        <span className="max-w-[42vw] truncate text-base font-semibold">{activeList?.name ?? 'Liste wählen'}</span>
        <span className="text-xs text-gray-400">▾</span>
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Meine Listen">
        <ul className="flex flex-col gap-2">
          {lists
            .filter((l) => !l.archived)
            .map((list) => (
              <li key={list.id}>
                <button
                  onClick={() => {
                    setActiveListId(list.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ${
                    list.id === activeListId
                      ? 'bg-ios-green/15 ring-1 ring-ios-green'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <span className="text-2xl">{list.icon}</span>
                  <span className="flex-1 font-medium">{list.name}</span>
                  {list.id === activeListId && <span className="text-ios-green">✓</span>}
                </button>
              </li>
            ))}
        </ul>
        <button
          onClick={() => {
            setOpen(false);
            navigate('/settings/lists');
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-ios-green py-3 font-semibold text-white"
        >
          + Neue Liste anlegen
        </button>
      </Sheet>
    </>
  );
}
