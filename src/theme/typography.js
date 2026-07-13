/**
 * typography.js
 * Responsive font sizes/weights using react-native-size-matters (moderateScale).
 * moderateScale scales gently against a 375-width baseline (iPhone X-ish),
 * so text doesn't blow up on tablets or shrink illegibly on small phones.
 */
import { moderateScale } from 'react-native-size-matters';
import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  android: {
    regular: 'sans-serif',
    medium: 'sans-serif-medium',
    semiBold: 'sans-serif-medium',
    bold: 'sans-serif',
  },
});

export const fontSizes = {
  xs: moderateScale(11),
  sm: moderateScale(13),
  md: moderateScale(15),
  base: moderateScale(16),
  lg: moderateScale(18),
  xl: moderateScale(20),
  xxl: moderateScale(24),
  xxxl: moderateScale(30),
  display: moderateScale(36),
};

export const lineHeights = {
  xs: moderateScale(15),
  sm: moderateScale(18),
  md: moderateScale(20),
  base: moderateScale(22),
  lg: moderateScale(24),
  xl: moderateScale(27),
  xxl: moderateScale(32),
  xxxl: moderateScale(38),
  display: moderateScale(44),
};

export const fontWeights = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
};

// Named text variants consumed by <AppText variant="h1" />
export const typographyVariants = {
  h1: { fontSize: fontSizes.xxxl, lineHeight: lineHeights.xxxl, fontWeight: fontWeights.bold },
  h2: { fontSize: fontSizes.xxl, lineHeight: lineHeights.xxl, fontWeight: fontWeights.bold },
  h3: { fontSize: fontSizes.xl, lineHeight: lineHeights.xl, fontWeight: fontWeights.semiBold },
  h4: { fontSize: fontSizes.lg, lineHeight: lineHeights.lg, fontWeight: fontWeights.semiBold },
  subtitle: { fontSize: fontSizes.md, lineHeight: lineHeights.md, fontWeight: fontWeights.medium },
  body: { fontSize: fontSizes.base, lineHeight: lineHeights.base, fontWeight: fontWeights.regular },
  bodySmall: { fontSize: fontSizes.sm, lineHeight: lineHeights.sm, fontWeight: fontWeights.regular },
  caption: { fontSize: fontSizes.xs, lineHeight: lineHeights.xs, fontWeight: fontWeights.regular },
  button: { fontSize: fontSizes.base, lineHeight: lineHeights.base, fontWeight: fontWeights.semiBold },
  overline: { fontSize: fontSizes.xs, lineHeight: lineHeights.xs, fontWeight: fontWeights.semiBold },
};

export default {
  fontFamily,
  fontSizes,
  lineHeights,
  fontWeights,
  typographyVariants,
};
