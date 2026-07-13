/**
 * colors.js
 * Centralized color tokens for Light & Dark themes.
 * Every screen/component should pull colors from here — never hardcode hex values inline,
 * unless a color is genuinely one-off (used in exactly one place, e.g. a single promo card accent).
 */

const brand = {
  primary: '#FF4667',
  primaryDark: '#D6324F',
  secondary: '#7B61FF',
  gold: '#FFC542',
  online: '#33D17A',
  offline: '#9AA0A6',
  purple: '#C44DFF', // used in avatar rings, edit buttons, icon backgrounds
  magenta: '#C51DAF', // used in call icons, badges, primary buttons (Messages/RecentCalls)
  gradientPurpleStart: '#D51BF9', // recurring gradient pair — HomeHeader, GoOnlineCard, ChatScreen
  gradientPurpleEnd: '#8C37F8',
  orbitDotted: '#C78CFF', // dotted orbit-ring border — Onboard/WelcomeScreen02
  linkPurple: '#9747FF',
  accentViolet: '#8A2DFF', // NotificationScreen icon/line, InterestScreen active tag
  accentFuchsia: '#C72CFF',
  royalPurple: '#9333EA',
  editPurple: '#B832F9', // EditProfile family screens (avatar ring, DONE buttons, selection states)
  lavenderTint: '#F6ECFF',
};

export const lightColors = {
  mode: 'light',

  primary: brand.primary,
  primaryDark: brand.primaryDark,
  secondary: brand.secondary,
  gold: brand.gold,
  purple: brand.purple,
  magenta: brand.magenta,
  orbitDotted: brand.orbitDotted,
  linkPurple: brand.linkPurple,
  gradientPurpleStart: brand.gradientPurpleStart,
  gradientPurpleEnd: brand.gradientPurpleEnd,
  editPurple: brand.editPurple,
  lavenderTint: brand.lavenderTint,
  background: '#FFFFFF',
  surface: '#F7F7FA',
  card: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.45)',
  modalBackground: '#FFFFFF',

  text: '#161618',
  textSecondary: '#5F6368',
  textMuted: '#9AA0A6',
  textInverse: '#FFFFFF',
  placeholder: '#A0A4AB',

  border: '#E6E7EB',
  divider: '#EEEEF1',

  success: '#2ECC71',
  error: '#FF4D4F',
  warning: '#FFA940',
  info: '#3B82F6',

  online: brand.online,
  offline: brand.offline,
  accentViolet: brand.accentViolet,
  accentFuchsia: brand.accentFuchsia,
  inputBackground: '#F2F2F6',
  inputBorder: '#E1E2E6',
  inputBorderFocused: brand.primary,
  royalPurple: brand.royalPurple,
  icon: '#3C3C43',
  iconMuted: '#9AA0A6',

  disabled: '#D8D9DE',
  shadowColor: '#000000',
  statusBar: 'dark-content',
};

export const darkColors = {
  mode: 'dark',

  primary: brand.primary,
  primaryDark: brand.primaryDark,
  secondary: brand.secondary,
  gold: brand.gold,
  purple: brand.purple, // was missing — this was the bug
  magenta: brand.magenta,
  gradientPurpleStart: brand.gradientPurpleStart,
  gradientPurpleEnd: brand.gradientPurpleEnd,
  editPurple: brand.editPurple,
  lavenderTint: brand.lavenderTint,
  background: '#0F0F12',
  surface: '#18181C',
  card: '#1E1E23',
  overlay: 'rgba(0,0,0,0.6)',
  modalBackground: '#1E1E23',

  text: '#F5F5F7',
  textSecondary: '#B7B9C0',
  textMuted: '#7B7D85',
  textInverse: '#161618',
  placeholder: '#6E7078',

  border: '#2A2A30',
  divider: '#242429',

  success: '#3DDC84',
  error: '#FF6B6B',
  warning: '#FFB454',
  info: '#5B9BFF',

  online: brand.online,
  offline: brand.offline,
  orbitDotted: brand.orbitDotted,
  linkPurple: brand.linkPurple,
  accentViolet: brand.accentViolet,
  accentFuchsia: brand.accentFuchsia,
  royalPurple: brand.royalPurple,
  inputBackground: '#232328',
  inputBorder: '#2E2E35',
  inputBorderFocused: brand.primary,

  icon: '#E6E6E8',
  iconMuted: '#7B7D85',

  disabled: '#3A3A40',
  shadowColor: '#000000',
  statusBar: 'light-content',
};

export default { light: lightColors, dark: darkColors };
