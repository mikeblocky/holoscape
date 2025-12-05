import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTaskbarTheme } from '@/theme/TaskbarThemeProvider';

const SESSION_STORAGE_KEY = 'holoscape:session:user';

export type SessionUser = {
  username: string;
  displayName: string;
  special: boolean;
  source: 'preset' | 'custom';
};

type AuthSessionContextValue = {
  user: SessionUser | null;
  login: (user: SessionUser) => void;
  logout: () => void;
};

const ACCENT_OVERRIDES: Record<string, string> = {
  guy: '#ff8ea8',
  larry: '#94b6ff',
  joey: '#8edc7b',
  gary: '#b0745b'
};

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(undefined);

export const AuthSessionProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { setAccent } = useTaskbarTheme();
  const [user, setUser] = useState<SessionUser | null>(null);

  const applyUserAccent = useCallback(
    (username?: string) => {
      if (!username) {
        return;
      }
      const accent = ACCENT_OVERRIDES[username.toLowerCase()];
      if (accent) {
        setAccent(accent);
      }
    },
    [setAccent]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed: SessionUser = JSON.parse(stored);
        setUser(parsed);
        applyUserAccent(parsed.username);
      }
    } catch {
      // ignore invalid session payloads
    }
  }, [applyUserAccent]);

  const login = useCallback(
    (nextUser: SessionUser) => {
      setUser(nextUser);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser));
        } catch {
          // ignore storage errors
        }
      }
      applyUserAccent(nextUser.username);
    },
    [applyUserAccent]
  );

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
    }
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
};

export const useAuthSession = () => {
  const context = useContext(AuthSessionContext);
  if (!context) {
    throw new Error('useAuthSession must be used within an AuthSessionProvider');
  }
  return context;
};
