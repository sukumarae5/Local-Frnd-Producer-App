/**
 * AppInput
 * Themed text input with label, error state, focus border, and left/right slots.
 *
 * <AppInput
 *   label="Email"
 *   value={email}
 *   onChangeText={setEmail}
 *   error={errors.email}
 *   leftIcon={<MailIcon />}
 * />
 */
import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useAppTheme } from '../../theme';
import AppText from '../AppText/AppText';

const AppInput = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  size = 'md',
  ...rest
}) => {
  const { theme } = useAppTheme();
  const { colors, spacing, radius, controlHeights, fontSizes } = theme;
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.error
    : focused
    ? colors.inputBorderFocused
    : colors.inputBorder;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <AppText variant="bodySmall" color="textSecondary" style={{ marginBottom: spacing.xs }}>
          {label}
        </AppText>
      ) : null}

      <View
        style={[
          styles.inputRow,
          {
            height: controlHeights[size],
            backgroundColor: colors.inputBackground,
            borderColor,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        {leftIcon ? <View style={{ marginRight: spacing.sm }}>{leftIcon}</View> : null}
        <TextInput
          placeholderTextColor={colors.placeholder}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus && rest.onFocus(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur && rest.onBlur(e);
          }}
          style={[
            styles.input,
            { color: colors.text, fontSize: fontSizes.base },
            inputStyle,
          ]}
          {...rest}
        />
        {rightIcon ? <View style={{ marginLeft: spacing.sm }}>{rightIcon}</View> : null}
      </View>

      {error ? (
        <AppText variant="caption" color="error" style={{ marginTop: spacing.xs }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
  },
  input: {
    flex: 1,
    padding: 0, // rely on row's paddingHorizontal; avoids Android default padding quirks
  },
});

AppInput.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default AppInput;
