import React, { useEffect, useRef, useContext, useState, useMemo } from 'react';
import { View, Image, Animated, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useSelector, useDispatch } from 'react-redux';
import {
  callDetailsRequest,
  callRequest,
  cancelWaitingRequest,
  femaleCancelRequest,
  clearCall,
  femaleSearchRequest,
} from '../features/calls/callAction';
import { SocketContext } from '../socket/SocketProvider';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import EndCallConfirmModal from '../screens/EndCallConfirmationScreen';
import { submitRatingRequest } from '../features/rating/ratingAction';
import { CommonActions } from '@react-navigation/native';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const smallAvatars = [
  require('../assets/girl1.jpg'),
  require('../assets/boy1.jpg'),
  require('../assets/girl2.jpg'),
  require('../assets/girl3.jpg'),
  require('../assets/boy2.jpg'),
];

// Same theme-aware palette approach as IncomingCallScreen.
const getCallPalette = (theme) => {
  if (theme.isDark) {
    return {
      gradient: ['#241530', '#2B1838', '#1A0F22'],
      heartBase: '#1A0F22',
      dottedCircle: '#7B4FA0',
      centerRing: '#A943FF',
      centerBg: theme.colors.card,
      tagBg: '#A943FF',
      searchingColor: theme.colors.text,
      ripple1: 'rgba(140, 55, 200, 0.5)',
      ripple2: 'rgba(140, 20, 200, 0.5)',
    };
  }
  return {
    gradient: ['#E9C9FF', '#F4C9F2', '#FFD1E8'],
    heartBase: '#E9C9FF',
    dottedCircle: '#C97CFF',
    centerRing: '#A943FF',
    centerBg: '#fff',
    tagBg: '#A943FF',
    searchingColor: '#5A0066',
    ripple1: 'rgba(225, 123, 253, 0.96)',
    ripple2: 'rgba(196, 18, 245, 0.96)',
  };
};

