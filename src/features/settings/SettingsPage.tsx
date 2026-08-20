import { Link } from 'react-router-dom';

const ENTRIES = [
  { to: '/settings/lists', icon: '🗂️', label: 'Listen verwalten', desc: 'Einkaufslisten anlegen & bearbeiten' },
  { to: '/settings/budget', icon: '💰', label: 'Budget', desc: 'Monatslimit gesamt & pro Kategorie' },
  { to: '/settings/recurring', icon: '🔁', label: 'Wiederkehrende Artikel', desc: 'Automatische Vorschläge verwalten' },
  { to: '/settings/categories', icon: '🏷️', label: 'Kategorien', desc: 'Globale Kategorien bearbeiten' },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-3 px-4 pt-3">
      <ul className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#1c1c1e]">
        {ENTRIES.map((entry, idx) => (
          <li key={entry.to} className={idx > 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''}>
            <Link to={entry.to} className="flex items-center gap-3 px-4 py-3.5">
              <span className="text-2xl">{entry.icon}</span>
              <span className="flex-1">
                <span className="block font-medium">{entry.label}</span>
                <span className="block text-xs text-gray-400">{entry.desc}</span>
              </span>
              <span className="text-gray-300 dark:text-gray-600">›</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-2 rounded-2xl bg-white p-4 text-center text-xs text-gray-400 shadow-sm dark:bg-[#1c1c1e]">
        Einkaufsliste · Alle Daten werden ausschließlich lokal auf deinem Gerät gespeichert.
      </div>
    </div>
  );
}
