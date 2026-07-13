import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const ActiveDostSectionScreen = () => {
  const { theme } = useAppTheme();
  const { spacing } = theme;

  return (
    <View>
      <AppText variant="h3" style={{ paddingTop: spacing.xl, paddingHorizontal: spacing.lg }}>
        Active Dost
      </AppText>

      <AppText
        variant="bodySmall"
        color="textMuted"
        style={{ marginTop: spacing.sm, paddingHorizontal: spacing.lg }}
      >
        No active dost right now...
      </AppText>
    </View>
  );
};

export default ActiveDostSectionScreen;