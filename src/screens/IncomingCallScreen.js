import React, { useContext, useEffect, useRef, useMemo } from 'react';
import { View, TouchableOpacity, Image, BackHandler, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import { SocketContext } from '../socket/SocketProvider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CommonActions } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { clearCall } from '../features/calls/callAction';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const handledSessions = new Set();
const RING_TIMEOUT_MS = 31000;

// Theme-aware call-hero palette — light mode is your original pink/purple
// design; dark mode swaps to a matched deep-purple set instead of staying
// stuck light regardless of app theme.
const getCallPalette = (theme) => {
  if (theme.isDark) {
    return {
      gradient: ['#241530', '#2B1838', '#1A0F22'],
      heartOpacity: 0.15,
      titleColor: theme.colors.text,
      subtitleColor: theme.colors.textSecondary,
      avatarRing: '#A943FF',
      avatarBg: theme.colors.card,
    };
  }
  return {
    gradient: ['#E9C9FF', '#F4C9F2', '#FFD1E8'],
    heartOpacity: 0.25,
    titleColor: '#5A0066',
    subtitleColor: '#7a2a8a',
    avatarRing: '#A943FF',
    avatarBg: '#fff',
  };
};

const IncomingCallScreen = ({ route, navigation }) => {
  const { session_id, call_type } = route.params;
  const { socketRef } = useContext(SocketContext);
  const dispatch = useDispatch();
  const localTimerRef = useRef(null);
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const palette = useMemo(() => getCallPalette(theme), [theme]);
  const styles = useMemo(() => createStyles(theme, width), [theme, width]);

  useEffect(() => {
    return () => {
      handledSessions.delete(session_id);
      if (localTimerRef.current) {
        clearTimeout(localTimerRef.current);
      }
    };
  }, [session_id]);

  const navigateAway = (skipEmit = false) => {
    if (handledSessions.has(session_id)) return;
    handledSessions.add(session_id);

    if (localTimerRef.current) {
      clearTimeout(localTimerRef.current);
      localTimerRef.current = null;
    }

    if (!skipEmit) {
      socketRef.current?.emit('call_reject', { session_id });
    }

    dispatch(clearCall());

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'ReceiverBottomTabs' }],
        })
      );
    }
  };

  useEffect(() => {
    localTimerRef.current = setTimeout(() => {
      navigateAway(false);
    }, RING_TIMEOUT_MS);

    return () => {
      if (localTimerRef.current) {
        clearTimeout(localTimerRef.current);
      }
    };
  }, [session_id]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleRejected = (data) => {
      if (data?.session_id !== session_id) return;
      navigateAway(true);
    };

    const handleTimeout = (data) => {
      if (data?.session_id && data.session_id !== session_id) return;
      navigateAway(true);
    };

    const handleCallEnded = (data) => {
      if (data?.session_id && data.session_id !== session_id) return;
      navigateAway(true);
    };

    socket.on('call_rejected', handleRejected);
    socket.on('call_timeout', handleTimeout);
    socket.on('call_ended', handleCallEnded);

    return () => {
      socket.off('call_rejected', handleRejected);
      socket.off('call_timeout', handleTimeout);
      socket.off('call_ended', handleCallEnded);
    };
  }, [session_id]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      navigateAway(false);
      return true;
    });
    return () => sub.remove();
  }, [session_id]);

  const accept = () => {
    if (handledSessions.has(session_id)) return;
    handledSessions.add(session_id);

    if (localTimerRef.current) {
      clearTimeout(localTimerRef.current);
      localTimerRef.current = null;
    }

    socketRef.current?.emit('call_accept', { session_id });

    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: 'ReceiverBottomTabs' },
          {
            name: 'CallStatusScreen',
            params: { call_type, role: 'friend_receiver', session_id },
          },
        ],
      })
    );
  };

  const reject = () => {
    navigateAway(false);
  };

  return (
    <LinearGradient colors={palette.gradient} style={styles.container} pointerEvents="auto">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Image source={require('../assets/leftheart.png')} style={[styles.leftHeart, { opacity: palette.heartOpacity }]} />
        <Image source={require('../assets/rightheart.png')} style={[styles.rightHeart, { opacity: palette.heartOpacity }]} />

        <AppText variant="h3" style={[styles.title, { color: palette.titleColor }]}>
          Incoming {call_type} Call
        </AppText>

        <View style={[styles.avatarWrap, { borderColor: palette.avatarRing, backgroundColor: palette.avatarBg }]}>
          <Image source={require('../assets/girl2.jpg')} style={styles.avatar} />
        </View>

        <AppText variant="subtitle" style={[styles.subtitle, { color: palette.subtitleColor }]}>
          Someone is calling you…
        </AppText>

        <View style={styles.row}>
          <TouchableOpacity style={[styles.actionBtn, styles.reject]} onPress={reject} activeOpacity={0.8}>
            <Ionicons name="close" size={moderateScale(26)} color="#fff" />
            <AppText variant="caption" style={styles.btnText}>Reject</AppText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.accept]} onPress={accept} activeOpacity={0.8}>
            <Ionicons name={call_type === 'VIDEO' ? 'videocam' : 'call'} size={moderateScale(24)} color="#fff" />
            <AppText variant="caption" style={styles.btnText}>Accept</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default IncomingCallScreen;

const createStyles = (theme, width) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    leftHeart: {
      position: 'absolute',
      left: -moderateScale(30),
      top: moderateScale(80),
      width: moderateScale(120),
      height: moderateScale(120),
    },
    rightHeart: {
      position: 'absolute',
      right: -moderateScale(20),
      bottom: moderateScale(120),
      width: moderateScale(110),
      height: moderateScale(110),
    },

    title: { marginBottom: spacing.xxl },

    avatarWrap: {
      width: moderateScale(160),
      height: moderateScale(160),
      borderRadius: moderateScale(80),
      borderWidth: 6,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
    },
    avatar: { width: moderateScale(140), height: moderateScale(140), borderRadius: moderateScale(70) },

    subtitle: { marginTop: spacing.lg },

    row: { flexDirection: 'row', marginTop: spacing.xxxl, gap: spacing.xxl },

    actionBtn: {
      width: moderateScale(90),
      height: moderateScale(90),
      borderRadius: moderateScale(45),
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
    },

    accept: { backgroundColor: '#5BCF8E' },
    reject: { backgroundColor: '#FF6A6A' },

    btnText: { marginTop: spacing.xxs, color: '#fff' },
  });
};