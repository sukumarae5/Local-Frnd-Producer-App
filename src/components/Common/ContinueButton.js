import React, { useMemo } from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { moderateScale } from 'react-native-size-matters';
import { useAppTheme } from '../../theme';
import { AppText } from '../index';

const ContinueButton = ({ title = 'CONTINUE', onPress, disabled = false, loading = false, style = {} }) => {
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, width), [theme, width]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.wrapper, style]}
    >
      <LinearGradient
        colors={['#D51BF9', '#8C37F8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, (disabled || loading) && { opacity: 0.8 }]}
      >
        {loading ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <AppText variant="button" style={styles.text}>{title}</AppText>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default ContinueButton;

const createStyles = (theme, width) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    wrapper: {
      width: width - spacing.xxxl * 1.5, // proportional inset, matches original width-48 intent
      alignSelf: 'center',
    },
    button: {
      height: moderateScale(50),
      borderRadius: radius.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: colors.textInverse,
      letterSpacing: 1,
    },
  });
};