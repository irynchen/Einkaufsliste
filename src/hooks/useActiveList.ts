import { createContext, useContext } from 'react';

interface ActiveListContextValue {
  activeListId: string | null;
  setActiveListId: (id: string) => void;
}

export const ActiveListContext = createContext<ActiveListContextValue | null>(null);

export function useActiveList(): ActiveListContextValue {
  const ctx = useContext(ActiveListContext);
  if (!ctx) throw new Error('useActiveList must be used within ActiveListProvider');
  return ctx;
}
