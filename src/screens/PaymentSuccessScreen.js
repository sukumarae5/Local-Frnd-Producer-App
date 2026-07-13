import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { resetPurchase } from '../features/purchase/purchaseActions';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const PaymentSuccessScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.container}>
      <AppText style={styles.icon}>🎉</AppText>

      <AppText variant="h2" style={styles.title}>Payment Successful</AppText>

      <AppText variant="body" color="textSecondary" style={styles.subtitle}>
        Coins added to your wallet successfully
      </AppText>

      <TouchableOpacity
        style={styles.btn}
        activeOpacity={0.8}
        onPress={() => {
          dispatch(resetPurchase());

          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'MaleHomeTabs',
                state: { routes: [{ name: 'Home' }] },
              },
            ],
          });
        }}
      >
        <AppText variant="subtitle" style={styles.btnText}>Go to Home</AppText>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default PaymentSuccessScreen;

const createStyles = (theme) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },

    icon: { fontSize: 60, color: colors.royalPurple },

    title: { marginTop: spacing.sm, color: colors.text },

    subtitle: { marginTop: spacing.sm, textAlign: 'center', paddingHorizontal: spacing.lg },

    btn: {
      marginTop: spacing.xl,
      backgroundColor: colors.royalPurple,
      padding: spacing.md,
      borderRadius: radius.sm,
      width: moderateScaleFallback(180),
      alignItems: 'center',
    },

    btnText: { color: colors.textInverse, fontWeight: 'bold' },
  });
};

// Fallback in case moderateScale isn't imported in a stripped-down copy —
// use react-native-size-matters directly instead in your actual file:
// import { moderateScale } from 'react-native-size-matters';
function moderateScaleFallback(v) {
  return v;
}