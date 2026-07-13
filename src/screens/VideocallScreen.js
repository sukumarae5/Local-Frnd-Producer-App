import React, { useEffect, useRef, useState, useContext, useCallback, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Image,
  Animated,
  Alert,
  ToastAndroid,
  StyleSheet,
} from 'react-native';
import { NativeEventEmitter } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RTCView, mediaDevices, RTCIceCandidate } from 'react-native-webrtc';
import { CommonActions } from '@react-navigation/native';
import InCallManager from 'react-native-incall-manager';
import { useDispatch, useSelector } from 'react-redux';
import Svg, { Path, Circle } from 'react-native-svg';
import { moderateScale } from 'react-native-size-matters';
import FaceDetectionOverlay from '../components/FaceDetectionOverlay';
import { useFaceDetection } from '../hooks/useFaceDetection';
import { clearCall, callDetailsRequest } from '../features/calls/callAction';
import { SocketContext } from '../socket/SocketProvider';
import { createPC } from '../utils/webrtc';
import callManager from '../utils/callManager';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const showToast = (msg) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  }
};

// Accent color follows the theme (matches AudiocallScreen), but the video
// surface/controls stay black regardless of theme — standard for any
// video-call UI, required for camera contrast.
const getVideoPrimary = (theme) => (theme.isDark ? '#B85CF9' : '#A020F0');

