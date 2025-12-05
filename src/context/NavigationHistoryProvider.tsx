import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getRouteLabel } from '@/lib/routes';

type HistoryEntry = {
  path: string;
  label: string;
  timestamp: number;
};

type NavigationHistoryContextValue = {
  history: HistoryEntry[];
  clearHistory: () => void;
};

const NavigationHistoryContext = createContext<NavigationHistoryContextValue>({
  history: [],
  clearHistory: () => undefined
});

const HISTORY_KEY = 'holoscape:navigation-history';

export const NavigationHistoryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const location = useLocation();
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(HISTORY_KEY, []);

  useEffect(() => {
    const label = getRouteLabel(location.pathname);
    setHistory((prev: HistoryEntry[]) => {
      if (!label) return prev;
      if (prev[0]?.path === location.pathname) {
        return prev;
      }
      const filtered = prev.filter((entry) => entry.path !== location.pathname);
      const next: HistoryEntry[] = [
        { path: location.pathname, label, timestamp: Date.now() },
        ...filtered
      ];
      return next.slice(0, 10);
    });
  }, [location.pathname, setHistory]);

  const value = useMemo(
    () => ({
      history,
      clearHistory: () => setHistory([])
    }),
    [history, setHistory]
  );

  return <NavigationHistoryContext.Provider value={value}>{children}</NavigationHistoryContext.Provider>;
};

export const useNavigationHistory = () => useContext(NavigationHistoryContext);
