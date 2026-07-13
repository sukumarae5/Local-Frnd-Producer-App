/**
 * theme.js
 * Combines colors + typography + metrics + shadows into two complete
 * theme objects: `lightTheme` and `darkTheme`. This is the single object
 * every component should destructure from `useAppTheme()`.
 */
import { lightColors, darkColors } from './colors';
import typography from './typography';
import metrics from './metrics';
import buildShadows from './shadows';

const buildTheme = (colors) => ({
  colors,
  ...typography,
  ...metrics,
  shadows: buildShadows(colors.shadowColor, colors.mode),
  isDark: colors.mode === 'dark',
});

export const lightTheme = buildTheme(lightColors);
export const darkTheme = buildTheme(darkColors);

export default { light: lightTheme, dark: darkTheme };
