'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeState {
 theme: Theme;
 isDark: boolean;
}

interface ThemeActions {
 setTheme: (theme: Theme) => void;
 toggleTheme: () => void;
}

export type ThemeContextValue = ThemeState & ThemeActions;

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = 'theme';

function getInitialTheme(): Theme {
 if (typeof window === 'undefined') return 'light';
 const stored = localStorage.getItem(THEME_KEY);
 if (stored === 'light' || stored === 'dark') return stored;
 return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
 const [theme, setThemeState] = useState<Theme>('light');

 useEffect(() => {
 setThemeState(getInitialTheme());
 }, []);

 useEffect(() => {
 document.documentElement.classList.toggle('dark', theme === 'dark');
 localStorage.setItem(THEME_KEY, theme);
 }, [theme]);

 const setTheme = useCallback((t: Theme) => setThemeState(t), []);
 const toggleTheme = useCallback(() => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')), []);

 const value = useMemo<ThemeContextValue>(
 () => ({ theme, isDark: theme === 'dark', setTheme, toggleTheme }),
 [theme, setTheme, toggleTheme],
 );

 return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
 const ctx = useContext(ThemeContext);
 if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
 return ctx;
}

