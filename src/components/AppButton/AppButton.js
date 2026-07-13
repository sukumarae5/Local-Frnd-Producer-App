/**
 * AppButton
 * variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * size:    'sm' | 'md' | 'lg'
 *
 * <AppButton title="Start Call" onPress={handleStart} loading={isConnecting} />
 * <AppButton title="Cancel" variant="outline" onPress={handleCancel} />
 */
import React from 'react';
import { TouchableOpacity, ActivityIndicator, View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useAppTheme } from '../../theme';
import AppText from '../AppText/AppText';

const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  style,
  textStyle,
  ...rest
}) => {
  const { theme } = useAppTheme();
  const { colors, spacing, radius, controlHeights, shadows } = theme;

  const palette = {
    primary: { bg: colors.primary, border: colors.primary, text: colors.textInverse },
    secondary: { bg: colors.secondary, border: colors.secondary, text: colors.textInverse },
    outline: { bg: 'transparent', border: colors.primary, text: colors.primary },
    ghost: { bg: 'transparent', border: 'transparent', text: colors.primary },
    danger: { bg: colors.error, border: colors.error, text: colors.textInverse },
  }[variant];

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.base,
        {
          height: controlHeights[size],
          backgroundColor: isDisabled ? colors.disabled : palette.bg,
          borderColor: isDisabled ? colors.disabled : palette.border,
          borderRadius: radius.md,
          paddingHorizontal: spacing.lg,
          width: fullWidth ? '100%' : undefined,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        variant === 'primary' || variant === 'secondary' || variant === 'danger'
          ? shadows.sm
          : null,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} size="small" />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={{ marginRight: spacing.sm }}>{leftIcon}</View> : null}
          <AppText
            variant="button"
            style={[{ color: isDisabled ? colors.textMuted : palette.text }, textStyle]}
          >
            {title}
          </AppText>
          {rightIcon ? <View style={{ marginLeft: spacing.sm }}>{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

AppButton.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
};

export default AppButton;
