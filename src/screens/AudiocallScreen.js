import React, { useEffect, useRef, useState, useContext, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Animated,
  Image,
  Alert,
  Easing,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { RTCIceCandidate, RTCView } from 'react-native-webrtc';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mediaDevices } from 'react-native-webrtc';
import { CommonActions } from '@react-navigation/native';
import InCallManager from 'react-native-incall-manager';
import MaskedView from '@react-native-masked-view/masked-view';
import { useDispatch, useSelector } from 'react-redux';
import { clearCall, callDetailsRequest } from '../features/calls/callAction';
import { otherUserFetchRequest } from '../features/Otherusers/otherUserActions';
import EndCallConfirmModal from '../screens/EndCallConfirmationScreen';
import { SocketContext } from '../socket/SocketProvider';
import { createPC } from '../utils/webrtc';
import callManager from '../utils/callManager';
import { NativeEventEmitter, ToastAndroid } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const showToast = (msg) => {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
};

// Theme-aware call-screen palette. Light mode keeps your original design;
// dark mode swaps to a matched deep-purple set.
const getAudioPalette = (theme) => {
  if (theme.isDark) {
    return {
      gradient: ['#241530', '#2B1838', '#1A0F22'],
      primary: '#B85CF9',
      timePillBg: '#8C2C4A',
      heartBase: '#1A0F22',
      gradientRing: ['#7C3AED', '#A855F7', '#D946A0'],
    };
  }
  return {
    gradient: ['#e2b9fd', '#f19ced', '#FFD1E8'],
    primary: '#A020F0',
    timePillBg: '#fb6b7c',
    heartBase: '#e2b9fd',
    gradientRing: ['#c084fc', '#e879f9', '#f472b6'],
  };
};

