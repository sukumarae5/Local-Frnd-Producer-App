import React, { useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, StatusBar, Image, StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { userDatarequest } from '../features/user/userAction';
import ReceiverHeader from '../components/ReceiverHeader';
import ringImg from '../assets/ring.png';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import GoOnlineCard from '../components/GoOnlineCard';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

// Wallet-specific brand palette — distinct from the app-wide theme tokens,
// used consistently within this screen only. Promote to colors.js if reused elsewhere.
const walletColors = {
  gradientStart: '#FF4FB8',
  gradientMid: '#B026FF',
  gradientEnd: '#6D28D9',
  convertStart: '#FF4FB8',
  convertEnd: '#8B5CF6',
  deepPurpleText: '#3B0764',
  mutedPurpleText: '#7E6B8F',
  accentPurple: '#7C3AED',
  circleTintPink: 'rgba(255, 79, 184, 0.12)',
  circleTintPurple: 'rgba(139, 92, 246, 0.13)',
  liveText: '#FF4FB8',
  yellowConversion: '#FFF7AD',
  pinkOnGradient: '#FCE7F3',
  iconCirclePink: '#FCE7F3',
  iconCircleLavender: '#EDE9FE',
  historyBg: '#F3E8FF',
  infoBg: '#F5F3FF',
  infoText: '#6D5A7B',
};

const ReciverWalletScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { userdata } = useSelector((state) => state.user);

  const rings = userdata?.user?.rings_balance ?? 0;
  const avatar = userdata?.images?.avatar || userdata?.images?.profile_image;
  const money = rings * 1.2;
  const MIN_WITHDRAW = 10;
  const canWithdraw = rings >= MIN_WITHDRAW;

  useEffect(() => {
    dispatch(userDatarequest());
  }, [dispatch]);

  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.main}>
        <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
          <ReceiverHeader
            navigation={navigation}
            coins={rings}
            avatar={avatar}
            unread={0}
            userdata={userdata}
          />

          <View style={styles.bgCircleOne} />
          <View style={styles.bgCircleTwo} />

          <View style={styles.heroSection}>
            <AppText variant="h1" style={styles.title}>Lokal Frnd Wallet</AppText>
            <AppText variant="bodySmall" style={styles.subTitle}>
              Convert your rewarded rings into real money
            </AppText>
          </View>

          <LinearGradient
            colors={[walletColors.gradientStart, walletColors.gradientMid, walletColors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={styles.balanceTopRow}>
              <View>
                <AppText variant="bodySmall" style={styles.balanceLabel}>Available Rings</AppText>

                <View style={styles.ringBalanceRow}>
                  <Image source={ringImg} style={styles.bigRingIcon} />
                  <AppText variant="h1" style={styles.balanceAmount}>{rings}</AppText>
                </View>
              </View>

              <View style={styles.liveBadge}>
                <Icon name="sparkles-outline" size={moderateScale(14)} color={walletColors.liveText} />
                <AppText variant="caption" style={styles.liveBadgeText}>Live</AppText>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.conversionRow}>
              <View>
                <AppText variant="bodySmall" style={styles.conversionLabel}>Conversion Rate</AppText>
                <AppText variant="h4" style={styles.conversionText}>1 Ring = ₹1.20</AppText>
              </View>

              <View style={styles.moneyBox}>
                <AppText variant="caption" style={styles.moneyLabel}>You Earn</AppText>
                <AppText variant="h3" style={styles.moneyValue}>₹{money.toFixed(0)}</AppText>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.sectionHeaderRow}>
            <AppText variant="h4" style={styles.sectionTitle}>Rewards Summary</AppText>

            <TouchableOpacity activeOpacity={0.8} style={styles.historyButton}>
              <Icon name="time-outline" size={moderateScale(15)} color={walletColors.accentPurple} />
              <AppText variant="caption" style={styles.historyText}>History</AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIconCircle, { backgroundColor: walletColors.iconCirclePink }]}>
                <Image source={ringImg} style={styles.smallRingIcon} />
              </View>

              <View style={styles.summaryTextBox}>
                <AppText variant="bodySmall" style={styles.summaryLabel}>Total Rings Rewarded</AppText>
                <AppText variant="h3" style={styles.summaryValue}>{rings} Rings</AppText>
              </View>
            </View>

            <View style={styles.centerConvertIcon}>
              <LinearGradient
                colors={[walletColors.convertStart, walletColors.convertEnd]}
                style={styles.convertGradient}
              >
                <Icon name="swap-vertical-outline" size={moderateScale(24)} color={colors.textInverse} />
              </LinearGradient>
            </View>

            <View style={styles.summaryItem}>
              <View style={[styles.summaryIconCircle, { backgroundColor: walletColors.iconCircleLavender }]}>
                <Icon name="cash-outline" size={moderateScale(25)} color={walletColors.accentPurple} />
              </View>

              <View style={styles.summaryTextBox}>
                <AppText variant="bodySmall" style={styles.summaryLabel}>Total Money Converted</AppText>
                <AppText variant="h3" style={styles.summaryValue}>₹{money.toFixed(0)}</AppText>
              </View>
            </View>
          </View>

          <TouchableOpacity
            disabled={!canWithdraw}
            onPress={() => navigation.navigate('WithdrawFormScreen', { rings })}
            style={[styles.withdrawButton, { opacity: canWithdraw ? 1 : 0.5 }]}
          >
            <LinearGradient
              colors={[walletColors.convertStart, walletColors.convertEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.withdrawGradient}
            >
              <Icon name="card-outline" size={moderateScale(20)} color={colors.textInverse} />
              <AppText variant="subtitle" style={styles.withdrawText}>Convert Rings to Money</AppText>
            </LinearGradient>
          </TouchableOpacity>

          {!canWithdraw && (
            <AppText variant="bodySmall" style={styles.minWithdrawText}>
              Minimum 10 rupees rings required
            </AppText>
          )}

          <View style={styles.infoCard}>
            <Icon name="information-circle-outline" size={moderateScale(21)} color={walletColors.accentPurple} />
            <AppText variant="caption" style={styles.infoText}>
              Your rings are calculated automatically based on your wallet balance.
            </AppText>
          </View>

          <View style={styles.goOnlineWrap}>
            <GoOnlineCard navigation={navigation} />
          </View>
        </ScrollView>
      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default ReciverWalletScreen;

const createStyles = (theme) => {
  const { spacing, radius } = theme;

  return StyleSheet.create({
    main: { flex: 1 },

    container: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: moderateScale(80),
    },

    bgCircleOne: {
      position: 'absolute',
      width: moderateScale(220),
      height: moderateScale(220),
      borderRadius: moderateScale(110),
      backgroundColor: walletColors.circleTintPink,
      top: moderateScale(80),
      right: -moderateScale(90),
    },

    bgCircleTwo: {
      position: 'absolute',
      width: moderateScale(180),
      height: moderateScale(180),
      borderRadius: moderateScale(90),
      backgroundColor: walletColors.circleTintPurple,
      top: moderateScale(260),
      left: -moderateScale(80),
    },

    heroSection: {
      alignItems: 'center',
      marginTop: spacing.xxl,
      marginBottom: spacing.xl,
    },

    title: {
      marginTop: spacing.xs,
      color: walletColors.deepPurpleText,
      textAlign: 'center',
    },

    subTitle: {
      marginTop: spacing.sm,
      color: walletColors.mutedPurpleText,
      textAlign: 'center',
      fontWeight: '500',
      paddingHorizontal: spacing.lg,
      lineHeight: moderateScale(20),
    },

    balanceCard: {
      borderRadius: radius.xl,
      padding: spacing.xl,
      marginBottom: spacing.xxl,
      shadowColor: walletColors.convertEnd,
      shadowOpacity: 0.35,
      shadowRadius: 18,
      elevation: 10,
    },

    balanceTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },

    balanceLabel: { color: walletColors.pinkOnGradient, fontWeight: '600' },

    ringBalanceRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },

    bigRingIcon: { width: moderateScale(34), height: moderateScale(34), marginRight: spacing.sm },

    balanceAmount: { color: '#fff' },

    liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.xl,
    },

    liveBadgeText: { marginLeft: spacing.xxs, fontWeight: '800', color: walletColors.liveText },

    divider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.25)',
      marginVertical: spacing.lg,
    },

    conversionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    conversionLabel: { color: walletColors.pinkOnGradient, fontWeight: '600' },

    conversionText: { marginTop: spacing.xxs, color: walletColors.yellowConversion },

    moneyBox: {
      backgroundColor: 'rgba(255,255,255,0.18)',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.xl,
      alignItems: 'center',
    },

    moneyLabel: { color: walletColors.pinkOnGradient, fontWeight: '600' },

    moneyValue: { marginTop: spacing.xxs, color: '#fff' },

    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },

    sectionTitle: { color: walletColors.deepPurpleText },

    historyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: walletColors.historyBg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.xl,
    },

    historyText: { marginLeft: spacing.xxs, fontWeight: '800', color: walletColors.accentPurple },

    summaryCard: {
      backgroundColor: 'rgba(255,255,255,0.92)',
      borderRadius: radius.xl,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: 'rgba(139, 92, 246, 0.15)',
      shadowColor: walletColors.accentPurple,
      shadowOpacity: 0.12,
      shadowRadius: 14,
      elevation: 5,
    },

    summaryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FAF5FF',
      borderRadius: radius.xl,
      padding: spacing.md,
    },

    summaryIconCircle: {
      width: moderateScale(52),
      height: moderateScale(52),
      borderRadius: moderateScale(26),
      justifyContent: 'center',
      alignItems: 'center',
    },

    smallRingIcon: { width: moderateScale(27), height: moderateScale(27) },

    summaryTextBox: { marginLeft: spacing.md, flex: 1 },

    summaryLabel: { color: walletColors.mutedPurpleText, fontWeight: '600' },

    summaryValue: { marginTop: spacing.xxs, color: walletColors.deepPurpleText },

    centerConvertIcon: { alignItems: 'center', marginVertical: spacing.md },

    convertGradient: {
      width: moderateScale(46),
      height: moderateScale(46),
      borderRadius: moderateScale(23),
      justifyContent: 'center',
      alignItems: 'center',
    },

    withdrawButton: {
      marginTop: spacing.xl,
      borderRadius: radius.xl,
      overflow: 'hidden',
    },

    withdrawGradient: {
      height: moderateScale(54),
      borderRadius: radius.xl,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },

    withdrawText: { marginLeft: spacing.sm, color: '#fff' },

    minWithdrawText: { textAlign: 'center', marginTop: spacing.sm },

    infoCard: {
      marginTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: walletColors.infoBg,
      borderRadius: radius.xl,
      padding: spacing.md,
    },

    infoText: {
      marginLeft: spacing.sm,
      flex: 1,
      color: walletColors.infoText,
      fontWeight: '600',
      lineHeight: moderateScale(18),
    },

    goOnlineWrap: {
      paddingBottom: spacing.xxl,
      marginTop: spacing.md,
    },
  });
};