/**
 * metrics.js
 * Spacing, border radius, and common component sizes.
 *
 * - scale(): horizontal-sensitive sizing (widths, horizontal padding, icons)
 * - verticalScale(): vertical-sensitive sizing (heights, vertical padding)
 * - moderateScale(): dampened scaling for anything that shouldn't grow too
 *   aggressively on tablets (font size, radius, small icons)
 */
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export const spacing = {
  xxs: scale(2),
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
  xxxl: scale(32),
  huge: scale(40),
};

export const verticalSpacing = {
  xxs: verticalScale(2),
  xs: verticalScale(4),
  sm: verticalScale(8),
  md: verticalScale(12),
  lg: verticalScale(16),
  xl: verticalScale(20),
  xxl: verticalScale(24),
  xxxl: verticalScale(32),
  huge: verticalScale(40),
};

export const radius = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(24),
  pill: moderateScale(999),
  full: 9999,
};

export const iconSizes = {
  xs: moderateScale(14),
  sm: moderateScale(18),
  md: moderateScale(22),
  lg: moderateScale(28),
  xl: moderateScale(34),
  xxl: moderateScale(44),
};

export const avatarSizes = {
  sm: moderateScale(32),
  md: moderateScale(48),
  lg: moderateScale(64),
  xl: moderateScale(96),
  xxl: moderateScale(120),
};

// Fixed-height controls (buttons/inputs) — verticalScale keeps them from
// ballooning on tablets while still adapting to small phones.
export const controlHeights = {
  sm: verticalScale(36),
  md: verticalScale(46),
  lg: verticalScale(54),
};

export const headerHeight = verticalScale(56);
export const tabBarHeight = verticalScale(64);

// Hit slop for touchable icons so tap targets stay accessible at any density
export const hitSlop = { top: scale(8), bottom: scale(8), left: scale(8), right: scale(8) };

export default {
  spacing,
  verticalSpacing,
  radius,
  iconSizes,
  avatarSizes,
  controlHeights,
  headerHeight,
  tabBarHeight,
  hitSlop,
};
