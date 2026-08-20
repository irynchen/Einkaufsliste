import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Liste', icon: '📝', end: true },
  { to: '/history', label: 'Historie', icon: '🧾', end: false },
  { to: '/stats', label: 'Statistik', icon: '📊', end: false },
  { to: '/settings', label: 'Einstellungen', icon: '⚙️', end: false },
];

export default function BottomNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-black/80">
      <ul className="flex">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                  isActive ? 'text-ios-green' : 'text-gray-500 dark:text-gray-400'
                }`
              }
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