const GradientHeart = ({ size, style, heartBase }) => (
  <MaskedView
    style={[{ width: size, height: size }, style]}
    renderToHardwareTextureAndroid
    shouldRasterizeIOS
    maskElement={<Icon name="heart" size={size} color="black" />}
  >
    <View style={{ flex: 1, backgroundColor: heartBase }}>
      <LinearGradient
        colors={['rgba(255,255,255,0.5)', 'rgba(152,50,248,0.15)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1 }}
      />
    </View>
  </MaskedView>
);

const CENTER_SIZE = moderateScale(150);
const SMALL_SIZE = moderateScale(40);
const DOT_RADIUS = (CENTER_SIZE * 1.7) / 2;

const CallStatusScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { socketRef, connected } = useContext(SocketContext);
  const userdata = useSelector((state) => state.user.userdata);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const navigatedRef = useRef(false);
  const { theme } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const palette = useMemo(() => getCallPalette(theme), [theme]);
  const styles = useMemo(() => createStyles(theme, width, height), [theme, width, height]);

  const call = useSelector((state) => state.calls?.call);

  const call_type = route?.params?.call_type || 'AUDIO';
  const role = route?.params?.role || 'male';
  const { showRating, otherUser, session_id, fromCall } = route.params || {};

  const [showModal, setShowModal] = useState(false);

  const navigateAfterCall = () => {
    if (role === 'Male') {
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'MaleHomeTabs' }] }));
    } else {
      dispatch(femaleSearchRequest({ call_type }));

      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'ReceiverBottomTabs' },
            { name: 'CallStatusScreen', params: { call_type, role: 'female' } },
          ],
        })
      );
    }
  };

  useEffect(() => {
    if (showRating && otherUser?.user_id) {
      setShowModal(true);
    }
  }, [showRating, otherUser]);

  useEffect(() => {
    const anim = Animated.loop(Animated.timing(rotateAnim, { toValue: 1, duration: 10000, useNativeDriver: true }));
    anim.start();
    return () => anim.stop();
  }, [rotateAnim]);

  useEffect(() => {
    if (role !== 'female') return;
    if (fromCall) return;
    if (!connected || !socketRef.current) return;

    const socket = socketRef.current;

    const onIncomingCall = (data) => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;

      dispatch(callDetailsRequest());

      const screen = data.call_type === 'VIDEO' ? 'VideocallScreen' : 'AudiocallScreen';

      setTimeout(() => {
        navigation.replace(screen, {
          session_id: data.session_id,
          caller_id: data.caller_id,
          receiver_id: data.receiver_id,
        });
      }, 800);
    };

    socket.on('incoming_call', onIncomingCall);
    return () => socket.off('incoming_call', onIncomingCall);
  }, [role, connected, fromCall]);

  useEffect(() => {
    if (role !== 'friend_caller') return;
    if (!connected || !socketRef.current) return;

    const socket = socketRef.current;

    const onCallTimeout = () => {
      if (navigatedRef.current) return;
      dispatch(clearCall());
      navigation.goBack();
    };

    const onCallRejected = () => {
      if (navigatedRef.current) return;
      dispatch(clearCall());
      navigation.goBack();
    };

    socket.on('call_timeout', onCallTimeout);
    socket.on('call_rejected', onCallRejected);

    return () => {
      socket.off('call_timeout', onCallTimeout);
      socket.off('call_rejected', onCallRejected);
    };
  }, [role, connected]);

  useEffect(() => {
    if (role !== 'friend_receiver') return;
    if (!connected || !socketRef.current) return;

    const socket = socketRef.current;

    const onCallEnded = () => {
      dispatch(clearCall());
      navigation.goBack();
    };

    socket.on('audio_call_ended', onCallEnded);
    socket.on('video_call_ended', onCallEnded);

    return () => {
      socket.off('audio_call_ended', onCallEnded);
      socket.off('video_call_ended', onCallEnded);
    };
  }, [role, connected]);

  useEffect(() => {
    if (fromCall) return;
    if (!call?.status) return;
    if (!call?.session_id) return;

    const status = call.status.toUpperCase();

    if (call.is_friend) return;
    if (session_id && call.session_id === session_id) return;

    if (status === 'ACCEPTED') {
      if (navigatedRef.current) return;
      navigatedRef.current = true;

      dispatch(callDetailsRequest());

      const screen = call.call_type === 'VIDEO' ? 'VideocallScreen' : 'AudiocallScreen';

      setTimeout(() => {
        navigation.replace(screen, {
          session_id: call.session_id,
          caller_id: call.caller_id,
          receiver_id: call.receiver_id,
        });
      }, 800);
    }
  }, [call?.status, call?.session_id, fromCall]);

  useEffect(() => {
    let timeoutId = null;

    if (fromCall) return;
    if (session_id && call?.session_id === session_id) return;

    if (role === 'male' && call?.call_mode === 'RANDOM') {
      dispatch(callRequest({ call_type }));

      timeoutId = setTimeout(() => {
        dispatch(cancelWaitingRequest());
        navigation.goBack();
      }, 180000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [dispatch, call_type, role, navigation, call, fromCall]);

  useEffect(() => {
    if (fromCall) return;
    if (session_id && call?.session_id === session_id) return;

    if (call?.status === 'NO_MATCH' && role === 'male') {
      const retry = setTimeout(() => {
        dispatch(callRequest({ call_type }));
      }, 2000);
      return () => clearTimeout(retry);
    }
  }, [call?.status, call_type, dispatch, role, fromCall]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (fromCall) return;

      if (role === 'female') {
        dispatch(femaleCancelRequest());
      } else if (role === 'caller') {
        socketRef.current?.emit('call_cancel', { session_id: route?.params?.session_id });
        dispatch(clearCall());
      } else if (role === 'friend_receiver') {
        dispatch(clearCall());
      } else {
        dispatch(cancelWaitingRequest());
      }
    });
    return unsubscribe;
  }, [navigation, role, dispatch, fromCall]);

  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.parallel([
        Animated.timing(ripple1, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(1500),
          Animated.timing(ripple2, { toValue: 1, duration: 3000, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [ripple1, ripple2]);

  const rippleStyle1 = {
    position: 'absolute',
    width: moderateScale(170),
    height: moderateScale(170),
    borderRadius: moderateScale(85),
    backgroundColor: palette.ripple1,
    transform: [{ scale: ripple1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
    opacity: ripple1.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
  };

  const rippleStyle2 = {
    position: 'absolute',
    width: moderateScale(170),
    height: moderateScale(170),
    borderRadius: moderateScale(85),
    backgroundColor: palette.ripple2,
    transform: [{ scale: ripple2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
    opacity: ripple2.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
  };

  const displayStatus = call?.status === 'NO_MATCH' ? 'connecting...' : call?.status || 'Connecting...';

  return (
    <LinearGradient colors={palette.gradient} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <GradientHeart
          size={width * 0.3}
          heartBase={palette.heartBase}
          style={{ position: 'absolute', top: height * 0.2, left: -width * 0.1, opacity: 0.9 }}
        />
        <GradientHeart
          size={width * 0.6}
          heartBase={palette.heartBase}
          style={{ position: 'absolute', top: height * 0.1, right: -width * 0.2, opacity: 1 }}
        />

        <View style={{ height: moderateScale(60) }} />

        {!fromCall && (
          <>
            <View style={styles.centerArea}>
              <Animated.View style={rippleStyle1} />
              <Animated.View style={rippleStyle2} />
              <View style={[styles.dottedCircle, { borderColor: palette.dottedCircle }]} />
              <Animated.View style={styles.rotatingRing}>
                {smallAvatars.map((img, i) => {
                  const angle = i * (360 / smallAvatars.length) * (Math.PI / 180);
                  const r = DOT_RADIUS;
                  return (
                    <Image
                      key={i}
                      source={img}
                      style={[
                        styles.smallAvatar,
                        { transform: [{ translateX: r * Math.cos(angle) }, { translateY: r * Math.sin(angle) }] },
                      ]}
                    />
                  );
                })}
              </Animated.View>
              <View style={[styles.centerCircle, { borderColor: palette.centerRing, backgroundColor: palette.centerBg }]}>
                <Image
                  source={
                    userdata?.images?.display_profile_image
                      ? { uri: userdata.images.display_profile_image }
                      : require('../assets/girl2.jpg')
                  }
                  style={styles.centerImage}
                />
              </View>
            </View>

            <View style={[styles.tag, { backgroundColor: palette.tagBg }]}>
              <AppText variant="caption" style={styles.tagText}>
                {call_type === 'VIDEO' ? 'Video Call' : 'Audio Call'}
              </AppText>
            </View>

            <AppText variant="h3" style={[styles.searchingText, { color: palette.searchingColor }]}>
              {displayStatus}
            </AppText>
          </>
        )}

        <View style={{ flex: 1 }} />

        <GradientHeart
          size={width * 0.18}
          heartBase={palette.heartBase}
          style={{ position: 'absolute', bottom: height * 0.16, opacity: 0.9 }}
        />

        <EndCallConfirmModal
          visible={showModal}
          otherUser={otherUser}
          onCancel={() => {
            setShowModal(false);
            navigateAfterCall();
          }}
          onConfirm={(rating) => {
            setShowModal(false);
            dispatch(submitRatingRequest({ session_id, rating, to_user: otherUser?.user_id }));
            navigateAfterCall();
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default CallStatusScreen;

const createStyles = (theme, width, height) => {
  const { spacing } = theme;

  return StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1, alignItems: 'center' },

    centerArea: { alignItems: 'center', justifyContent: 'center', marginTop: height * 0.25 },

    dottedCircle: {
      position: 'absolute',
      width: CENTER_SIZE * 1.7,
      height: CENTER_SIZE * 1.7,
      borderRadius: (CENTER_SIZE * 2.4) / 2,
      borderWidth: 2,
      borderStyle: 'dotted',
      opacity: 0.6,
    },

    rotatingRing: {
      position: 'absolute',
      width: CENTER_SIZE,
      height: CENTER_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },

    smallAvatar: {
      width: SMALL_SIZE,
      height: SMALL_SIZE,
      borderRadius: SMALL_SIZE / 2,
      borderWidth: 2,
      borderColor: '#fff',
      position: 'absolute',
    },

    centerCircle: {
      width: CENTER_SIZE + moderateScale(18),
      height: CENTER_SIZE + moderateScale(18),
      borderRadius: (CENTER_SIZE + moderateScale(20)) / 2,
      borderWidth: 8,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 10,
    },

    centerImage: { width: CENTER_SIZE, height: CENTER_SIZE, borderRadius: CENTER_SIZE / 2 },

    tag: {
      borderRadius: 12,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.lg,
      marginTop: moderateScale(80),
    },

    tagText: { color: '#fff', fontWeight: '600' },

    searchingText: { marginTop: spacing.sm },
  });
};