/**
 * navigationTheme.js
 * Maps our design-system colors onto React Navigation's theme shape,
 * so headers, tab bars, and screen backgrounds provided by RN Navigation
 * switch automatically with the app theme.
 *
 * Usage (see examples/App.example.js):
 *   const { theme, isDark } = useAppTheme();
 *   <NavigationContainer theme={isDark ? buildNavigationTheme(darkTheme) : buildNavigationTheme(lightTheme)}>
 */
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

export const buildNavigationTheme = (appTheme) => {
  const base = appTheme.isDark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark: appTheme.isDark,
    colors: {
      ...base.colors,
      primary: appTheme.colors.primary,
      background: appTheme.colors.background,
      card: appTheme.colors.card,
      text: appTheme.colors.text,
      border: appTheme.colors.border,
      notification: appTheme.colors.error,
    },
  };
};

export default buildNavigationTheme;
