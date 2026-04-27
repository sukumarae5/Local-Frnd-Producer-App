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
import Svg, { Defs, ClipPath, Path, Image as SvgImage } from 'react-native-svg';

import { callDetailsRequest } from '../features/calls/callAction';

/* ---------------- HEART IMAGE ---------------- */

const HeartImage = ({ source, size = 150 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <ClipPath id="clipHeart">
        <Path d="M50 82 C20 60 10 45 10 30 A20 20 0 0 1 50 30 A20 20 0 0 1 90 30 C90 45 80 60 50 82 Z" />
      </ClipPath>
    </Defs>

    <SvgImage
      width="100%"
      height="100%"
      href={source}
      clipPath="url(#clipHeart)"
      preserveAspectRatio="xMidYMid slice"
    />
  </Svg>
);

/* ---------------- MAIN ---------------- */

const PerfectMatchScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { call_type, session_id } = route.params || {};

  const [count, setCount] = useState(3);

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
      setCount(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (count !== 0) return;

    console.log('➡️ Navigating to Call Screen');

    const screen =
      call_type === 'VIDEO' ? 'VideocallScreen' : 'AudiocallScreen';

    // navigation.replace(screen, {
    //   session_id,
    //   role: "receiver",
    // });

    const isCaller = String(caller?.user_id) === String(myId);

    navigation.replace(screen, {
      session_id,
      role: isCaller ? 'caller' : 'receiver',
    });
  }, [count]);

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

        {/* Profiles */}
        <View style={styles.profileRow}>
          <View style={styles.profileBlock}>
            <HeartImage source={{ uri: me?.avatar }} size={160} />
            <Text style={styles.name}>{me?.name}</Text>
          </View>

          <View style={styles.profileBlock}>
            <HeartImage source={{ uri: other?.avatar }} size={160} />
            <Text style={styles.name}>{other?.name}</Text>
          </View>
        </View>

        <Text style={styles.matchText}>💜 Perfect Match</Text>
        <Text style={styles.congrats}>Congratulations!</Text>

        {/* Countdown */}
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
    color: '#c464ff',
    fontWeight: '700',
  },

  congrats: {
    fontSize: 28,
    color: '#c464ff',
    fontWeight: 'bold',
  },

  countdown: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
  },
});
