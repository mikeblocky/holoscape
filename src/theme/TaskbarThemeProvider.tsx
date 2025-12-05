import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const TASKBAR_STORAGE_KEY = 'holoscape:taskbar-accent';

export type TaskbarTheme = {
  label: string;
  value: string;
};

type TaskbarThemeContextValue = {
  accent: string;
  setAccent: (value: string) => void;
  options: TaskbarTheme[];
};

const TaskbarThemeContext = createContext<TaskbarThemeContextValue | undefined>(undefined);

const THEME_OPTIONS: TaskbarTheme[] = [
  { label: 'Larry blue', value: '#94b6ff' },
  { label: 'Guy pink', value: '#ff8ea8' },
  { label: 'Gary clay', value: '#b0745b' },
  { label: 'Joey green', value: '#8edc7b' }
];

const darkenHex = (hex: string, amount = 0.25) => {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const clamp = (value: number) => Math.max(0, Math.min(255, value));
  const darkenChannel = (channel: number) => clamp(Math.round(channel * (1 - amount)));
  const toHex = (value: number) => value.toString(16).padStart(2, '0');
  const next = `#${toHex(darkenChannel(r))}${toHex(darkenChannel(g))}${toHex(darkenChannel(b))}`;
  return next;
};

export const TaskbarThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [accent, setAccentState] = useState(THEME_OPTIONS[0].value);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(TASKBAR_STORAGE_KEY);
      if (saved) {
        setAccentState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setAccent = (value: string) => {
    setAccentState(value);
    try {
      localStorage.setItem(TASKBAR_STORAGE_KEY, value);
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--taskbar-accent', accent);
    document.documentElement.style.setProperty('--portal-blue', accent);
    document.documentElement.style.setProperty('--portal-blue-dark', darkenHex(accent));
  }, [accent]);

  const value = useMemo(() => ({ accent, setAccent, options: THEME_OPTIONS }), [accent]);

  return <TaskbarThemeContext.Provider value={value}>{children}</TaskbarThemeContext.Provider>;
};

export const useTaskbarTheme = () => {
  const context = useContext(TaskbarThemeContext);
  if (!context) {
    throw new Error('useTaskbarTheme must be used within a TaskbarThemeProvider');
  }
  return context;
};