const AudiocallScreen = ({ route, navigation }) => {
  const { session_id, caller_id: routeCallerId } = route.params;
  const { socketRef, connected } = useContext(SocketContext);
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const palette = useMemo(() => getAudioPalette(theme), [theme]);
  const styles = useMemo(() => createStyles(theme, palette), [theme, palette]);
  const PRIMARY = palette.primary;

  const myGender = useSelector((state) => state.user?.userdata?.user?.gender || state.auth?.user?.gender);
  const myId = useSelector((state) => state.user.userdata?.user?.user_id);
  const coinBalance = useSelector((state) => state.user?.userdata?.user?.coin_balance ?? 0);
  const connectedCallDetails = useSelector((state) => state?.calls?.connectedCallDetails);

  const callType = route?.params?.call_type || 'AUDIO';
  const isMale = myGender === 'Male';
  const RATE = callType === 'VIDEO' ? 60 : 10;

  const [me, setMe] = useState(null);
  const [other, setOther] = useState(null);

  useEffect(() => {
    const callerData = connectedCallDetails?.caller;
    const connectedUser = connectedCallDetails?.connected_user;
    if (!callerData || !connectedUser || !myId) return;

    if (String(myId) === String(callerData.user_id)) {
      setMe(callerData);
      setOther(connectedUser);
    } else {
      setMe(connectedUser);
      setOther(callerData);
    }
  }, [connectedCallDetails, myId]);

  const incallEmitter = new NativeEventEmitter();
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingIceRef = useRef([]);
  const manualExitRef = useRef(false);
  const startedRef = useRef(false);
  const endedRef = useRef(false);
  const timerRef = useRef(null);
  const isExitingRef = useRef(false);
  const hasStartedRef = useRef(false);
  const disableExitRef = useRef(false);
  const remoteEndedRef = useRef(false);
  const forceExitRef = useRef(false);
  const connectedRef = useRef(false);
  const otherRef = useRef(null);
  const alertShownRef = useRef(false);

  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const [connectedUI, setConnectedUI] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [otherMicOn, setOtherMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioDevice, setAudioDevice] = useState('earpiece');
  const [iceState, setIceState] = useState('new');
  const [remoteStream, setRemoteStream] = useState(null);

  const [coinSecondsLeft, setCoinSecondsLeft] = useState(() => {
    if (!isMale) return null;
    return Math.floor((coinBalance / RATE) * 60);
  });
  const [warningMsg, setWarningMsg] = useState('');
  const coinCountdownRef = useRef(null);

  useEffect(() => {
    otherRef.current = other;
  }, [other]);

  useEffect(() => {
    const animate = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    };
    animate(ripple1, 0);
    animate(ripple2, 800);
  }, []);

  useEffect(() => {
    if (session_id) dispatch(callDetailsRequest());
  }, [session_id]);

  const requestPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    return res === PermissionsAndroid.RESULTS.GRANTED;
  };

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !connectedUI) return;

    socket.emit('audio_join_room', { session_id });

    const onMinutesUpdate = ({ remainingCoins, ratePerMinute }) => {
      if (!isMale) return;
      const newSecondsLeft = Math.floor((remainingCoins / ratePerMinute) * 60);
      setCoinSecondsLeft(newSecondsLeft);
    };

    const onLowBalanceWarning = ({ remainingCoins }) => {
      if (!isMale) return;
      const msg = ` Less than 1 minute left! (${remainingCoins} coins)`;
      setWarningMsg(msg);
      showToast(msg);
      setTimeout(() => setWarningMsg(''), 15000);
    };

    const onInsufficientBalance = () => {
      if (!isMale) return;
      setWarningMsg('Coins finished! Call ending...');
      showToast('Coins exhausted — call ended.');
      clearInterval(coinCountdownRef.current);
      forceExitRef.current = true;
      remoteEndedRef.current = true;
      manualExitRef.current = true;
      stopCallMedia();
      dispatch(clearCall());
      callManager.reset();
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              { name: isMale ? 'MaleHomeTabs' : 'ReceiverBottomTabs' },
              {
                name: 'CallStatusScreen',
                params: {
                  showRating: true,
                  fromCall: true,
                  otherUser: {
                    user_id: otherRef.current?.user_id,
                    name: otherRef.current?.name,
                    avatar: otherRef.current?.display_profile_image,
                  },
                  session_id,
                  role: isMale ? 'Male' : 'female',
                  call_type: callType,
                },
              },
            ],
          })
        );
      }, 1500);
    };

    socket.on('male_minutes_update', onMinutesUpdate);
    socket.on('low_balance_warning', onLowBalanceWarning);
    socket.on('call_insufficient_balance', onInsufficientBalance);

    return () => {
      socket.off('male_minutes_update', onMinutesUpdate);
      socket.off('low_balance_warning', onLowBalanceWarning);
      socket.off('call_insufficient_balance', onInsufficientBalance);
    };
  }, [connectedUI, session_id]);

  useEffect(() => {
    if (!connected || !socketRef.current || startedRef.current) return;
    startedRef.current = true;
    const socket = socketRef.current;

    const start = async () => {
      const ok = await requestPermission();
      if (!ok) {
        navigation.goBack();
        return;
      }

      InCallManager.start({ media: 'audio' });
      setAudioDevice('earpiece');
      setSpeakerOn(false);
      InCallManager.setForceSpeakerphoneOn(false);
      InCallManager.setSpeakerphoneOn(false);
      InCallManager.setMicrophoneMute(false);

      pcRef.current = createPC({
        onIceCandidate: (candidate) => socket.emit('audio_ice_candidate', { session_id, candidate }),
        onIceState: setIceState,
        onTrack: (stream) => {
          const audioTrack = stream.getAudioTracks()[0];
          if (audioTrack) audioTrack.enabled = true;
          setRemoteStream(stream);
        },
      });

      const stream = await mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
      });
      localStreamRef.current = stream;
      stream.getTracks().forEach((track) => {
        track.enabled = true;
        pcRef.current.addTrack(track, stream);
      });

      socket.emit('audio_join', { session_id });

      socket.on('audio_offer', onOffer);
      socket.on('audio_answer', onAnswer);
      socket.on('audio_ice_candidate', onIce);

      socket.on('call_ended', (data) => {
        if (String(data?.endedBy) === String(myId)) return;
        const currentOther = otherRef.current;
        showToast(`${currentOther?.name || 'User'} ended the call`);
        forceExitRef.current = true;
        remoteEndedRef.current = true;
        disableExitRef.current = true;
        manualExitRef.current = true;
        stopCallMedia();
        dispatch(clearCall());
        callManager.reset();
        setTimeout(() => {
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: isMale ? 'MaleHomeTabs' : 'ReceiverBottomTabs' },
                {
                  name: 'CallStatusScreen',
                  params: {
                    showRating: true,
                    fromCall: true,
                    otherUser: {
                      user_id: currentOther?.user_id,
                      name: currentOther?.name,
                      avatar: currentOther?.display_profile_image,
                    },
                    session_id,
                    role: isMale ? 'Male' : 'female',
                    call_type: callType,
                  },
                },
              ],
            })
          );
        }, 800);
      });

      socket.on('audio_connected', async () => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;
        if (!pcRef.current) return;
        const isCaller = String(myId) === String(routeCallerId);
        if (!isCaller) return;
        try {
          const offer = await pcRef.current.createOffer({ offerToReceiveAudio: true });
          await pcRef.current.setLocalDescription(offer);
          socket.emit('audio_offer', { session_id, offer });
        } catch (err) {
          console.log('❌ OFFER ERROR:', err);
        }
      });
    };

    start();

    return () => {
      socket.off('audio_offer', onOffer);
      socket.off('audio_answer', onAnswer);
      socket.off('audio_ice_candidate', onIce);
      socket.off('audio_call_ended');
      socket.off('audio_connected');
    };
  }, [connected]);

  useEffect(() => {
    const subscription = incallEmitter.addListener('onAudioDeviceChanged', (data) => {
      const device = data.audioDevice;
      if (device === 'WIRED_HEADSET' || device === 'BLUETOOTH') {
        setAudioDevice(device === 'BLUETOOTH' ? 'bluetooth' : 'headset');
        setSpeakerOn(false);
        setTimeout(() => {
          InCallManager.setForceSpeakerphoneOn(false);
          InCallManager.setSpeakerphoneOn(false);
        }, 100);
      } else if (device === 'SPEAKER') {
        setAudioDevice('speaker');
      } else {
        setAudioDevice('earpiece');
        setSpeakerOn(false);
        InCallManager.setForceSpeakerphoneOn(false);
        InCallManager.setSpeakerphoneOn(false);
      }
    });
    return () => subscription.remove();
  }, []);

  const flushIce = async () => {
    if (!pcRef.current || endedRef.current) return;
    for (const c of pendingIceRef.current) {
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
      } catch {}
    }
    pendingIceRef.current = [];
  };

  const onOffer = async ({ offer }) => {
    try {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(offer);
      await flushIce();
      pcRef.current.getReceivers().forEach((r) => {
        if (r.track) r.track.enabled = true;
      });
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socketRef.current.emit('audio_answer', { session_id, answer });
      onConnected();
    } catch (err) {
      console.log('❌ onOffer ERROR:', err);
    }
  };

  const onAnswer = async ({ answer }) => {
    try {
      await pcRef.current.setRemoteDescription(answer);
      pcRef.current.getReceivers().forEach((r) => {
        if (r.track) r.track.enabled = true;
      });
      await flushIce();
      onConnected();
    } catch (err) {
      console.log('❌ onAnswer ERROR:', err);
    }
  };

  const onIce = async ({ candidate }) => {
    if (!candidate || !pcRef.current || endedRef.current) return;
    if (!pcRef.current.remoteDescription?.type) {
      pendingIceRef.current.push(candidate);
      return;
    }
    await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const onConnected = () => {
    if (timerRef.current) return;
    connectedRef.current = true;
    setConnectedUI(true);

    const localTrack = localStreamRef.current?.getAudioTracks()[0];
    if (localTrack) localTrack.enabled = true;
    setTimeout(() => InCallManager.setMicrophoneMute(false), 500);
    setSpeakerOn(false);
    dispatch(callDetailsRequest());

    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

    if (isMale) {
      if (coinBalance < RATE) {
        setWarningMsg('No coins! Purchase coins to call.');
        showToast('Insufficient coins to make this call.');
        setTimeout(() => handleEndCall(), 2000);
        return;
      }

      const initialSeconds = Math.floor((coinBalance / RATE) * 60);
      setCoinSecondsLeft(initialSeconds);

      coinCountdownRef.current = setInterval(() => {
        setCoinSecondsLeft((prev) => {
          if (prev === null) return null;

          if (prev <= 0) {
            clearInterval(coinCountdownRef.current);
            coinCountdownRef.current = null;
            setCoinSecondsLeft(0);
            handleEndCall();
            return 0;
          }

          const next = prev - 1;

          if (next === 30 && !alertShownRef.current) {
            alertShownRef.current = true;
            setWarningMsg('Low Balance\nRecharge now. Your call will end in 30 seconds.');
          }

          return next;
        });
      }, 1000);
    }
  };

  const stopCallMedia = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    clearInterval(timerRef.current);
    clearInterval(coinCountdownRef.current);
    coinCountdownRef.current = null;
    InCallManager.stop();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
  };

  const handleEndCall = () => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    manualExitRef.current = true;
    const currentOther = otherRef.current;
    socketRef.current?.emit('call_end', { session_id, user_id: myId });
    stopCallMedia();
    callManager.reset();
    dispatch(clearCall());
    showToast('You ended the call');
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: isMale ? 'MaleHomeTabs' : 'ReceiverBottomTabs' },
          {
            name: 'CallStatusScreen',
            params: {
              showRating: true,
              fromCall: true,
              otherUser: {
                user_id: currentOther?.user_id,
                name: currentOther?.name,
                avatar: currentOther?.display_profile_image,
              },
              session_id,
              role: isMale ? 'Male' : 'female',
              call_type: callType,
            },
          },
        ],
      })
    );
  };

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    const newState = !track.enabled;
    track.enabled = newState;
    setMicOn(newState);
    const socket = socketRef.current;
    if (socket?.connected) socket.emit('mic_status', { session_id, user_id: myId, micOn: newState });
  };

  const toggleSpeaker = () => {
    if (audioDevice === 'headset' || audioDevice === 'bluetooth') return;
    const newVal = !speakerOn;
    setSpeakerOn(newVal);
    setAudioDevice(newVal ? 'speaker' : 'earpiece');
    InCallManager.setForceSpeakerphoneOn(false);
    setTimeout(() => InCallManager.setSpeakerphoneOn(newVal), 150);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (forceExitRef.current || remoteEndedRef.current || disableExitRef.current || manualExitRef.current) {
        navigation.dispatch(e.data.action);
        return;
      }
      if (!connectedRef.current) {
        navigation.dispatch(e.data.action);
        return;
      }
      e.preventDefault();
      Alert.alert('Exit from Call', 'Are you sure you want to exit the call?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: handleEndCall },
      ]);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    return () => {
      if (startedRef.current && !endedRef.current && !manualExitRef.current) {
        socketRef.current?.emit('audio_call_hangup', { session_id });
        stopCallMedia();
        callManager.reset();
        dispatch(clearCall());
      }
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handleMic = ({ user_id, micOn }) => {
      if (String(user_id) !== String(myId)) setOtherMicOn(micOn);
    };
    socket.on('mic_status_update', handleMic);
    return () => socket.off('mic_status_update', handleMic);
  }, []);

  const getRippleStyle = (anim) => ({
    position: 'absolute',
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    backgroundColor: 'rgba(226,133,251,0.25)',
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }],
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
  });

  const formatCoinTime = (secs) => {
    if (secs === null || secs === undefined) return null;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const coinDisplay = formatCoinTime(coinSecondsLeft);
  const coinIsLow = coinSecondsLeft !== null && coinSecondsLeft <= 60;

  return (
    <LinearGradient colors={palette.gradient} style={styles.container}>
      <View style={styles.topheats} pointerEvents="none">
        <MaskedView style={styles.heartMask} maskElement={<Ionicons name="heart" style={styles.heartIcon} />}>
          <LinearGradient colors={['rgba(255,255,255,0.5)', 'rgba(152,50,248,0.15)']} style={styles.heartGradient} />
        </MaskedView>
        <MaskedView style={styles.heartMaskTopRight} maskElement={<Ionicons name="heart" style={styles.heartIconTiny} />}>
          <LinearGradient colors={['rgba(255,255,255,0.5)', 'rgba(152,50,248,0.15)']} style={styles.heartGradient} />
        </MaskedView>
        <MaskedView style={styles.heartMaskSmall} maskElement={<Ionicons name="heart" style={styles.heartIconSmall} />}>
          <LinearGradient colors={['rgba(255,255,255,0.5)', 'rgba(152,50,248,0.15)']} style={styles.heartGradient} />
        </MaskedView>
        <MaskedView style={styles.heartMaskRight} maskElement={<Ionicons name="heart" style={styles.heartIcon} />}>
          <LinearGradient colors={['rgba(255,255,255,0.5)', 'rgba(152,50,248,0.15)']} style={styles.heartGradient} />
        </MaskedView>
      </View>

      <View style={styles.pillsRow}>
        <View style={styles.timePill}>
          <AppText variant="subtitle" style={styles.timeText}>
            {connectedUI ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : 'Connecting…'}
          </AppText>
        </View>

        {connectedUI && isMale && coinDisplay !== null && (
          <View style={[styles.coinPill, coinIsLow && styles.coinPillLow]}>
            <AppText variant="bodySmall" style={styles.coinPillText}>🪙 {coinDisplay}</AppText>
          </View>
        )}
      </View>

      {warningMsg !== '' && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning-outline" size={moderateScale(16)} color="#fff" />
          <AppText variant="caption" style={styles.warningText}>{warningMsg}</AppText>
        </View>
      )}

      {connectedCallDetails?.connected && me && other && (
        <View style={styles.usersRow}>
          <View style={styles.userCard}>
            <View style={styles.avatarWrapper}>
              <Animated.View style={getRippleStyle(ripple1)} />
              <Animated.View style={getRippleStyle(ripple2)} />
              <LinearGradient colors={palette.gradientRing} style={styles.gradientRing}>
                <Image source={{ uri: me.display_profile_image }} style={styles.avatar} />
              </LinearGradient>
              {!micOn && (
                <View style={styles.muteIcon}>
                  <Ionicons name="mic-off" size={moderateScale(16)} color="#fff" />
                </View>
              )}
            </View>
            <AppText variant="h4" style={styles.userName}>{me.name}</AppText>
            <AppText variant="caption" style={styles.desc}>{me.bio || 'No bio'}</AppText>
          </View>

          <TouchableOpacity
            style={styles.userCard}
            onPress={() => {
              if (!other?.user_id) return;
              dispatch(otherUserFetchRequest(other.user_id));
              navigation.navigate('AboutScreen');
            }}
          >
            <View style={styles.avatarWrapper}>
              <Animated.View style={getRippleStyle(ripple1)} />
              <Animated.View style={getRippleStyle(ripple2)} />
              <LinearGradient colors={palette.gradientRing} style={styles.gradientRing}>
                <Image source={{ uri: other.display_profile_image }} style={styles.avatar} />
              </LinearGradient>
              {!otherMicOn && (
                <View style={styles.muteIcon}>
                  <Ionicons name="mic-off" size={moderateScale(16)} color="#fff" />
                </View>
              )}
            </View>
            <AppText variant="h4" style={styles.userName}>{other.name}</AppText>
            <AppText variant="caption" style={styles.desc}>{other.bio || 'No bio'}</AppText>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.circleBtn, { backgroundColor: speakerOn ? PRIMARY : '#fff' }]}
          onPress={toggleSpeaker}
        >
          <Ionicons name={speakerOn ? 'volume-high' : 'volume-mute'} size={moderateScale(24)} color={speakerOn ? '#fff' : PRIMARY} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.circleBtn, { backgroundColor: micOn ? PRIMARY : '#fff' }]} onPress={toggleMic}>
          <Ionicons name={micOn ? 'mic' : 'mic-off'} size={moderateScale(24)} color={micOn ? '#fff' : PRIMARY} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.endBtn}
          onPress={() => {
            Alert.alert('End Call?', 'Are you sure you want to exit the call?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Exit', style: 'destructive', onPress: handleEndCall },
            ]);
          }}
        >
          <Ionicons name="call" size={moderateScale(22)} color="#8f0a0a" />
        </TouchableOpacity>
      </View>

      {remoteStream && (
        <RTCView key={remoteStream.toURL()} streamURL={remoteStream.toURL()} style={{ width: 1, height: 1 }} />
      )}
    </LinearGradient>
  );
};

