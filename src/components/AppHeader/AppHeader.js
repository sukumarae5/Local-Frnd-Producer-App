/**
 * AppHeader
 * Themed screen header, safe-area aware. Works with or without React Navigation
 * (pass your own onBackPress, or omit showBack for screens with no back action).
 *
 * <AppHeader title="Video Call Settings" onBackPress={() => navigation.goBack()} />
 * <AppHeader title="Wallet" rightComponent={<CoinBadge amount={120} />} />
 */
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme';
import AppText from '../AppText/AppText';

const AppHeader = ({
  title,
  onBackPress,
  showBack = true,
  leftComponent,
  rightComponent,
  transparent = false,
  style,
}) => {
  const { theme } = useAppTheme();
  const { colors, spacing, headerHeight, iconSizes } = theme;
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          height: headerHeight + insets.top,
          paddingTop: insets.top,
          backgroundColor: transparent ? 'transparent' : colors.card,
          borderBottomColor: colors.border,
          borderBottomWidth: transparent ? 0 : StyleSheet.hairlineWidth,
          paddingHorizontal: spacing.md,
        },
        style,
      ]}
    >
      <View style={styles.side}>
        {leftComponent
          ? leftComponent
          : showBack && onBackPress && (
              <TouchableOpacity
                onPress={onBackPress}
                hitSlop={theme.hitSlop}
                style={styles.backButton}
              >
                {/* Simple chevron built from Views to avoid an icon-lib dependency here.
                    Swap for your icon set (e.g. react-native-vector-icons) if preferred. */}
                <View
                  style={[
                    styles.chevron,
                    { width: iconSizes.sm, height: iconSizes.sm, borderColor: colors.icon },
                  ]}
                />
              </TouchableOpacity>
            )}
      </View>

      <View style={styles.center}>
        {typeof title === 'string' ? (
          <AppText variant="h4" numberOfLines={1}>
            {title}
          </AppText>
        ) : (
          title
        )}
      </View>

      <View style={[styles.side, styles.rightSide]}>{rightComponent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  side: {
    minWidth: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSide: {
    justifyContent: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    padding: 4,
  },
  chevron: {
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
});

AppHeader.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onBackPress: PropTypes.func,
  showBack: PropTypes.bool,
  transparent: PropTypes.bool,
};

export default AppHeader;
