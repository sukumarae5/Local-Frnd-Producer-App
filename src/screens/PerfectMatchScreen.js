// PerfectMatchScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, {
  Defs,
  ClipPath,
  Path,
  Image as SvgImage,
  LinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { callDetailsRequest } from '../features/calls/callAction';

/* ---------------- HEART IMAGE ---------------- */

const GradientHeartAvatar = ({ source, size = 160, border = 6 }) => {
  return <HeartImage source={source} size={size} />;
};
const GradientText = ({ text, style }) => {
  const fontSize = style?.fontSize || 24;

  return (
    <Svg height={fontSize + 10} width="100%">
      <Defs>
        <LinearGradient id="textGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#D51BF9" />
          <Stop offset="100%" stopColor="#8C37F8" />
        </LinearGradient>
      </Defs>

      <SvgText
        fill="url(#textGrad)"
        fontSize={fontSize}
        fontWeight="bold"
        x="50%"
        y={fontSize}
        textAnchor="middle" // 🔥 centers horizontally
      >
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

    <SvgImage
      width="100%"
      height="100%"
      href={source}
      clipPath="url(#clipHeart)"
      preserveAspectRatio="xMidYMid slice"
    />

    <Path
      d="M50 78 C22 58 12 45 12 32 A18 18 0 0 1 50 32 A18 18 0 0 1 88 32 C88 45 78 58 50 78 Z"
      fill="none"
      stroke="url(#gradBorder)"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
  </Svg>
);

const FloatingHeart = ({ size = 40, style }) => {
  return (
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
};
/* ---------------- MAIN ---------------- */

const PerfectMatchScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { call_type, session_id } = route.params || {};

  const [count, setCount] = useState(3);
  const [navigated, setNavigated] = useState(false);

  const connectedCallDetails = useSelector(
    state => state.calls?.connectedCallDetails,
  );

  const myId = useSelector(state => state.auth?.user?.user_id);

  /* ---------------- FETCH CALL DETAILS ---------------- */

  useEffect(() => {
    if (session_id) {
      dispatch(callDetailsRequest());
    }
  }, [session_id]);

  /* ---------------- USERS ---------------- */

  const caller = connectedCallDetails?.caller;
  const connectedUser = connectedCallDetails?.connected_user;

  const me = String(caller?.user_id) === String(myId) ? caller : connectedUser;

  const other =
    String(caller?.user_id) === String(myId) ? connectedUser : caller;

  /* ---------------- COUNTDOWN NAVIGATION ---------------- */
  useEffect(() => {
    if (!session_id || !call_type) return;

    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(interval); // ✅ stop at 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (count === 0) {
      console.log('➡️ Navigating to Call Screen');

      const screen =
        call_type === 'VIDEO' ? 'VideocallScreen' : 'AudiocallScreen';

      const isCaller = String(caller?.user_id) === String(myId);

      navigation.replace(screen, {
        session_id,
        role: isCaller ? 'caller' : 'receiver',
      });
    }
  }, [count]);
  useEffect(() => {
    if (count === 0 && !navigated) {
      setNavigated(true);

      const screen =
        call_type === 'VIDEO' ? 'VideocallScreen' : 'AudiocallScreen';

      const isCaller = String(caller?.user_id) === String(myId);

      navigation.replace(screen, {
        session_id,
        role: isCaller ? 'caller' : 'receiver',
      });
    }
  }, [count, navigated]);
  
  /* ---------------- LOADING ---------------- */

  if (!caller || !connectedUser) {
    return (
      <WelcomeScreenbackgroungpage>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ce7df7" />
        </View>
      </WelcomeScreenbackgroungpage>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <FloatingHeart size={50} style={styles.topHeartCenter} />
        <FloatingHeart size={25} style={styles.topHeartLeft} />
        <FloatingHeart size={30} style={styles.topHeartRight} />
        {/* Profiles */}
        <View style={styles.profileRow}>
          <View style={styles.profileBlock}>
            <GradientHeartAvatar source={{ uri: me?.avatar }} size={160} />
            <Text style={styles.name}>{me?.name}</Text>
          </View>

          <View style={styles.profileBlock}>
            <GradientHeartAvatar source={{ uri: other?.avatar }} size={160} />
            <Text style={styles.name}>{other?.name}</Text>
          </View>
        </View>

        <GradientText text="💜 Perfect Match" style={styles.matchText} />
        <GradientText text="Congratulations!" style={styles.congrats} />
        {/* Countdown */}

        <FloatingHeart size={25} style={styles.bottomHeartLeft} />
        <FloatingHeart size={20} style={styles.bottomHeartRight} />
        <FloatingHeart size={30} style={styles.bottomHeartCenter} />

        <Text style={styles.countdown}>Connecting in {count}...</Text>
      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default PerfectMatchScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    marginBottom: 40,
  },

  profileBlock: {
    alignItems: 'center',
  },

  name: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },

  matchText: {
    marginTop: 20,
    fontSize: 20,

    fontWeight: '700',
  },

  congrats: {
    fontSize: 28,

    fontWeight: 'bold',
  },

  countdown: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  topHeartCenter: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
  },

  topHeartLeft: {
    position: 'absolute',
    top: 120,
    left: 30,
    transform: [{ rotate: '-25deg' }],
  },

  topHeartRight: {
    position: 'absolute',
    top: 120,
    right: 30,
     transform: [{ rotate: '25deg' }],
  },

  bottomHeartLeft: {
    position: 'absolute',
    bottom: 140,
    left: 40,
  },

  bottomHeartRight: {
    position: 'absolute',
    bottom: 140,
    right: 40,
  },

  bottomHeartCenter: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
  },
});
