/**
 * ThemeProvider.js
 *
 * - Detects system theme via useColorScheme() and reacts live when the user
 *   flips their device between Light/Dark while the app is open.
 * - Supports an optional manual override ('light' | 'dark' | 'system') that
 *   persists across app restarts via AsyncStorage — useful for an in-app
 *   "Appearance" setting.
 * - Exposes `useAppTheme()` for consumption anywhere in the tree.
 *
 * Requires: @react-native-async-storage/async-storage
 *   npm install @react-native-async-storage/async-storage
 * (If you don't want persistence, delete the AsyncStorage calls below and
 * the provider will simply always follow the system setting.)
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme, StatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from './theme';

const THEME_STORAGE_KEY = '@localfrnd/theme_mode'; // 'light' | 'dark' | 'system'

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [themeMode, setThemeModeState] = useState('system'); // user preference
  const [hydrated, setHydrated] = useState(false);

  // Load persisted preference once on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setThemeModeState(stored);
        }
      } catch (e) {
        // ignore — fall back to system
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const setThemeMode = useCallback(async (mode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      // ignore persistence failure — in-memory state still updates
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      return next;
    });
  }, []);
  // toggleTheme flips between light/dark explicitly (opts out of "system")
  const handleToggle = useCallback(() => {
    const resolved = themeMode === 'system' ? (systemScheme || 'light') : themeMode;
    setThemeMode(resolved === 'dark' ? 'light' : 'dark');
  }, [themeMode, systemScheme, setThemeMode]);

  const activeScheme = themeMode === 'system' ? (systemScheme || 'light') : themeMode;
  const theme = activeScheme === 'dark' ? darkTheme : lightTheme;

  // Keep native StatusBar in sync automatically
  useEffect(() => {
    StatusBar.setBarStyle(theme.colors.statusBar, true);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(theme.colors.background, true);
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      colorScheme: activeScheme,
      themeMode, // 'light' | 'dark' | 'system'
      isDark: activeScheme === 'dark',
      setThemeMode,
      toggleTheme: handleToggle,
      hydrated,
    }),
    [theme, activeScheme, themeMode, setThemeMode, handleToggle, hydrated]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme() must be used inside <ThemeProvider>. Wrap your App root with it.');
  }
  return ctx;
};

export default ThemeProvider;
