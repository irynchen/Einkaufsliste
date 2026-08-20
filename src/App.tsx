import { Suspense, lazy, useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/db';
import { ActiveListContext } from './hooks/useActiveList';
import AppLayout from './components/AppLayout';
import ListPage from './features/list/ListPage';
import HistoryPage from './features/history/HistoryPage';
import SettingsPage from './features/settings/SettingsPage';

const StatsPage = lazy(() => import('./features/stats/StatsPage'));
import ListsSettingsPage from './features/settings/ListsSettingsPage';
import BudgetSettingsPage from './features/settings/BudgetSettingsPage';
import RecurringSettingsPage from './features/settings/RecurringSettingsPage';
import CategoriesSettingsPage from './features/settings/CategoriesSettingsPage';

const ACTIVE_LIST_KEY = 'einkaufsliste:active-list-id';

function App() {
  const allLists = useLiveQuery(() => db.lists.toArray(), []);
  const [activeListId, setActiveListIdState] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_LIST_KEY),
  );

  useEffect(() => {
    if (!allLists) return;
    const stillExists = allLists.some((l) => l.id === activeListId && !l.archived);
    if (!stillExists) {
      const first = allLists.find((l) => !l.archived) ?? allLists[0];
      if (first) setActiveListIdState(first.id);
    }
  }, [allLists, activeListId]);

  const setActiveListId = (id: string) => {
    setActiveListIdState(id);
    localStorage.setItem(ACTIVE_LIST_KEY, id);
  };

  if (!allLists) return null;

  return (
    <ActiveListContext.Provider value={{ activeListId, setActiveListId }}>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<ListPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route
              path="/stats"
              element={
                <Suspense fallback={<div className="p-6 text-center text-gray-400">Lädt…</div>}>
                  <StatsPage />
                </Suspense>
              }
            />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/lists" element={<ListsSettingsPage />} />
            <Route path="/settings/budget" element={<BudgetSettingsPage />} />
            <Route path="/settings/recurring" element={<RecurringSettingsPage />} />
            <Route path="/settings/categories" element={<CategoriesSettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </ActiveListContext.Provider>
  );
}

export default App;
