import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import { useActiveList } from '../hooks/useActiveList';
import { vividGradient, softTint } from '../utils/color';
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
        className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 shadow-sm active:scale-[0.97] transition-transform"
        style={{ backgroundColor: softTint(activeList?.color ?? '#34C759', 0.16) }}
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-base leading-none shadow-sm"
          style={{ backgroundImage: vividGradient(activeList?.color ?? '#34C759') }}
        >
          {activeList?.icon ?? '🛒'}
        </span>
        <span className="max-w-[42vw] truncate text-base font-bold">{activeList?.name ?? 'Liste wählen'}</span>
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
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all ${
                    list.id === activeListId ? 'ring-2' : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                  style={
                    list.id === activeListId
                      ? { backgroundColor: softTint(list.color, 0.14), boxShadow: `0 0 0 2px ${softTint(list.color, 0.5)}` }
                      : undefined
                  }
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl shadow-sm"
                    style={{ backgroundImage: vividGradient(list.color) }}
                  >
                    {list.icon}
                  </span>
                  <span className="flex-1 font-semibold">{list.name}</span>
                  {list.id === activeListId && <span style={{ color: list.color }}>✓</span>}
                </button>
              </li>
            ))}
        </ul>
        <button
          onClick={() => {
            setOpen(false);
            navigate('/settings/lists');
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-white shadow-md active:scale-[0.98] transition-transform"
          style={{ backgroundImage: vividGradient('#34C759') }}
        >
          + Neue Liste anlegen
        </button>
      </Sheet>
    </>
  );
}