export default AudiocallScreen;

const createStyles = (theme, palette) => {
  const { spacing, radius } = theme;

  return StyleSheet.create({
    container: { flex: 1, paddingTop: moderateScale(60), alignItems: 'center' },

    topheats: {
      position: 'absolute',
      top: moderateScale(30),
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xxl,
      zIndex: 10,
    },
    heartMask: { position: 'absolute', top: moderateScale(420), left: -moderateScale(50), width: moderateScale(220), height: moderateScale(220), opacity: 0.5 },
    heartMaskSmall: { position: 'absolute', top: moderateScale(120), left: moderateScale(20), width: moderateScale(100), height: moderateScale(100), opacity: 0.4 },
    heartMaskRight: { position: 'absolute', top: moderateScale(320), right: -moderateScale(10), width: moderateScale(130), height: moderateScale(230), opacity: 0.5 },
    heartMaskTopRight: { position: 'absolute', top: moderateScale(80), right: moderateScale(20), width: moderateScale(80), height: moderateScale(100), opacity: 0.35 },
    heartIcon: { fontSize: moderateScale(200), color: 'black' },
    heartIconSmall: { fontSize: moderateScale(70), color: 'black' },
    heartIconTiny: { fontSize: moderateScale(80), color: 'black' },
    heartGradient: { flex: 1 },

    pillsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    timePill: { backgroundColor: palette.timePillBg, paddingHorizontal: spacing.xl, paddingVertical: spacing.xs, borderRadius: radius.xl },
    timeText: { color: '#fff' },

    coinPill: {
      backgroundColor: 'rgba(130, 0, 230, 0.85)',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.xl,
      flexDirection: 'row',
      alignItems: 'center',
    },
    coinPillLow: { backgroundColor: 'rgba(220, 50, 50, 0.92)' },
    coinPillText: { color: '#fff', fontWeight: '700' },

    warningBanner: {
      position: 'absolute',
      bottom: moderateScale(140),
      left: spacing.md,
      right: spacing.md,
      backgroundColor: '#FF6B35',
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 9999,
      elevation: 20,
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },

    warningText: { flex: 1, color: '#fff', marginLeft: spacing.sm, lineHeight: moderateScale(18) },

    usersRow: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '92%',
      transform: [{ translateY: -moderateScale(200) }],
    },
    userCard: { width: '45%', alignItems: 'center' },
    avatarWrapper: { position: 'relative', justifyContent: 'center', alignItems: 'center' },
    gradientRing: { width: moderateScale(100), height: moderateScale(100), borderRadius: moderateScale(50), justifyContent: 'center', alignItems: 'center', padding: spacing.xxs },
    avatar: { width: moderateScale(90), height: moderateScale(90), borderRadius: moderateScale(45), backgroundColor: '#ddd' },
    userName: { textAlign: 'center' },
    desc: { textAlign: 'center', color: '#444' },
    muteIcon: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#FF4D4F',
      borderRadius: moderateScale(12),
      padding: spacing.xxs,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
    },

    controls: { position: 'absolute', bottom: moderateScale(50), flexDirection: 'row', gap: spacing.xl },
    circleBtn: { width: moderateScale(60), height: moderateScale(60), borderRadius: moderateScale(30), alignItems: 'center', justifyContent: 'center', elevation: 6 },
    endBtn: { backgroundColor: '#FF4D4F', width: moderateScale(65), height: moderateScale(65), borderRadius: moderateScale(32), alignItems: 'center', justifyContent: 'center', elevation: 8 },
  });
};