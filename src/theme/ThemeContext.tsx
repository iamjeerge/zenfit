/**
 * @file ThemeContext.tsx
 * @module theme/ThemeContext
 * @description Theme context provider — exposes the current colour scheme (light / dark)
 * and a toggle function to all descendant components.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, LightColors, Gradients, LightGradients, Shadows, LightShadows } from './colors';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: typeof Colors;
  gradients: typeof Gradients;
  shadows: typeof Shadows;
  setMode: (mode: ThemeMode) => void;
}

const THEME_KEY = 'zenfit:theme_mode';

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  isDark: true,
  colors: Colors,
  gradients: Gradients,
  shadows: Shadows,
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        setModeState(saved);
      }
    });
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(THEME_KEY, newMode);
  };

  const isDark = mode === 'dark' || (mode === 'system' && systemScheme !== 'light');

  const value: ThemeContextValue = {
    mode,
    isDark,
    colors: isDark ? Colors : (LightColors as unknown as typeof Colors),
    gradients: isDark ? Gradients : (LightGradients as unknown as typeof Gradients),
    shadows: isDark ? Shadows : LightShadows,
    setMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
