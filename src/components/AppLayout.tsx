import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import ListSwitcher from './ListSwitcher';

const TITLES: Record<string, string> = {
  '/history': 'Historie',
  '/stats': 'Statistik',
  '/settings': 'Einstellungen',
  '/settings/lists': 'Listen verwalten',
  '/settings/budget': 'Budget',
  '/settings/recurring': 'Wiederkehrende Artikel',
  '/settings/categories': 'Kategorien',
};

export default function AppLayout() {
  const location = useLocation();
  const isListPage = location.pathname === '/';
  const title = TITLES[location.pathname];

  return (
    <div className="flex h-full flex-col">
      <header className="safe-top sticky top-0 z-20 border-b border-white/60 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
        <div className="flex h-14 items-center justify-between px-4">
          {isListPage ? <ListSwitcher /> : <h1 className="text-[22px] font-bold tracking-tight">{title}</h1>}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
