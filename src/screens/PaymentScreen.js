import React, { useEffect, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RazorpayCheckout from 'react-native-razorpay';
import { useDispatch, useSelector } from 'react-redux';
import { verifyPaymentRequest, resetPurchase } from '../features/purchase/purchaseActions';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

// Payment hero gradient — distinct brand moment for the checkout flow,
// appears once so far, kept local rather than promoted.
const paymentGradient = ['#7B2FF7', '#F107A3'];

const PaymentScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { order, package: pkg } = route.params;
  const { loading, paymentSuccess } = useSelector((state) => state.purchase);

  useEffect(() => {
    dispatch(resetPurchase());
  }, []);

  useEffect(() => {
    if (paymentSuccess) {
      navigation.replace('PaymentSuccessScreen');
    }
  }, [paymentSuccess]);

  const handlePayment = () => {
    dispatch(resetPurchase());

    const options = {
      key: 'rzp_test_GRRNoJBdPElkDv',
      amount: order.amount,
      currency: 'INR',
      name: 'Lokal Frnd',
      description: 'Coin Purchase',
      order_id: order.order_id,
      prefill: { contact: '9999999999', email: 'test@gmail.com' },
      theme: { color: colors.royalPurple },
    };

    RazorpayCheckout.open(options)
      .then((data) => {
        dispatch(
          verifyPaymentRequest({
            razorpay_order_id: data.razorpay_order_id,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_signature: data.razorpay_signature,
            package_id: pkg.id,
          })
        );
      })
      .catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar backgroundColor={paymentGradient[0]} barStyle="light-content" />

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={paymentGradient} style={styles.header}>
          <Icon name="wallet-plus" color="#fff" size={moderateScale(42)} />
          <AppText variant="h2" style={styles.headerTitle}>Coin Purchase</AppText>
          <AppText variant="body" style={styles.headerSub}>Fast & Secure Payment</AppText>
        </LinearGradient>

        <View style={styles.card}>
          <View style={styles.coinCircle}>
            <Icon name="cash-100" color="#FFD700" size={moderateScale(48)} />
          </View>

          <AppText variant="h2" style={styles.coinText}>{pkg.coins} Coins</AppText>
          <AppText variant="h1" style={styles.price}>₹ {order.amount / 100}</AppText>
          <AppText variant="bodySmall" color="textMuted" style={styles.save}>Instant Credit After Payment</AppText>
        </View>

        <View style={styles.details}>
          <AppText variant="h4" style={styles.sectionTitle}>Order Summary</AppText>

          <View style={styles.row}>
            <AppText variant="body">Coin Package</AppText>
            <AppText variant="body">{pkg.coins} Coins</AppText>
          </View>

          <View style={styles.row}>
            <AppText variant="body">Payment</AppText>
            <AppText variant="body">Razorpay</AppText>
          </View>

          <View style={styles.row}>
            <AppText variant="body">GST</AppText>
            <AppText variant="body">Included</AppText>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <AppText variant="subtitle" style={styles.total}>Total</AppText>
            <AppText variant="subtitle" style={styles.total}>₹ {order.amount / 100}</AppText>
          </View>
        </View>

        <View style={styles.secureBox}>
          <Icon name="shield-check" size={moderateScale(24)} color={colors.success} />
          <AppText variant="bodySmall" style={styles.secureText}>100% Secure Payment Powered by Razorpay</AppText>
        </View>
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={colors.royalPurple} />
      ) : (
        <View style={styles.bottomContainer}>
          <TouchableOpacity activeOpacity={0.9} onPress={handlePayment}>
            <LinearGradient colors={paymentGradient} style={styles.button}>
              <Icon name="lock" color="#fff" size={moderateScale(20)} />
              <AppText variant="subtitle" style={styles.buttonText}>PAY ₹ {order.amount / 100}</AppText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default PaymentScreen;

const createStyles = (theme) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    flex: { flex: 1 },

    header: {
      height: moderateScale(220),
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomLeftRadius: radius.xl,
      borderBottomRightRadius: radius.xl,
    },

    headerTitle: { color: '#fff', marginTop: spacing.sm },
    headerSub: { color: '#fff', marginTop: spacing.xs, opacity: 0.9 },

    card: {
      backgroundColor: colors.card,
      marginHorizontal: spacing.xl,
      marginTop: -moderateScale(45),
      borderRadius: radius.xl,
      padding: spacing.xl,
      alignItems: 'center',
      elevation: 10,
    },

    coinCircle: {
      width: moderateScale(90),
      height: moderateScale(90),
      borderRadius: moderateScale(45),
      backgroundColor: '#FFF8E1',
      justifyContent: 'center',
      alignItems: 'center',
    },

    coinText: { marginTop: spacing.md, color: colors.text },
    price: { color: colors.royalPurple, marginTop: spacing.sm },
    save: { marginTop: spacing.xs },

    details: {
      backgroundColor: colors.card,
      margin: spacing.lg,
      padding: spacing.lg,
      borderRadius: radius.lg,
      elevation: 3,
    },

    sectionTitle: { marginBottom: spacing.md },

    row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.sm },

    divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.divider, marginVertical: spacing.sm },

    total: { color: colors.text },

    secureBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: spacing.lg,
      padding: spacing.md,
      borderRadius: radius.lg,
      elevation: 2,
    },

    secureText: { marginLeft: spacing.sm, fontWeight: '600', color: colors.textSecondary, flex: 1 },

    button: {
      height: moderateScale(58),
      borderRadius: radius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },

    buttonText: { color: '#fff', marginLeft: spacing.sm },

    scrollContent: { flexGrow: 1, paddingBottom: moderateScale(120) },

    bottomContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.card,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: -5 },
      elevation: 20,
    },

    loader: { position: 'absolute', bottom: moderateScale(40), alignSelf: 'center' },
  });
};