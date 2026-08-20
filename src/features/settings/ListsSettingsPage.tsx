import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useActiveList } from '../../hooks/useActiveList';
import type { ShoppingList } from '../../types/models';

const ICONS = ['🛒', '🧴', '🔨', '💊', '🎁', '🍕', '🐾', '👶', '🏡', '🚗'];
const COLORS = ['#34C759', '#007AFF', '#FF9500', '#FF3B30', '#AF52DE', '#5AC8FA', '#FFCC00', '#8E8E93'];

export default function ListsSettingsPage() {
  const lists = useLiveQuery(() => db.lists.toArray(), []) ?? [];
  const { activeListId, setActiveListId } = useActiveList();
  const [editing, setEditing] = useState<ShoppingList | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [showForm, setShowForm] = useState(false);

  const startNew = () => {
    setEditing(null);
    setName('');
    setIcon(ICONS[0]);
    setColor(COLORS[0]);
    setShowForm(true);
  };

  const startEdit = (list: ShoppingList) => {
    setEditing(list);
    setName(list.name);
    setIcon(list.icon);
    setColor(list.color);
    setShowForm(true);
  };

  const save = async () => {
    if (!name.trim()) return;
    if (editing) {
      await db.lists.update(editing.id, { name: name.trim(), icon, color });
    } else {
      const id = crypto.randomUUID();
      await db.lists.add({ id, name: name.trim(), icon, color, createdAt: Date.now() });
      setActiveListId(id);
    }
    setShowForm(false);
  };

  const archive = async (list: ShoppingList) => {
    await db.lists.update(list.id, { archived: !list.archived });
  };

  const remove = async (list: ShoppingList) => {
    if (!confirm(`Liste "${list.name}" inkl. aller Artikel löschen?`)) return;
    await db.items.where('listId').equals(list.id).delete();
    await db.lists.delete(list.id);
  };

  return (
    <div className="flex flex-col gap-3 px-4 pt-3">
      {!showForm && (
        <button onClick={startNew} className="w-full rounded-2xl bg-ios-green py-3 text-center font-semibold text-white">
          + Neue Liste anlegen
        </button>
      )}

      {showForm && (
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-[#1c1c1e]">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name der Liste"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-ios-green dark:border-gray-700 dark:bg-gray-800"
          />
          <div>
            <p className="mb-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">Icon</p>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${
                    icon === i ? 'bg-ios-green/20 ring-2 ring-ios-green' : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">Farbe</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`h-8 w-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-black' : ''}`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 rounded-xl bg-gray-100 py-3 font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              Abbrechen
            </button>
            <button onClick={save} disabled={!name.trim()} className="flex-1 rounded-xl bg-ios-green py-3 font-semibold text-white disabled:opacity-40">
              Speichern
            </button>
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {lists.map((list) => (
          <li key={list.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-[#1c1c1e]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full text-xl" style={{ backgroundColor: `${list.color}22` }}>
              {list.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{list.name}</p>
              {list.id === activeListId && <p className="text-xs text-ios-green">Aktive Liste</p>}
              {list.archived && <p className="text-xs text-gray-400">Archiviert</p>}
            </div>
            <button onClick={() => startEdit(list)} className="text-sm font-medium text-ios-blue">
              Bearbeiten
            </button>
            <button onClick={() => archive(list)} className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {list.archived ? 'Reaktivieren' : 'Archivieren'}
            </button>
            <button onClick={() => remove(list)} className="text-sm font-medium text-ios-red">
              Löschen
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