const VideocallScreen = ({ route, navigation }) => {
  const { session_id, caller_id: routeCallerId } = route.params;
  const { socketRef, connected } = useContext(SocketContext);
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const PRIMARY = useMemo(() => getVideoPrimary(theme), [theme]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { userdata } = useSelector((s) => s.user);
  const myGender = useSelector((s) => s.user?.userdata?.user?.gender);
  const connectedCallDetails = useSelector((s) => s?.calls?.connectedCallDetails);
  const myId = useSelector((s) => s.user.userdata?.user?.user_id);
  const coinBalance = useSelector((s) => s.user?.userdata?.user?.coin_balance ?? 0);

  const callType = route?.params?.call_type || 'VIDEO';
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

  const [localURL, setLocalURL] = useState(null);
  const [remoteURL, setRemoteURL] = useState(null);
  const [connectedUI, setConnectedUI] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [otherMicOn, setOtherMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [activeBtn, setActiveBtn] = useState(null);
  const [otherFaceGone, setOtherFaceGone] = useState(false);
  const [otherCameraOff, setOtherCameraOff] = useState(false);
  const [coinSecondsLeft, setCoinSecondsLeft] = useState(null);
  const [warningMsg, setWarningMsg] = useState('');
  const [micBadgePos, setMicBadgePos] = useState(null);
const [audioDevice, setAudioDevice] = useState('speaker');

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingIceRef = useRef([]);
  const timerRef = useRef(null);
  const startedRef = useRef(false);
  const endedRef = useRef(false);
  const connectedRef = useRef(false);
  const connectedUIRef = useRef(false);
  const cameraOnRef = useRef(true);
  const captureViewRef = useRef(null);
  const dashOffset = useRef(new Animated.Value(0)).current;
  const coinCountdownRef = useRef(null);
  const localCoinStartedRef = useRef(false);
  const alertShownRef = useRef(false);
  const coinEndedRef = useRef(false);
  const manualExitRef = useRef(false);
  const forceExitRef = useRef(false);
  const remoteEndedRef = useRef(false);
  const disableExitRef = useRef(false);
  const isExitingRef = useRef(false);
  const otherRef = useRef(null);
  const handleCoinExhaustedRef = useRef(null);
  const handleEndCallRef = useRef(null);
  const lastMinuteAlertShownRef = useRef(false);

  connectedUIRef.current = connectedUI;
  cameraOnRef.current = cameraOn;

  useEffect(() => {
    otherRef.current = other;
  }, [other]);

  const onFaceGone = useCallback(() => {
    socketRef.current?.emit('face_status', { session_id, user_id: myId, face_visible: false });
  }, [session_id, myId]);

  const onFaceBack = useCallback(() => {
    socketRef.current?.emit('face_status', { session_id, user_id: myId, face_visible: true });
  }, [session_id, myId]);

  const { faceStatus, faceCount } = useFaceDetection({
    enabled: connectedUI && cameraOn,
    viewRef: captureViewRef,
    onFaceGone,
    onFaceBack,
  });

  const myFaceGone = cameraOn && (faceStatus === 'no_face' || faceStatus === 'multiple_faces');
  const isFaceCentered = (faceStatus === 'face_found' || faceStatus === 'single_face') && faceCount === 1;

  useEffect(() => {
    dashOffset.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(dashOffset, { toValue: 20, duration: 800, useNativeDriver: false }),
        Animated.timing(dashOffset, { toValue: 0, duration: 0, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!connectedUI) return;
    socketRef.current?.emit('camera_status', { session_id, user_id: myId, camera_on: cameraOn });
  }, [cameraOn, connectedUI]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handleFace = ({ user_id, face_visible }) => {
      if (String(user_id) === String(myId)) return;
      setOtherFaceGone(!face_visible);
    };
    const handleCamera = ({ user_id, camera_on }) => {
      if (String(user_id) === String(myId)) return;
      setOtherCameraOff(!camera_on);
      if (!camera_on) setOtherFaceGone(false);
    };
    socket.on('face_status_update', handleFace);
    socket.on('camera_status_update', handleCamera);
    return () => {
      socket.off('face_status_update', handleFace);
      socket.off('camera_status_update', handleCamera);
    };
  }, [myId]);

  useEffect(() => {
    if (session_id) dispatch(callDetailsRequest());
  }, [session_id]);

  const requestPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const mic = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    const cam = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    return mic === PermissionsAndroid.RESULTS.GRANTED && cam === PermissionsAndroid.RESULTS.GRANTED;
  };

  const clearCoinCountdown = useCallback(() => {
    if (coinCountdownRef.current) {
      clearInterval(coinCountdownRef.current);
      coinCountdownRef.current = null;
    }
  }, []);

  // ── Audio device listener — same pattern as AudiocallScreen ──
useEffect(() => {
  const incallEmitter = new NativeEventEmitter();

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
      setSpeakerOn(true);
    } else {
      // EARPIECE / default — video calls fall back to speaker, not earpiece,
      // since there's no earpiece-appropriate use case for video
      setAudioDevice('speaker');
      setSpeakerOn(true);
      InCallManager.setForceSpeakerphoneOn(true);
      InCallManager.setSpeakerphoneOn(true);
    }
  });

  return () => subscription.remove();
}, []);
  const handleCoinExhausted = useCallback(() => {
    if (coinEndedRef.current) return;
    coinEndedRef.current = true;
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    manualExitRef.current = true;
    forceExitRef.current = true;
    clearCoinCountdown();

    localCoinStartedRef.current = false;
    lastMinuteAlertShownRef.current = false;
    endedRef.current = false;
    const currentOther = otherRef.current;
    socketRef.current?.emit('call_end', { session_id, user_id: myId });
    socketRef.current?.emit('video_call_hangup', { session_id, user_id: myId });
    stopCallMedia();
    callManager.reset();
    dispatch(clearCall());
    showToast('Coins exhausted — call ended.');
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: myGender === 'Male' ? 'MaleHomeTabs' : 'ReceiverBottomTabs' },
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
              role: myGender === 'Male' ? 'Male' : 'female',
              call_type: callType,
            },
          },
        ],
      })
    );
  }, [session_id, myId, myGender, callType, clearCoinCountdown, dispatch, navigation]);

  useEffect(() => {
    handleCoinExhaustedRef.current = handleCoinExhausted;
  }, [handleCoinExhausted]);

  const startCoinCountdown = useCallback(
    (initialSeconds) => {
      clearCoinCountdown();
      setCoinSecondsLeft(initialSeconds);

      coinCountdownRef.current = setInterval(() => {
        setCoinSecondsLeft((prev) => {
          if (prev === null) return null;

          if (prev <= 0) {
            clearCoinCountdown();
            setTimeout(() => {
              handleCoinExhaustedRef.current?.();
            }, 1000);
            return 0;
          }
          const next = prev - 1;

          if (next === 30 && !alertShownRef.current) {
            alertShownRef.current = true;
            setWarningMsg('Low Balance\nRecharge now. Your call will end in 30 seconds.');
            setTimeout(() => {
              setWarningMsg('');
            }, 15000);
          }

          return next;
        });
      }, 1000);
    },
    [clearCoinCountdown]
  );

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !connectedUI) return;
    socket.emit('video_join_room', { session_id });

    const onMinutesUpdate = ({ remainingCoins, ratePerMinute }) => {
      if (!isMale) return;
      const effectiveRate = ratePerMinute || RATE;
      const newSeconds = Math.floor((remainingCoins / effectiveRate) * 60);
      setCoinSecondsLeft(newSeconds);
    };

    const onLowBalanceWarning = ({ remainingCoins }) => {
      if (!isMale) return;
      const msg = `Less than 1 minute left! (${remainingCoins} coins)`;
      setWarningMsg(msg);
      showToast(msg);
      setTimeout(() => setWarningMsg(''), 5000);
    };

    const onInsufficientBalance = () => {
      if (!isMale) return;
      setWarningMsg('Coins finished!');
      clearCoinCountdown();
      handleCoinExhaustedRef.current?.();
    };

    socket.on('male_minutes_update', onMinutesUpdate);
    socket.on('low_balance_warning', onLowBalanceWarning);
    socket.on('call_insufficient_balance', onInsufficientBalance);
    return () => {
      socket.off('male_minutes_update', onMinutesUpdate);
      socket.off('low_balance_warning', onLowBalanceWarning);
      socket.off('call_insufficient_balance', onInsufficientBalance);
    };
  }, [connectedUI, session_id, isMale, startCoinCountdown, clearCoinCountdown]);

  const stopCallMedia = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    clearInterval(timerRef.current);
    timerRef.current = null;
    clearCoinCountdown();
    localCoinStartedRef.current = false;
    lastMinuteAlertShownRef.current = false;
    alertShownRef.current = false;
    InCallManager.stop();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    coinEndedRef.current = false;
    setLocalURL(null);
    setRemoteURL(null);
  }, [clearCoinCountdown]);

  const handleEndCall = useCallback(() => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    manualExitRef.current = true;
    const currentOther = otherRef.current;
    socketRef.current?.emit('call_end', { session_id, user_id: myId });
    socketRef.current?.emit('video_call_hangup', { session_id, user_id: myId });
    stopCallMedia();
    localCoinStartedRef.current = false;
    lastMinuteAlertShownRef.current = false;
    coinEndedRef.current = false;
    endedRef.current = false;

    callManager.reset();
    dispatch(clearCall());
    showToast('You ended the call');
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: myGender === 'Male' ? 'MaleHomeTabs' : 'ReceiverBottomTabs' },
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
              role: myGender === 'Male' ? 'Male' : 'female',
              call_type: callType,
            },
          },
        ],
      })
    );
  }, [session_id, myId, myGender, callType, stopCallMedia, dispatch, navigation]);

  useEffect(() => {
    handleEndCallRef.current = handleEndCall;
  }, [handleEndCall]);

  const onConnected = useCallback(() => {
    if (timerRef.current) return;
    connectedRef.current = true;
    connectedUIRef.current = true;
    setConnectedUI(true);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    // Respect whatever audio route is already active (headset/bluetooth
// plugged in before connect) instead of always forcing speaker.
if (audioDevice === 'headset' || audioDevice === 'bluetooth') {
  setSpeakerOn(false);
  InCallManager.setForceSpeakerphoneOn(false);
  InCallManager.setSpeakerphoneOn(false);
} else {
  setSpeakerOn(true);
  InCallManager.setForceSpeakerphoneOn(true);
  InCallManager.setSpeakerphoneOn(true);
}

    endedRef.current = false;
    isExitingRef.current = false;
    manualExitRef.current = false;
    forceExitRef.current = false;
    remoteEndedRef.current = false;
    disableExitRef.current = false;
    coinEndedRef.current = false;
    alertShownRef.current = false;
    lastMinuteAlertShownRef.current = false;

    if (isMale) {
      if (coinBalance < RATE) {
        setWarningMsg('No coins! Call ending...');
        showToast('Insufficient coins.');
        setTimeout(() => handleCoinExhaustedRef.current?.(), 2000);
        return;
      }
      if (!localCoinStartedRef.current) {
        localCoinStartedRef.current = true;
        const initialSeconds = Math.floor((coinBalance / RATE) * 60);
        startCoinCountdown(initialSeconds);
      }
    }
  }, [isMale, coinBalance, RATE, startCoinCountdown, clearCoinCountdown , audioDevice]);

  const onOfferRef = useRef(null);
  const onAnswerRef = useRef(null);
  const onIceRef = useRef(null);
  const onConnectedRef = useRef(null);

  useEffect(() => {
    onConnectedRef.current = onConnected;
  }, [onConnected]);

  const flushIce = useCallback(async () => {
    for (const c of pendingIceRef.current) {
      try {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(c));
      } catch {}
    }
    pendingIceRef.current = [];
  }, []);

  useEffect(() => {
    onOfferRef.current = async ({ offer }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(offer);
        await flushIce();
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socketRef.current?.emit('video_answer', { session_id, answer });
        onConnectedRef.current?.();
      } catch (e) {
        console.log('onOffer error:', e);
      }
    };
    onAnswerRef.current = async ({ answer }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(answer);
        await flushIce();
        onConnectedRef.current?.();
      } catch (e) {
        console.log('onAnswer error:', e);
      }
    };
    onIceRef.current = async ({ candidate }) => {
      if (!pcRef.current || !candidate) return;
      try {
        if (pcRef.current.remoteDescription) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          pendingIceRef.current.push(candidate);
        }
      } catch {}
    };
  }, [session_id, flushIce]);

  useEffect(() => {
    if (!connected || !socketRef.current || startedRef.current) return;
    startedRef.current = true;
    const socket = socketRef.current;
    const offerHandler = (data) => onOfferRef.current?.(data);
    const answerHandler = (data) => onAnswerRef.current?.(data);
    const iceHandler = (data) => onIceRef.current?.(data);

    const navigateAfterRemoteEnd = (currentOther) => {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: myGender === 'Male' ? 'MaleHomeTabs' : 'ReceiverBottomTabs' },
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
                role: myGender === 'Male' ? 'Male' : 'female',
                call_type: callType,
              },
            },
          ],
        })
      );
    };

    const handleRemoteEnd = (data) => {
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
      setTimeout(() => navigateAfterRemoteEnd(currentOther), 800);
    };

    const start = async () => {
      try {
        const ok = await requestPermission();
        if (!ok) {
          navigation.goBack();
          return;
        }

        InCallManager.start({ media: 'video' });
        InCallManager.setForceSpeakerphoneOn(true);
        InCallManager.setSpeakerphoneOn(true);
        InCallManager.setMicrophoneMute(false);

        pcRef.current = createPC({
          onIceCandidate: (c) => socket.emit('video_ice_candidate', { session_id, candidate: c }),
          onTrack: (stream) => {
            if (!stream) return;
            stream.getAudioTracks().forEach((t) => {
              t.enabled = true;
            });
            stream.getVideoTracks().forEach((t) => {
              t.enabled = true;
            });
            setRemoteURL(stream.toURL());
            setTimeout(() => {
              InCallManager.stop();
              InCallManager.start({ media: 'video' });
              InCallManager.setForceSpeakerphoneOn(true);
              InCallManager.setSpeakerphoneOn(true);
            }, 500);
          },
        });

        const stream = await mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: { facingMode: 'user', width: 640, height: 480, frameRate: 30 },
        });

        localStreamRef.current = stream;
        setLocalURL(stream.toURL());
        stream.getTracks().forEach((t) => {
          t.enabled = true;
          pcRef.current.addTrack(t, stream);
        });

        socket.on('video_offer', offerHandler);
        socket.on('video_answer', answerHandler);
        socket.on('video_ice_candidate', iceHandler);
        socket.on('call_ended', handleRemoteEnd);
        socket.on('video_call_ended', handleRemoteEnd);

        socket.on('video_connected', async () => {
          onConnectedRef.current?.();
          if (!pcRef.current) return;
          const isCaller = String(myId) === String(routeCallerId);
          if (!isCaller) return;
          try {
            await new Promise((r) => setTimeout(r, 300));
            const offer = await pcRef.current.createOffer();
            await pcRef.current.setLocalDescription(offer);
            socket.emit('video_offer', { session_id, offer });
          } catch (e) {
            console.log('OFFER ERROR:', e);
          }
        });

        socket.emit('video_join', { session_id });
      } catch (e) {
        console.log('START ERROR:', e);
      }
    };

    start();

    return () => {
      socket.off('video_offer', offerHandler);
      socket.off('video_answer', answerHandler);
      socket.off('video_ice_candidate', iceHandler);
      socket.off('video_connected');
      socket.off('call_ended', handleRemoteEnd);
      socket.off('video_call_ended', handleRemoteEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handle = ({ user_id, micOn: mOn }) => {
      if (String(user_id) !== String(myId)) setOtherMicOn(mOn);
    };
    socket.on('mic_status_update', handle);
    return () => socket.off('mic_status_update', handle);
  }, [myId]);

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
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
        { text: 'Exit', style: 'destructive', onPress: () => handleEndCallRef.current?.() },
      ]);
    });
    return unsub;
  }, [navigation]);

  useEffect(() => {
    return () => {
      if (startedRef.current && !endedRef.current && !manualExitRef.current) {
        socketRef.current?.emit('call_end', { session_id, user_id: myId });
        socketRef.current?.emit('video_call_hangup', { session_id, user_id: myId });
        stopCallMedia();
        callManager.reset();
        dispatch(clearCall());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showOtherBlur = !myFaceGone && otherFaceGone && !otherCameraOff;
  const showOtherAvatar = !myFaceGone && otherCameraOff;
  const coinM = coinSecondsLeft !== null ? Math.floor(coinSecondsLeft / 60) : 0;
  const coinS = coinSecondsLeft !== null ? coinSecondsLeft % 60 : 0;
  const coinDisplay = coinSecondsLeft !== null ? `${coinM}:${String(coinS).padStart(2, '0')}` : null;
  const coinIsLow = coinSecondsLeft !== null && coinSecondsLeft <= 60;
  const guideColor = faceStatus === 'multiple_faces' ? '#FFA940' : '#FF4D4F';

  const myAvatar = userdata?.images?.display_profile_image;

  return (
    <View style={styles.container}>
      {localURL && connectedUI && cameraOn && (
        <View ref={captureViewRef} collapsable={false} renderToHardwareTextureAndroid style={styles.hiddenCapture}>
          <RTCView streamURL={localURL} style={{ width: moderateScale(320), height: moderateScale(240) }} objectFit="cover" mirror zOrder={2} />
        </View>
      )}

      {!connectedCallDetails ? (
        <View style={styles.waiting}>
          <AppText variant="body" style={styles.waitText}>Loading call...</AppText>
        </View>
      ) : !localURL ? (
        <View style={styles.waiting}>
          <AppText variant="body" style={styles.waitText}>Starting camera...</AppText>
        </View>
      ) : !remoteURL ? (
        <>
          <RTCView streamURL={localURL} style={styles.bigVideo} objectFit="cover" mirror zOrder={0} />
          <View style={styles.waitingOverlay}>
            <AppText variant="body" style={styles.waitText}>Waiting for other user...</AppText>
          </View>
        </>
      ) : (
        <>
          <View style={styles.bigVideo}>
            {myFaceGone ? (
              <>
                {cameraOn ? (
                  <RTCView streamURL={localURL} style={StyleSheet.absoluteFill} objectFit="cover" mirror zOrder={0} />
                ) : (
                  <View style={StyleSheet.absoluteFill}>
                    {myAvatar ? (
                      <Image source={{ uri: myAvatar }} style={StyleSheet.absoluteFill} blurRadius={18} />
                    ) : (
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#111' }]} />
                    )}
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />
                  </View>
                )}

                <View style={styles.userGuide} pointerEvents="none">
                  <Svg height="100%" width="100%" viewBox="0 0 220 300">
                    <Circle cx="110" cy="120" r="3" fill={guideColor} />
                    <Path
                      d="M110 40 C145 40, 170 75, 170 110 C170 150, 145 180, 110 185 C75 180, 50 150, 50 110 C50 75, 75 40, 110 40 Z"
                      stroke={guideColor}
                      strokeWidth="3"
                      strokeDasharray="10,6"
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      fill="none"
                    />
                    <Path
                      d="M40 250 Q110 190 180 250"
                      stroke={guideColor}
                      strokeWidth="3"
                      strokeDasharray="10,6"
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </Svg>
                </View>

                <View style={styles.faceHintBox} pointerEvents="none">
                  <Ionicons name="scan-outline" size={moderateScale(16)} color={guideColor} />
                  <AppText variant="caption" style={[styles.faceHintText, { color: guideColor }]}>
                    {faceStatus === 'multiple_faces' ? 'Only one face allowed 🚫' : 'Position your face in the frame'}
                  </AppText>
                </View>
              </>
            ) : (
              <>
                <RTCView streamURL={remoteURL} style={StyleSheet.absoluteFill} objectFit="cover" zOrder={0} />

                {!otherMicOn && (
                  <View style={styles.otherMicBadge} pointerEvents="none">
                    <Ionicons name="mic-off" size={moderateScale(14)} color="#fff" />
                  </View>
                )}

                {showOtherBlur && (
                  <View style={styles.blurOverlay} pointerEvents="none">
                    {other?.display_profile_image ? (
                      <Image source={{ uri: other.display_profile_image }} style={styles.blurBg} blurRadius={25} />
                    ) : (
                      <View style={[styles.blurBg, { backgroundColor: '#111' }]} />
                    )}
                    <View style={styles.blurTint} />
                    <View style={styles.blurMsgBox}>
                      <View style={styles.blurIconRing}>
                        <Ionicons name="eye-off-outline" size={moderateScale(28)} color="#FF4D4F" />
                      </View>
                      <AppText variant="subtitle" style={styles.blurMsgTitle}>Face Not Visible</AppText>
                      <AppText variant="caption" style={styles.blurMsgSub}>Waiting for the other user to show their face</AppText>
                    </View>
                  </View>
                )}

                {showOtherAvatar && (
                  <View style={styles.blurOverlay} pointerEvents="none">
                    {other?.display_profile_image ? (
                      <Image source={{ uri: other.display_profile_image }} style={styles.blurBg} blurRadius={25} />
                    ) : (
                      <View style={[styles.blurBg, { backgroundColor: '#0a0a0a' }]} />
                    )}
                    <View style={styles.blurTint} />
                    <View style={styles.avatarBox}>
                      {other?.display_profile_image ? (
                        <Image source={{ uri: other.display_profile_image }} style={styles.avatarImg} />
                      ) : (
                        <View style={styles.avatarFallback}>
                          <Ionicons name="person" size={moderateScale(48)} color="#555" />
                        </View>
                      )}
                      <View style={styles.camOffPill}>
                        <Ionicons name="videocam-off" size={moderateScale(12)} color="#fff" />
                        <AppText variant="caption" style={styles.camOffText}>Camera off</AppText>
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>

          {!myFaceGone && (
            <View
              style={styles.pip}
              onLayout={(e) => {
                const { y, height } = e.nativeEvent.layout;
                setMicBadgePos({ top: y + height - 16, right: 10 });
              }}
            >
              <View style={styles.pipInner}>
                {cameraOn ? (
                  <RTCView streamURL={localURL} style={StyleSheet.absoluteFill} objectFit="cover" mirror surfaceView={false} />
                ) : (
                  <View style={styles.pipCameraOff}>
                    {myAvatar ? (
                      <>
                        <Image source={{ uri: myAvatar }} style={styles.pipBlurBg} blurRadius={20} />
                        <View style={styles.pipTint} />
                        <View style={styles.pipAvatarBox}>
                          <Image source={{ uri: myAvatar }} style={styles.pipAvatar} />
                          <View style={styles.pipCamOffPill}>
                            <Ionicons name="videocam-off" size={moderateScale(10)} color="#fff" />
                            <AppText variant="caption" style={styles.pipCamOffText}>Camera off</AppText>
                          </View>
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.pipTint} />
                        <View style={styles.pipAvatarFallback}>
                          <Ionicons name="person" size={moderateScale(28)} color="#666" />
                        </View>
                      </>
                    )}
                  </View>
                )}

                {!micOn && (
                  <View style={styles.myMicBadge}>
                    <Ionicons name="mic-off" size={moderateScale(14)} color="#fff" />
                  </View>
                )}
              </View>
            </View>
          )}
        </>
      )}

      {showOtherBlur && connectedUI && (
        <View style={styles.otherBanner}>
          <Ionicons name="eye-off-outline" size={moderateScale(12)} color="#fff" />
          <AppText variant="caption" style={styles.otherBannerText}>Other user's face not visible</AppText>
        </View>
      )}

      <View style={styles.timerStack} pointerEvents="none">
        <View style={styles.durationPill}>
          <AppText variant="caption" style={styles.durationText}>
            {connectedUI ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : 'Connecting…'}
          </AppText>
        </View>
        {connectedUI && isMale && coinDisplay !== null && (
          <View style={[styles.coinPill, coinIsLow && styles.coinPillLow]}>
            <AppText variant="caption" style={styles.coinPillText}>🪙 {coinDisplay}</AppText>
          </View>
        )}
      </View>

      {warningMsg !== '' && (
        <View style={styles.warningBanner} pointerEvents="none">
          <Ionicons name="warning-outline" size={moderateScale(14)} color="#fff" />
          <AppText variant="caption" style={styles.warningText}>{warningMsg}</AppText>
        </View>
      )}

      <LinearGradient colors={['#1b1b1b', '#101010']} style={styles.bottomBar}>
       <RoundBtn
  id="speaker"
  activeBtn={activeBtn}
  setActiveBtn={setActiveBtn}
  icon={audioDevice === 'headset' ? 'headset' : audioDevice === 'bluetooth' ? 'bluetooth' : speakerOn ? 'volume-high' : 'volume-mute'}
  primary={PRIMARY}
  styles={styles}
  disabled={audioDevice === 'headset' || audioDevice === 'bluetooth'}
  onPress={() => {
    if (audioDevice === 'headset' || audioDevice === 'bluetooth') return;
    setSpeakerOn((p) => {
      const next = !p;
      setAudioDevice(next ? 'speaker' : 'earpiece');
      InCallManager.setForceSpeakerphoneOn(false);
      setTimeout(() => InCallManager.setSpeakerphoneOn(next), 150);
      return next;
    });
  }}
/>
        <RoundBtn
          id="mic"
          activeBtn={activeBtn}
          setActiveBtn={setActiveBtn}
          icon={micOn ? 'mic' : 'mic-off'}
          primary={PRIMARY}
          styles={styles}
          onPress={() => {
            const t = localStreamRef.current?.getAudioTracks()[0];
            if (!t) return;
            const next = !t.enabled;
            t.enabled = next;
            setMicOn(next);
            const s = socketRef.current;
            if (s?.connected) s.emit('mic_status', { session_id, user_id: myId, micOn: next });
          }}
        />
        <RoundBtn
          id="camera"
          activeBtn={activeBtn}
          setActiveBtn={setActiveBtn}
          icon={cameraOn ? 'videocam' : 'videocam-off'}
          primary={PRIMARY}
          styles={styles}
          onPress={() => {
            const t = localStreamRef.current?.getVideoTracks()[0];
            if (!t) return;
            t.enabled = !t.enabled;
            setCameraOn(t.enabled);
          }}
        />
        <RoundBtn
          id="end"
          activeBtn={activeBtn}
          setActiveBtn={setActiveBtn}
          icon="call"
          large
          primary={PRIMARY}
          styles={styles}
          onPress={() => {
            Alert.alert('End Call?', 'Are you sure you want to exit the call?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Exit', style: 'destructive', onPress: () => handleEndCallRef.current?.() },
            ]);
          }}
        />
      </LinearGradient>

      <FaceDetectionOverlay faceStatus={faceStatus} faceCount={faceCount} visible={connectedUI} />
    </View>
  );
};

const RoundBtn = ({ id, icon, onPress, large, activeBtn, setActiveBtn, primary, styles, disabled }) => {
  const isActive = activeBtn === id;
  const isEnd = id === 'end';
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={() => {
        setActiveBtn(id);
        onPress?.();
      }}
      style={[
        styles.roundBtn,
        large && styles.endBtn,
        {
          backgroundColor: isEnd ? '#FF4D4F' : isActive ? primary : '#fff',
          borderWidth: isActive || isEnd ? 0 : 2,
          borderColor: primary,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={large ? moderateScale(30) : moderateScale(22)} color={isEnd ? '#fff' : isActive ? '#fff' : primary} />
    </TouchableOpacity>
  );
};

export default VideocallScreen;

// Video surface + controls stay black regardless of theme — required
// for camera contrast, matching any standard video-call UI.
const createStyles = (theme) => {
  const { spacing, radius } = theme;

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    bigVideo: { flex: 1 },

    hiddenCapture: {
      position: 'absolute',
      width: moderateScale(320),
      height: moderateScale(240),
      top: 0,
      left: -moderateScale(320),
      opacity: 0.01,
      zIndex: -1,
      overflow: 'hidden',
    },

    userGuide: {
      position: 'absolute',
      top: '16%',
      width: moderateScale(220),
      height: moderateScale(300),
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 20,
    },
    faceHintBox: {
      position: 'absolute',
      bottom: '14%',
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: 'rgba(0,0,0,0.75)',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.xl,
    },
    faceHintText: { fontWeight: '600' },

    blurOverlay: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    blurBg: { position: 'absolute', width: '100%', height: '100%' },
    blurTint: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)' },
    blurMsgBox: { alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xxl },
    blurIconRing: {
      width: moderateScale(64),
      height: moderateScale(64),
      borderRadius: moderateScale(32),
      backgroundColor: 'rgba(255,77,79,0.15)',
      borderWidth: 1.5,
      borderColor: 'rgba(255,77,79,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xxs,
    },
    blurMsgTitle: { color: '#fff', letterSpacing: 0.2 },
    blurMsgSub: { color: '#888', textAlign: 'center', lineHeight: moderateScale(18) },
    avatarBox: { alignItems: 'center', gap: spacing.md },
    avatarImg: { width: moderateScale(96), height: moderateScale(96), borderRadius: moderateScale(48), borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.15)' },
    avatarFallback: { width: moderateScale(96), height: moderateScale(96), borderRadius: moderateScale(48), backgroundColor: '#1e1e1e', alignItems: 'center', justifyContent: 'center' },
    camOffPill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.lg },
    camOffText: { color: '#bbb', fontWeight: '500' },

    pip: {
      position: 'absolute',
      top: moderateScale(70),
      right: spacing.md,
      zIndex: 10,
      elevation: 10,
      borderRadius: radius.md,
      overflow: 'visible',
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.12)',
    },
    pipInner: { width: moderateScale(108), height: moderateScale(156), borderRadius: radius.md, overflow: 'hidden' },
    pipCameraOff: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' },
    pipBlurBg: { position: 'absolute', width: '100%', height: '100%' },
    pipTint: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.52)' },
    myMicBadge: {
      position: 'absolute',
      top: spacing.xs,
      right: spacing.xs,
      width: moderateScale(24),
      height: moderateScale(24),
      borderRadius: moderateScale(12),
      backgroundColor: '#FF3B30',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      elevation: 1000,
    },
    pipAvatarBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
    pipAvatar: { width: moderateScale(46), height: moderateScale(46), borderRadius: moderateScale(23), borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)' },
    pipAvatarFallback: { width: moderateScale(46), height: moderateScale(46), borderRadius: moderateScale(23), backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' },
    pipCamOffPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: spacing.xs, paddingVertical: 3, borderRadius: radius.sm },
    pipCamOffText: { color: '#bbb', fontSize: moderateScale(9), fontWeight: '500' },

    otherMicBadge: {
      position: 'absolute',
      top: moderateScale(50),
      left: spacing.md,
      width: moderateScale(28),
      height: moderateScale(28),
      borderRadius: moderateScale(14),
      backgroundColor: 'rgba(255,77,79,0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 20,
      elevation: 20,
    },

    otherBanner: {
      position: 'absolute',
      top: moderateScale(44),
      left: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
      backgroundColor: 'rgba(255,77,79,0.88)',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      borderRadius: radius.lg,
      zIndex: 30,
    },
    otherBannerText: { color: '#fff', fontWeight: '600' },

    waiting: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    waitText: { color: '#fff' },
    waitingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)' },

    timerStack: { position: 'absolute', top: moderateScale(44), left: 0, right: 0, alignItems: 'center', gap: spacing.xs, zIndex: 20 },
    durationPill: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, borderRadius: radius.xl },
    durationText: { color: '#fff' },
    coinPill: { backgroundColor: 'rgba(130,0,230,0.85)', paddingHorizontal: spacing.md, paddingVertical: spacing.xxs, borderRadius: radius.xl, flexDirection: 'row', alignItems: 'center' },
    coinPillLow: { backgroundColor: 'rgba(220,50,50,0.92)' },
    coinPillText: { color: '#fff', fontWeight: '700' },

    warningBanner: {
      position: 'absolute',
      bottom: moderateScale(125),
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

    bottomBar: {
      position: 'absolute',
      bottom: moderateScale(24),
      left: spacing.md,
      right: spacing.md,
      height: moderateScale(84),
      borderRadius: moderateScale(40),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
    },
    roundBtn: { width: moderateScale(52), height: moderateScale(52), borderRadius: moderateScale(26), alignItems: 'center', justifyContent: 'center' },
    endBtn: { width: moderateScale(64), height: moderateScale(64), borderRadius: moderateScale(32) },
  });
};