/**
 * AppCard
 * Themed surface container — use for profile cards, offer cards, list items, etc.
 * Wraps children in a themed background + radius + shadow. Set `onPress` to make it tappable.
 *
 * <AppCard onPress={openProfile}>
 *   <AppText variant="h4">Priya, 24</AppText>
 * </AppCard>
 */
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useAppTheme } from '../../theme';

const AppCard = ({
  children,
  onPress,
  padding = 'md',
  elevation = 'sm',
  style,
  ...rest
}) => {
  const { theme } = useAppTheme();
  const { colors, spacing, radius, shadows } = theme;

  const content = (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          borderColor: colors.border,
          padding: spacing[padding] ?? spacing.md,
        },
        shadows[elevation],
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
    width: '100%',
  },
});

AppCard.propTypes = {
  onPress: PropTypes.func,
  padding: PropTypes.oneOf(['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl']),
  elevation: PropTypes.oneOf(['none', 'xs', 'sm', 'md', 'lg', 'xl']),
};

export default AppCard;
