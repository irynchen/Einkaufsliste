import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Liste', icon: '📝', end: true, color: '#34C759', gradient: 'linear-gradient(135deg, #5BE377, #34C759)' },
  { to: '/history', label: 'Historie', icon: '🧾', end: false, color: '#007AFF', gradient: 'linear-gradient(135deg, #4DB8FF, #007AFF)' },
  { to: '/stats', label: 'Statistik', icon: '📊', end: false, color: '#FF9500', gradient: 'linear-gradient(135deg, #FFB13D, #FF9500)' },
  { to: '/settings', label: 'Einstellungen', icon: '⚙️', end: false, color: '#AF52DE', gradient: 'linear-gradient(135deg, #C77DFF, #AF52DE)' },
];

export default function BottomNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-white/60 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
      <ul className="flex px-2 pt-1.5">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `group flex flex-col items-center gap-1 pb-1.5 text-[11px] font-semibold transition-colors ${
                  isActive ? '' : 'text-gray-400 dark:text-gray-500'
                }`
              }
              style={({ isActive }) => (isActive ? { color: tab.color } : undefined)}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-12 items-center justify-center rounded-full text-xl leading-none shadow-sm transition-all ${
                      isActive ? 'scale-105' : 'scale-95 bg-transparent shadow-none'
                    }`}
                    style={isActive ? { backgroundImage: tab.gradient } : undefined}
                  >
                    <span style={isActive ? { filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))' } : undefined}>
                      {tab.icon}
                    </span>
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
