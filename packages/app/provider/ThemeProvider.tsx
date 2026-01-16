import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { generatePalette } from '../utils/theme-generator';
import { Platform, useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  primaryColor: string;
  palette: Record<number, string>;
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  primaryColor: '#000000',
  palette: {},
  themeMode: 'system',
  isDarkMode: false,
  setThemeMode: () => { },
  toggleTheme: () => { },
});

export const ThemeProvider: React.FC<{
  primaryColor: string;
  children: React.ReactNode
}> = ({ primaryColor, children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  // Initialize theme from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        let savedMode: string | null = null;
        if (Platform.OS === 'web') {
          savedMode = localStorage.getItem('sovereign_theme_mode');
        } else {
          savedMode = await SecureStore.getItemAsync('sovereign_theme_mode');
        }
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setThemeModeState(savedMode as ThemeMode);
        }
      } catch (e) {
        console.warn('Failed to load theme preference:', e);
      }
    };
    loadTheme();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('sovereign_theme_mode', mode);
      } else {
        await SecureStore.setItemAsync('sovereign_theme_mode', mode);
      }
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  };

  /* SIMPLIFIED TOGGLE: Light <-> Dark (System mode removed for clearer UX) */
  const toggleTheme = () => {
    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  const isDarkMode = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const palette = useMemo(() => generatePalette(primaryColor), [primaryColor]);

  // Apply CSS Variables & Classes for Web AND Mobile (if supported via context)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const root = document.documentElement;

      // 1. apply CSS vars
      Object.entries(palette).forEach(([shade, hex]) => {
        root.style.setProperty(`--color-primary-${shade}`, hex);
      });
      root.style.setProperty('--primary-color', primaryColor);

      // 2. FORCE apply 'dark' class for Tailwind
      if (isDarkMode) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    }
  }, [primaryColor, palette, isDarkMode]);

  return (
    <ThemeContext.Provider value={{ primaryColor, palette, themeMode, isDarkMode, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
