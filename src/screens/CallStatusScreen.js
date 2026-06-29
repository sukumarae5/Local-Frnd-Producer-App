import React, { useEffect, useRef, useContext, useState } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
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
import { Dimensions } from 'react-native';
import EndCallConfirmModal from '../screens/EndCallConfirmationScreen';
import { submitRatingRequest } from '../features/rating/ratingAction';
import { CommonActions } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const wp = p => (width * p) / 100;
const hp = p => (height * p) / 100;

const smallAvatars = [
  require('../assets/girl1.jpg'),
  require('../assets/boy1.jpg'),
  require('../assets/girl2.jpg'),
  require('../assets/girl3.jpg'),
  require('../assets/boy2.jpg'),
];

const GradientHeart = ({ size, style }) => {
  return (
    <MaskedView
      style={[{ width: size, height: size }, style]}
      renderToHardwareTextureAndroid
      shouldRasterizeIOS
      maskElement={<Icon name="heart" size={size} color="black" />}
    >
      <View style={{ flex: 1, backgroundColor: '#E9C9FF' }}>
        <LinearGradient
          colors={['rgba(255,255,255,0.5)', 'rgba(152,50,248,0.15)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>
    </MaskedView>
  );
};

const CENTER_SIZE = 150;
const SMALL_SIZE = 40;
const DOT_RADIUS = (CENTER_SIZE * 1.7) / 2;

const CallStatusScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { socketRef, connected } = useContext(SocketContext);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const navigatedRef = useRef(false);

  const call = useSelector(state => state.calls?.call);

  const call_type = route?.params?.call_type || 'AUDIO';
  const role = route?.params?.role || 'male';
  const { showRating, otherUser, session_id, fromCall } = route.params || {};

  const [showModal, setShowModal] = useState(false);

  /* ================= AFTER RATING NAVIGATE ================= */
  const navigateAfterCall = () => {
    if (role === 'Male') {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MaleHomeTabs' }],
        }),
      );
    } else {
      dispatch(femaleSearchRequest({ call_type }));

      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'ReceiverBottomTabs' },
            {
              name: 'CallStatusScreen',
              params: {
                call_type,
                role: 'female',
              },
            },
          ],
        }),
      );
    }
  };

  /* ================= SHOW RATING MODAL ================= */
  useEffect(() => {
    if (showRating && otherUser?.user_id) {
      setShowModal(true);
    }
  }, [showRating, otherUser]);

  /* ================= DEBUG ================= */
  useEffect(() => {
    console.log('CALL OBJECT =>', call);
  }, [call]);

  /* ================= ROTATE ANIMATION ================= */
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [rotateAnim]);

  /* ================= FEMALE INCOMING CALL ================= */
  useEffect(() => {
    if (role !== 'female') return;
    if (fromCall) return;
    if (!connected || !socketRef.current) return;

    const socket = socketRef.current;

    const onIncomingCall = data => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;

      dispatch(callDetailsRequest());

      const screen =
        data.call_type === 'VIDEO' ? 'VideocallScreen' : 'AudiocallScreen';

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

  /* ================= FRIEND CALLER TIMEOUT ================= */
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

  /* ================= FRIEND RECEIVER CALL ENDED ================= */
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

  /* ================= RANDOM CALL ACCEPTED ================= */
  useEffect(() => {
    // ✅ rating screen — skip entirely
    if (fromCall) return;
    if (!call?.status) return;
    if (!call?.session_id) return;

    const status = call.status.toUpperCase();

    if (call.is_friend) return;

    // ✅ KEY FIX — stale session from the call we just ended — skip
    if (session_id && call.session_id === session_id) return;

    if (status === 'ACCEPTED') {
      if (navigatedRef.current) return;
      navigatedRef.current = true;

      dispatch(callDetailsRequest());

      const screen =
        call.call_type === 'VIDEO' ? 'VideocallScreen' : 'AudiocallScreen';

      setTimeout(() => {
        navigation.replace(screen, {
          session_id: call.session_id,
          caller_id: call.caller_id,
          receiver_id: call.receiver_id,
        });
      }, 800);
    }
  }, [call?.status, call?.session_id, fromCall]);

  /* ================= 3 MIN TIMEOUT ================= */
  useEffect(() => {
    let timeoutId = null;

    // ✅ rating screen — skip
    if (fromCall) return;

    // ✅ stale session guard — don't start searching with ended call's data
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

  /* ================= RETRY ON NO MATCH ================= */
  useEffect(() => {
    // ✅ rating screen — skip
    if (fromCall) return;

    // ✅ stale session guard
    if (session_id && call?.session_id === session_id) return;

    if (call?.status === 'NO_MATCH' && role === 'male') {
      const retry = setTimeout(() => {
        dispatch(callRequest({ call_type }));
      }, 2000);
      return () => clearTimeout(retry);
    }
  }, [call?.status, call_type, dispatch, role, fromCall]);

// Replace only this useEffect in CallStatusScreen
useEffect(() => {
  const unsubscribe = navigation.addListener('beforeRemove', () => {
    if (fromCall) return;

    if (role === 'female') {
      dispatch(femaleCancelRequest());
    } else if (role === 'caller') {
      // ✅ caller cancelled while ringing — server handles session cleanup
      socketRef.current?.emit('call_cancel', {
        session_id: route?.params?.session_id,
      });
      dispatch(clearCall());
    } else if (role === 'friend_receiver') {
      // ✅ do NOT emit call_reject here — IncomingCallScreen already did
      dispatch(clearCall());
    } else {
      dispatch(cancelWaitingRequest());
    }
  });
  return unsubscribe;
}, [navigation, role, dispatch, fromCall]);

  /* ================= RIPPLE ANIMATIONS ================= */
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.parallel([
        Animated.timing(ripple1, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(1500),
          Animated.timing(ripple2, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [ripple1, ripple2]);

  const rippleStyle1 = {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(225, 123, 253, 0.96)',
    transform: [
      {
        scale: ripple1.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.8],
        }),
      },
    ],
    opacity: ripple1.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    }),
  };

  const rippleStyle2 = {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(196, 18, 245, 0.96)',
    transform: [
      {
        scale: ripple2.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.8],
        }),
      },
    ],
    opacity: ripple2.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    }),
  };

  // ✅ Hide status text completely when fromCall is true
  const displayStatus =
    call?.status === 'NO_MATCH'
      ? 'connecting...'
      : call?.status || 'Connecting...';

  /* ================= RENDER ================= */
  return (
    <LinearGradient
      colors={['#E9C9FF', '#F4C9F2', '#FFD1E8']}
      style={styles.container}
    >
      <GradientHeart
        size={wp(30)}
        style={{
          position: 'absolute',
          top: hp(20),
          left: -wp(10),
          opacity: 0.9,
        }}
      />
      <GradientHeart
        size={wp(60)}
        style={{
          position: 'absolute',
          top: hp(10),
          right: -wp(20),
          opacity: 1,
        }}
      />

      <View style={{ height: 60 }} />

      {/* ✅ Hide entire searching UI when fromCall is true */}
      {!fromCall && (
        <>
          <View style={styles.centerArea}>
            <Animated.View style={rippleStyle1} />
            <Animated.View style={rippleStyle2} />
            <View style={styles.dottedCircle} />
            <Animated.View style={styles.rotatingRing}>
              {smallAvatars.map((img, i) => {
                const angle =
                  i * (360 / smallAvatars.length) * (Math.PI / 180);
                const r = DOT_RADIUS;
                return (
                  <Image
                    key={i}
                    source={img}
                    style={[
                      styles.smallAvatar,
                      {
                        transform: [
                          { translateX: r * Math.cos(angle) },
                          { translateY: r * Math.sin(angle) },
                        ],
                      },
                    ]}
                  />
                );
              })}
            </Animated.View>
            <View style={styles.centerCircle}>
              <Image
                source={require('../assets/girl2.jpg')}
                style={styles.centerImage}
              />
            </View>
          </View>

          <View style={styles.tag}>
            <Text style={styles.tagText}>
              {call_type === 'VIDEO' ? 'Video Call' : 'Audio Call'}
            </Text>
          </View>

          <Text style={styles.searchingText}>{displayStatus}</Text>
        </>
      )}

      <View style={{ flex: 1 }} />

      <GradientHeart
        size={wp(18)}
        style={{
          position: 'absolute',
          bottom: hp(16),
          opacity: 0.9,
        }}
      />

      <EndCallConfirmModal
        visible={showModal}
        otherUser={otherUser}
        onCancel={() => {
          setShowModal(false);
          navigateAfterCall();
        }}
        onConfirm={rating => {
          setShowModal(false);
          dispatch(
            submitRatingRequest({
              session_id,
              rating,
              to_user: otherUser?.user_id,
            }),
          );
          navigateAfterCall();
        }}
      />
    </LinearGradient>
  );
};

export default CallStatusScreen;

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  centerArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(25),
  },
  dottedCircle: {
    position: 'absolute',
    width: CENTER_SIZE * 1.7,
    height: CENTER_SIZE * 1.7,
    borderRadius: (CENTER_SIZE * 2.4) / 2,
    borderWidth: 2,
    borderColor: '#C97CFF',
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
    width: CENTER_SIZE + 18,
    height: CENTER_SIZE + 18,
    borderRadius: (CENTER_SIZE + 20) / 2,
    borderWidth: 8,
    borderColor: '#A943FF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 10,
  },
  centerImage: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
  },
  tag: {
    backgroundColor: '#A943FF',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginTop: 80,
  },
  tagText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  searchingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5A0066',
    marginTop: 12,
  },
});