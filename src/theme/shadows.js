/**
 * shadows.js
 * Cross-platform elevation presets. iOS uses shadow* props, Android uses `elevation`.
 * Pass the active theme's shadowColor in so shadows look correct in dark mode
 * (dark mode generally wants softer/less visible shadows).
 */
import { Platform } from 'react-native';

export const buildShadows = (shadowColor = '#000000', mode = 'light') => {
  const opacityMultiplier = mode === 'dark' ? 0.6 : 1;

  const level = (elevation, opacity, radiusPx, offsetY) =>
    Platform.select({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: offsetY },
        shadowOpacity: opacity * opacityMultiplier,
        shadowRadius: radiusPx,
      },
      android: {
        elevation,
      },
      default: {},
    });

  return {
    none: {},
    xs: level(1, 0.06, 2, 1),
    sm: level(2, 0.08, 4, 2),
    md: level(4, 0.12, 8, 3),
    lg: level(8, 0.16, 14, 5),
    xl: level(12, 0.2, 20, 8),
  };
};

export default buildShadows;
