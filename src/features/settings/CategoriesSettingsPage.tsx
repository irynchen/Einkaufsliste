import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import Sheet from '../../components/Sheet';

const ICONS = ['🥦', '🥛', '🥩', '🥤', '🧴', '🛒', '🍞', '🧀', '🍎', '🐟', '🧊', '🧻'];
const COLORS = ['#34C759', '#5AC8FA', '#FF3B30', '#FF9500', '#AF52DE', '#8E8E93', '#FFCC00', '#007AFF'];

export default function CategoriesSettingsPage() {
  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray(), []) ?? [];
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);

  const add = async () => {
    if (!name.trim()) return;
    await db.categories.add({
      id: crypto.randomUUID(),
      name: name.trim(),
      icon,
      color,
      order: categories.length,
    });
    setName('');
    setIcon(ICONS[0]);
    setColor(COLORS[0]);
    setOpen(false);
  };

  const remove = async (id: string) => {
    const inUse = await db.items.where('categoryId').equals(id).count();
    if (inUse > 0) {
      alert('Diese Kategorie wird noch von Artikeln verwendet und kann nicht gelöscht werden.');
      return;
    }
    await db.categories.delete(id);
  };

  return (
    <div className="flex flex-col gap-3 px-4 pt-3">
      <button onClick={() => setOpen(true)} className="w-full rounded-2xl bg-ios-green py-3 text-center font-semibold text-white">
        + Kategorie hinzufügen
      </button>

      <ul className="flex flex-col gap-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-[#1c1c1e]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full text-lg" style={{ backgroundColor: `${c.color}22` }}>
              {c.icon}
            </span>
            <span className="flex-1 font-medium">{c.name}</span>
            {!c.isDefault && (
              <button onClick={() => remove(c.id)} className="text-sm font-medium text-ios-red">
                Löschen
              </button>
            )}
          </li>
        ))}
      </ul>

      <Sheet open={open} onClose={() => setOpen(false)} title="Neue Kategorie">
        <div className="flex flex-col gap-4">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name der Kategorie"
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
          <button onClick={add} disabled={!name.trim()} className="w-full rounded-xl bg-ios-green py-3.5 font-semibold text-white disabled:opacity-40">
            Hinzufügen
          </button>
        </div>
      </Sheet>
    </div>
  );
}
