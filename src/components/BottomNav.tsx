import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Liste', icon: '📝', end: true },
  { to: '/history', label: 'Historie', icon: '🧾', end: false },
  { to: '/stats', label: 'Statistik', icon: '📊', end: false },
  { to: '/settings', label: 'Einstellungen', icon: '⚙️', end: false },
];

export default function BottomNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-gray-200/80 bg-white/90 backdrop-blur-xl dark:border-gray-800/80 dark:bg-black/80">
      <ul className="flex px-2 pt-1.5">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `group flex flex-col items-center gap-1 pb-1.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-ios-green' : 'text-gray-400 dark:text-gray-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-12 items-center justify-center rounded-full text-xl leading-none transition-all ${
                      isActive ? 'scale-100 bg-ios-green/12' : 'scale-95 bg-transparent'
                    }`}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
