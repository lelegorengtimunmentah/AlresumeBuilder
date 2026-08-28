'use client';

import { useThemeContext } from '@/contexts/ThemeContext';

export type { ThemeContextValue as Theme } from '@/contexts/ThemeContext';

export function useTheme() {
  const { theme, isDark, setTheme, toggleTheme } = useThemeContext();
  return { theme, isDark, setTheme, toggleTheme };
}
