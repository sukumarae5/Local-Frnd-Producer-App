// PerfectMatchScreen.js
import React, { useEffect, useState, useMemo } from 'react';
import { View, StatusBar, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import Svg, { Defs, ClipPath, Path, Image as SvgImage, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { callDetailsRequest } from '../features/calls/callAction';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const GradientHeartAvatar = ({ source, size = 160 }) => <HeartImage source={source} size={size} />;

const GradientText = ({ text, style, gradientColors }) => {
  const fontSize = style?.fontSize || 24;

  return (
    <Svg height={fontSize + 10} width="100%">
      <Defs>
        <LinearGradient id="textGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor={gradientColors[0]} />
          <Stop offset="100%" stopColor={gradientColors[1]} />
        </LinearGradient>
      </Defs>

      <SvgText fill="url(#textGrad)" fontSize={fontSize} fontWeight="bold" x="50%" y={fontSize} textAnchor="middle">
        {text}
      </SvgText>
    </Svg>
  );
};

const HeartImage = ({ source, size = 150 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="gradBorder" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#D51BF9" />
        <Stop offset="100%" stopColor="#8C37F8" />
      </LinearGradient>
      <ClipPath id="clipHeart">
        <Path d="M50 78 C22 58 12 45 12 32 A18 18 0 0 1 50 32 A18 18 0 0 1 88 32 C88 45 78 58 50 78 Z" />
      </ClipPath>
    </Defs>

    <SvgImage width="100%" height="100%" href={source} clipPath="url(#clipHeart)" preserveAspectRatio="xMidYMid slice" />

    <Path
      d="M50 78 C22 58 12 45 12 32 A18 18 0 0 1 50 32 A18 18 0 0 1 88 32 C88 45 78 58 50 78 Z"
      fill="none"
      stroke="url(#gradBorder)"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
  </Svg>
);

const FloatingHeart = ({ size = 40, style }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <Defs>
      <LinearGradient id={`heartGrad${size}`} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#D51BF9" />
        <Stop offset="100%" stopColor="#8C37F8" />
      </LinearGradient>
    </Defs>
    <Path
      d="M50 82 C20 60 10 45 10 30 A20 20 0 0 1 50 30 A20 20 0 0 1 90 30 C90 45 80 60 50 82 Z"
      fill={`url(#heartGrad${size})`}
    />
  </Svg>
);

const PerfectMatchScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { call_type, session_id } = route.params || {};

  const [count, setCount] = useState(3);
  const [navigated, setNavigated] = useState(false);

  const connectedCallDetails = useSelector((state) => state.calls?.connectedCallDetails);
  const myId = useSelector((state) => state.auth?.user?.user_id);

  useEffect(() => {
    if (session_id) {
      dispatch(callDetailsRequest());
    }
  }, [session_id]);

  const caller = connectedCallDetails?.caller;
  const connectedUser = connectedCallDetails?.connected_user;

  const me = String(caller?.user_id) === String(myId) ? caller : connectedUser;
  const other = String(caller?.user_id) === String(myId) ? connectedUser : caller;

  useEffect(() => {
    if (!session_id || !call_type) return;

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (count === 0 && !navigated) {
      setNavigated(true);

      const screen = call_type === 'VIDEO' ? 'VideocallScreen' : 'AudiocallScreen';

      navigation.replace(screen, {
        session_id,
        caller_id: caller?.user_id,
      });
    }
  }, [count, navigated]);

  if (!caller || !connectedUser) {
    return (
      <WelcomeScreenbackgroungpage>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.gradientPurpleStart} />
        </View>
      </WelcomeScreenbackgroungpage>
    );
  }

  return (
    <WelcomeScreenbackgroungpage>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle={colors.statusBar} />

        <FloatingHeart size={moderateScale(50)} style={styles.topHeartCenter} />
        <FloatingHeart size={moderateScale(25)} style={styles.topHeartLeft} />
        <FloatingHeart size={moderateScale(30)} style={styles.topHeartRight} />

        <View style={styles.profileRow}>
          <View style={styles.profileBlock}>
            <GradientHeartAvatar source={{ uri: me?.display_profile_image }} size={moderateScale(160)} />
            <AppText variant="subtitle" style={styles.name}>{me?.name}</AppText>
          </View>

          <View style={styles.profileBlock}>
            <GradientHeartAvatar source={{ uri: other?.display_profile_image }} size={moderateScale(160)} />
            <AppText variant="subtitle" style={styles.name}>{other?.name}</AppText>
          </View>
        </View>

        <GradientText
          text="💜 Perfect Match"
          style={styles.matchText}
          gradientColors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
        />
        <GradientText
          text="Congratulations!"
          style={styles.congrats}
          gradientColors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
        />

        <FloatingHeart size={moderateScale(25)} style={styles.bottomHeartLeft} />
        <FloatingHeart size={moderateScale(20)} style={styles.bottomHeartRight} />
        <FloatingHeart size={moderateScale(30)} style={styles.bottomHeartCenter} />

        <AppText variant="subtitle" style={styles.countdown}>Connecting in {count}...</AppText>
      </SafeAreaView>
    </WelcomeScreenbackgroungpage>
  );
};

export default PerfectMatchScreen;

const createStyles = (theme) => {
  const { colors, spacing } = theme;

  return StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    profileRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: moderateScale(30),
      marginBottom: spacing.xxl,
    },

    profileBlock: { alignItems: 'center' },

    name: { marginTop: spacing.sm, color: colors.text },

    matchText: { marginTop: spacing.md },
    congrats: {},

    countdown: { marginTop: spacing.md, color: colors.text },

    topHeartCenter: { position: 'absolute', top: moderateScale(60), alignSelf: 'center' },
    topHeartLeft: { position: 'absolute', top: moderateScale(120), left: moderateScale(30), transform: [{ rotate: '-25deg' }] },
    topHeartRight: { position: 'absolute', top: moderateScale(120), right: moderateScale(30), transform: [{ rotate: '25deg' }] },
    bottomHeartLeft: { position: 'absolute', bottom: moderateScale(140), left: moderateScale(40) },
    bottomHeartRight: { position: 'absolute', bottom: moderateScale(140), right: moderateScale(40) },
    bottomHeartCenter: { position: 'absolute', bottom: moderateScale(60), alignSelf: 'center' },
  });
};