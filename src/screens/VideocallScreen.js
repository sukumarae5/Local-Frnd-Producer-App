import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Image,
  Animated,
  Alert,
  ToastAndroid,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RTCView, mediaDevices, RTCIceCandidate } from 'react-native-webrtc';
import { CommonActions } from '@react-navigation/native';
import InCallManager from 'react-native-incall-manager';
import { useDispatch, useSelector } from 'react-redux';
import Svg, { Path, Circle } from 'react-native-svg';
import FaceDetectionOverlay from '../components/FaceDetectionOverlay';
import { useFaceDetection } from '../hooks/useFaceDetection';
import { clearCall, callDetailsRequest } from '../features/calls/callAction';
import { SocketContext } from '../socket/SocketProvider';
import { createPC } from '../utils/webrtc';
import callManager from '../utils/callManager';

const showToast = msg => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  }
};

const PRIMARY = '#A020F0';

const VideocallScreen = ({ route, navigation }) => {
  const { session_id, caller_id: routeCallerId } = route.params;
  const { socketRef, connected } = useContext(SocketContext);
  const dispatch = useDispatch();

  const { userdata } = useSelector(s => s.user);
  const myGender = useSelector(s => s.user?.userdata?.user?.gender);
  const connectedCallDetails = useSelector(s => s?.calls?.connectedCallDetails);
  const myId = useSelector(s => s.user.userdata?.user?.user_id);
  const coinBalance = useSelector(
    s => s.user?.userdata?.user?.coin_balance ?? 0,
  );

  const callType = route?.params?.call_type || 'VIDEO';
  const isMale = myGender === 'Male';
  const RATE = callType === 'VIDEO' ? 60 : 10;

  const caller = connectedCallDetails?.caller;
  const connectedUser = connectedCallDetails?.connected_user;
  const iAmCaller = String(myId) === String(routeCallerId);
  const other = iAmCaller ? connectedUser : caller;

  /* ── State ── */
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
  // Mic badge position — measured from PiP onLayout so it sits exactly
  // on the bottom-right corner of PiP regardless of screen size
  const [micBadgePos, setMicBadgePos] = useState(null);

  /* ── Refs ── */
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

  connectedUIRef.current = connectedUI;
  cameraOnRef.current = cameraOn;

  useEffect(() => {
    otherRef.current = other;
  }, [other]);

  /* ── Face detection ── */
  const onFaceGone = useCallback(() => {
    socketRef.current?.emit('face_status', {
      session_id,
      user_id: myId,
      face_visible: false,
    });
  }, [session_id, myId]);

  const onFaceBack = useCallback(() => {
    socketRef.current?.emit('face_status', {
      session_id,
      user_id: myId,
      face_visible: true,
    });
  }, [session_id, myId]);

  const { faceStatus, faceCount } = useFaceDetection({
    enabled: connectedUI && cameraOn,
    viewRef: captureViewRef,
    onFaceGone,
    onFaceBack,
  });

  // Guard with cameraOn — face guide must never show when camera is off
  const myFaceGone =
    cameraOn && (faceStatus === 'no_face' || faceStatus === 'multiple_faces');
  const isFaceCentered =
    (faceStatus === 'face_found' || faceStatus === 'single_face') &&
    faceCount === 1;

  /* ── Dash animation for face guide oval ── */
  useEffect(() => {
    dashOffset.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(dashOffset, {
          toValue: 20,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(dashOffset, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  /* ── Camera toggle — notify other user ── */
  useEffect(() => {
    if (!connectedUI) return;
    socketRef.current?.emit('camera_status', {
      session_id,
      user_id: myId,
      camera_on: cameraOn,
    });
  }, [cameraOn, connectedUI]);

  /* ── Other user face + camera status ── */
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

  /* ── Permissions ── */
  const requestPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const mic = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
    const cam = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    return (
      mic === PermissionsAndroid.RESULTS.GRANTED &&
      cam === PermissionsAndroid.RESULTS.GRANTED
    );
  };

  /* ── Coin countdown helpers ── */
  const clearCoinCountdown = useCallback(() => {
    if (coinCountdownRef.current) {
      clearInterval(coinCountdownRef.current);
      coinCountdownRef.current = null;
    }
  }, []);

  const handleCoinExhausted = useCallback(() => {
    if (coinEndedRef.current) return;
    coinEndedRef.current = true;
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    manualExitRef.current = true;
    forceExitRef.current = true;
    clearCoinCountdown();
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
                avatar: currentOther?.avatar,
              },
              session_id,
              role: myGender === 'Male' ? 'Male' : 'female',
              call_type: callType,
            },
          },
        ],
      }),
    );
  }, [
    session_id,
    myId,
    myGender,
    callType,
    clearCoinCountdown,
    dispatch,
    navigation,
  ]);

  useEffect(() => {
    handleCoinExhaustedRef.current = handleCoinExhausted;
  }, [handleCoinExhausted]);

  const startCoinCountdown = useCallback(
    initialSeconds => {
      clearCoinCountdown();
      if (initialSeconds > 30) alertShownRef.current = false;
      setCoinSecondsLeft(initialSeconds);
      coinCountdownRef.current = setInterval(() => {
        setCoinSecondsLeft(prev => {
          if (prev === null) return null;
          if (prev <= 0) {
            setTimeout(() => handleCoinExhaustedRef.current?.(), 0);
            return 0;
          }
          const next = prev - 1;
          if (next === 30 && !alertShownRef.current) {
            alertShownRef.current = true;
            setTimeout(() => {
              Alert.alert(
                '⚠️ Call Ending Soon',
                'Your call will end in 30 seconds. Buy more coins to continue.',
                [
                  { text: 'OK', style: 'cancel' },
                  {
                    text: 'Buy Coins',
                    onPress: () => {
                      handleCoinExhaustedRef.current?.();
                      setTimeout(() => navigation.navigate('PlanScreen'), 600);
                    },
                  },
                ],
                { cancelable: true },
              );
            }, 0);
          }
          if (next <= 0)
            setTimeout(() => handleCoinExhaustedRef.current?.(), 0);
          return next;
        });
      }, 1000);
    },
    [clearCoinCountdown, navigation],
  );

  /* ── Server coin events ── */
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !connectedUI) return;
    socket.emit('video_join_room', { session_id });
    const onMinutesUpdate = ({ remainingCoins, ratePerMinute }) => {
      if (!isMale) return;
      const newSecondsLeft = Math.floor((remainingCoins / ratePerMinute) * 60);
      localCoinStartedRef.current = true;
      startCoinCountdown(newSecondsLeft);
    };
    const onLowBalanceWarning = ({ remainingCoins }) => {
      if (!isMale) return;
      const msg = `⚠️ Less than 1 minute left! (${remainingCoins} coins)`;
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

  /* ── Stop all media ── */
  const stopCallMedia = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    clearInterval(timerRef.current);
    timerRef.current = null;
    clearCoinCountdown();
    InCallManager.stop();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    setLocalURL(null);
    setRemoteURL(null);
  }, [clearCoinCountdown]);

  /* ── End call ── */
  const handleEndCall = useCallback(() => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    manualExitRef.current = true;
    const currentOther = otherRef.current;
    socketRef.current?.emit('call_end', { session_id, user_id: myId });
    socketRef.current?.emit('video_call_hangup', { session_id, user_id: myId });
    stopCallMedia();
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
                avatar: currentOther?.avatar,
              },
              session_id,
              role: myGender === 'Male' ? 'Male' : 'female',
              call_type: callType,
            },
          },
        ],
      }),
    );
  }, [
    session_id,
    myId,
    myGender,
    callType,
    stopCallMedia,
    dispatch,
    navigation,
  ]);

  useEffect(() => {
    handleEndCallRef.current = handleEndCall;
  }, [handleEndCall]);

  /* ── On connected ── */
  const onConnected = useCallback(() => {
    if (timerRef.current) return;
    connectedRef.current = true;
    connectedUIRef.current = true;
    setConnectedUI(true);
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    setSpeakerOn(true);
    InCallManager.setForceSpeakerphoneOn(true);
    InCallManager.setSpeakerphoneOn(true);
    if (isMale) {
      if (coinBalance < RATE) {
        setWarningMsg('No coins! Call ending...');
        showToast('Insufficient coins.');
        setTimeout(() => handleCoinExhaustedRef.current?.(), 2000);
        return;
      }
      if (!localCoinStartedRef.current) {
        const initialSeconds = Math.floor((coinBalance / RATE) * 60);
        startCoinCountdown(initialSeconds);
      }
    }
  }, [isMale, coinBalance, RATE, startCoinCountdown]);

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

  /* ── WebRTC init ── */
  useEffect(() => {
    if (!connected || !socketRef.current || startedRef.current) return;
    startedRef.current = true;
    const socket = socketRef.current;
    const offerHandler = data => onOfferRef.current?.(data);
    const answerHandler = data => onAnswerRef.current?.(data);
    const iceHandler = data => onIceRef.current?.(data);

    const navigateAfterRemoteEnd = currentOther => {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            {
              name: myGender === 'Male' ? 'MaleHomeTabs' : 'ReceiverBottomTabs',
            },
            {
              name: 'CallStatusScreen',
              params: {
                showRating: true,
                fromCall: true,
                otherUser: {
                  user_id: currentOther?.user_id,
                  name: currentOther?.name,
                  avatar: currentOther?.avatar,
                },
                session_id,
                role: myGender === 'Male' ? 'Male' : 'female',
                call_type: callType,
              },
            },
          ],
        }),
      );
    };

    const handleRemoteEnd = data => {
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
          onIceCandidate: c =>
            socket.emit('video_ice_candidate', { session_id, candidate: c }),
          onTrack: stream => {
            if (!stream) return;
            stream.getAudioTracks().forEach(t => {
              t.enabled = true;
            });
            stream.getVideoTracks().forEach(t => {
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
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: { facingMode: 'user', width: 640, height: 480, frameRate: 30 },
        });

        localStreamRef.current = stream;
        setLocalURL(stream.toURL());
        stream.getTracks().forEach(t => {
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
            await new Promise(r => setTimeout(r, 300));
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

  /* ── Other user mic status ── */
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handle = ({ user_id, micOn: mOn }) => {
      if (String(user_id) !== String(myId)) setOtherMicOn(mOn);
    };
    socket.on('mic_status_update', handle);
    return () => socket.off('mic_status_update', handle);
  }, [myId]);

  /* ── Back button guard ── */
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', e => {
      if (
        forceExitRef.current ||
        remoteEndedRef.current ||
        disableExitRef.current ||
        manualExitRef.current
      ) {
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
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => handleEndCallRef.current?.(),
        },
      ]);
    });
    return unsub;
  }, [navigation]);

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      if (startedRef.current && !endedRef.current && !manualExitRef.current) {
        socketRef.current?.emit('call_end', { session_id, user_id: myId });
        socketRef.current?.emit('video_call_hangup', {
          session_id,
          user_id: myId,
        });
        stopCallMedia();
        callManager.reset();
        dispatch(clearCall());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Derived display values ── */
  const showOtherBlur = !myFaceGone && otherFaceGone && !otherCameraOff;
  const showOtherAvatar = !myFaceGone && otherCameraOff;
  const coinM = coinSecondsLeft !== null ? Math.floor(coinSecondsLeft / 60) : 0;
  const coinS = coinSecondsLeft !== null ? coinSecondsLeft % 60 : 0;
  const coinDisplay =
    coinSecondsLeft !== null
      ? `${coinM}:${String(coinS).padStart(2, '0')}`
      : null;
  const coinIsLow = coinSecondsLeft !== null && coinSecondsLeft <= 60;
  const guideColor = faceStatus === 'multiple_faces' ? '#FFA940' : '#FF4D4F';

  return (
    <View style={styles.container}>
      {/* ── Hidden capture view for face detection ──
          top:0 left:-320 keeps it within vertical bounds so Android GPU
          composites the SurfaceView. opacity:0.01 = invisible but capturable.
          Only mounted when camera is ON. */}
      {localURL && connectedUI && cameraOn && (
        <View
          ref={captureViewRef}
          collapsable={false}
          renderToHardwareTextureAndroid
          style={styles.hiddenCapture}
        >
          <RTCView
            streamURL={localURL}
            style={{ width: 320, height: 240 }}
            objectFit="cover"
            mirror
             zOrder={2}
          />
        </View>
      )}

      {/* ── Main video area ── */}
      {!connectedCallDetails ? (
        <View style={styles.waiting}>
          <Text style={styles.waitText}>Loading call...</Text>
        </View>
      ) : !localURL ? (
        <View style={styles.waiting}>
          <Text style={styles.waitText}>Starting camera...</Text>
        </View>
      ) : !remoteURL ? (
        <>
          <RTCView
            streamURL={localURL}
            style={styles.bigVideo}
            objectFit="cover"
            mirror
            zOrder={0}
          />
          <View style={styles.waitingOverlay}>
            <Text style={styles.waitText}>Waiting for other user...</Text>
          </View>
        </>
      ) : (
        <>
          {/* ── Big video ── */}
          <View style={styles.bigVideo}>
            {myFaceGone ? (
              /* Face guide — show local video behind oval */
              <>
                {cameraOn ? (
                  <RTCView
                    streamURL={localURL}
                    style={StyleSheet.absoluteFill}
                    objectFit="cover"
                    mirror
                    zOrder={0}
                  />
                ) : (
                  /* Camera off — blurred avatar instead of frozen frame */
                  <View style={StyleSheet.absoluteFill}>
                    {userdata?.user?.avatar ? (
                      <Image
                        source={{ uri: userdata.user.avatar }}
                        style={StyleSheet.absoluteFill}
                        blurRadius={18}
                      />
                    ) : (
                      <View
                        style={[
                          StyleSheet.absoluteFill,
                          { backgroundColor: '#111' },
                        ]}
                      />
                    )}
                    <View
                      style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(0,0,0,0.55)' },
                      ]}
                    />
                  </View>
                )}

                {/* Oval guide SVG */}
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

                {/* Hint text */}
                <View style={styles.faceHintBox} pointerEvents="none">
                  <Ionicons name="scan-outline" size={16} color={guideColor} />
                  <Text style={[styles.faceHintText, { color: guideColor }]}>
                    {faceStatus === 'multiple_faces'
                      ? 'Only one face allowed 🚫'
                      : 'Position your face in the frame'}
                  </Text>
                </View>
              </>
            ) : (
              /* Normal — remote video */
              <>
                {/* {isFaceCentered && (
                  <View style={styles.successBox} pointerEvents="none">
                    <Text style={styles.successText}>Perfect 👍</Text>
                  </View>
                )} */}

                <RTCView
                  streamURL={remoteURL}
                  style={StyleSheet.absoluteFill}
                  objectFit="cover"
                  zOrder={0}
                />

                {/* Other user mic-off — pinned to bottom-left of remote video */}
                {!otherMicOn && (
                  <View style={styles.otherMicBadge} pointerEvents="none">
                    <Ionicons name="mic-off" size={14} color="#fff" />
                  </View>
                )}

                {/* Other user face gone — blur overlay */}
                {showOtherBlur && (
                  <View style={styles.blurOverlay} pointerEvents="none">
                    {other?.avatar ? (
                      <Image
                        source={{ uri: other.avatar }}
                        style={styles.blurBg}
                        blurRadius={25}
                      />
                    ) : (
                      <View
                        style={[styles.blurBg, { backgroundColor: '#111' }]}
                      />
                    )}
                    <View style={styles.blurTint} />
                    <View style={styles.blurMsgBox}>
                      <View style={styles.blurIconRing}>
                        <Ionicons
                          name="eye-off-outline"
                          size={28}
                          color="#FF4D4F"
                        />
                      </View>
                      <Text style={styles.blurMsgTitle}>Face Not Visible</Text>
                      <Text style={styles.blurMsgSub}>
                        Waiting for the other user to show their face
                      </Text>
                    </View>
                  </View>
                )}

                {/* Other user camera off — avatar overlay */}
                {showOtherAvatar && (
                  <View style={styles.blurOverlay} pointerEvents="none">
                    {other?.avatar ? (
                      <Image
                        source={{ uri: other.avatar }}
                        style={styles.blurBg}
                        blurRadius={25}
                      />
                    ) : (
                      <View
                        style={[styles.blurBg, { backgroundColor: '#0a0a0a' }]}
                      />
                    )}
                    <View style={styles.blurTint} />
                    <View style={styles.avatarBox}>
                      {other?.avatar ? (
                        <Image
                          source={{ uri: other.avatar }}
                          style={styles.avatarImg}
                        />
                      ) : (
                        <View style={styles.avatarFallback}>
                          <Ionicons name="person" size={48} color="#555" />
                        </View>
                      )}
                      <View style={styles.camOffPill}>
                        <Ionicons name="videocam-off" size={12} color="#fff" />
                        <Text style={styles.camOffText}>Camera off</Text>
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>

          {/* ── PiP — local video (top-right) ──
              onLayout measures exact screen position so the mic badge
              can be placed at screen level (above SurfaceView) at the
              correct coordinates regardless of device screen size. */}
          {!myFaceGone && (
            <View
              style={styles.pip}
              onLayout={e => {
                const { x, y, width, height } = e.nativeEvent.layout;
                setMicBadgePos({
                  top: y + height - 16, // bottom edge of PiP minus half badge
                  right: 10, // slight overlap on right edge
                });
              }}
            >
           
           <View style={styles.pipInner}>

    {cameraOn ? (
        <RTCView
            streamURL={localURL}
            style={StyleSheet.absoluteFill}
            objectFit="cover"
            mirror
            surfaceView={false}
        />
    ) : (
        <View style={styles.pipCameraOff}>

            {userdata?.user?.avatar ? (
                <>
                    <Image
                        source={{ uri: userdata.user.avatar }}
                        style={styles.pipBlurBg}
                        blurRadius={20}
                    />

                    <View style={styles.pipTint} />

                    <View style={styles.pipAvatarBox}>
                        <Image
                            source={{ uri: userdata.user.avatar }}
                            style={styles.pipAvatar}
                        />

                        <View style={styles.pipCamOffPill}>
                            <Ionicons
                                name="videocam-off"
                                size={10}
                                color="#fff"
                            />
                            <Text style={styles.pipCamOffText}>
                                Camera off
                            </Text>
                        </View>
                    </View>
                </>
            ) : (
                <>
                    <View style={styles.pipTint} />

                    <View style={styles.pipAvatarFallback}>
                        <Ionicons
                            name="person"
                            size={28}
                            color="#666"
                        />
                    </View>
                </>
            )}

        </View>
    )}

    {!micOn && (
        <View style={styles.myMicBadge}>
            <Ionicons
                name="mic-off"
                size={14}
                color="#fff"
            />
        </View>
    )}
 
</View>
            </View>
          )}

        </>
      )}

      {/* Other face gone — top-left banner */}
      {showOtherBlur && connectedUI && (
        <View style={styles.otherBanner}>
          <Ionicons name="eye-off-outline" size={12} color="#fff" />
          <Text style={styles.otherBannerText}>
            Other user's face not visible
          </Text>
        </View>
      )}

      {/* Timer + coin pill — centred top */}
      <View style={styles.timerStack} pointerEvents="none">
        <View style={styles.durationPill}>
          <Text style={styles.durationText}>
            {connectedUI
              ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(
                  2,
                  '0',
                )}`
              : 'Connecting…'}
          </Text>
        </View>
        {connectedUI && isMale && coinDisplay !== null && (
          <View style={[styles.coinPill, coinIsLow && styles.coinPillLow]}>
            <Text style={styles.coinPillText}>🪙 {coinDisplay}</Text>
          </View>
        )}
      </View>

      {/* Warning banner */}
      {warningMsg !== '' && (
        <View style={styles.warningBanner} pointerEvents="none">
          <Ionicons name="warning-outline" size={14} color="#fff" />
          <Text style={styles.warningText}>{warningMsg}</Text>
        </View>
      )}

      {/* Bottom controls */}
      <LinearGradient colors={['#1b1b1b', '#101010']} style={styles.bottomBar}>
        <RoundBtn
          id="speaker"
          activeBtn={activeBtn}
          setActiveBtn={setActiveBtn}
          icon={speakerOn ? 'volume-high' : 'volume-mute'}
          onPress={() =>
            setSpeakerOn(p => {
              InCallManager.setSpeakerphoneOn(!p);
              return !p;
            })
          }
        />
        <RoundBtn
          id="mic"
          activeBtn={activeBtn}
          setActiveBtn={setActiveBtn}
          icon={micOn ? 'mic' : 'mic-off'}
          onPress={() => {
            const t = localStreamRef.current?.getAudioTracks()[0];
            if (!t) return;
            const next = !t.enabled;
            t.enabled = next;
            setMicOn(next);
            const s = socketRef.current;
            if (s?.connected)
              s.emit('mic_status', { session_id, user_id: myId, micOn: next });
          }}
        />
        <RoundBtn
          id="camera"
          activeBtn={activeBtn}
          setActiveBtn={setActiveBtn}
          icon={cameraOn ? 'videocam' : 'videocam-off'}
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
          onPress={() => {
            Alert.alert(
              'End Call?',
              'Are you sure you want to exit the call?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Exit',
                  style: 'destructive',
                  onPress: () => handleEndCallRef.current?.(),
                },
              ],
            );
          }}
        />
      </LinearGradient>

      <FaceDetectionOverlay
        faceStatus={faceStatus}
        faceCount={faceCount}
        visible={connectedUI}
      />
    </View>
  );
};

const RoundBtn = ({ id, icon, onPress, large, activeBtn, setActiveBtn }) => {
  const isActive = activeBtn === id;
  const isEnd = id === 'end';
  return (
    <TouchableOpacity
      onPress={() => {
        setActiveBtn(id);
        onPress?.();
      }}
      style={[
        styles.roundBtn,
        large && styles.endBtn,
        {
          backgroundColor: isEnd ? '#FF4D4F' : isActive ? PRIMARY : '#fff',
          borderWidth: isActive || isEnd ? 0 : 2,
          borderColor: PRIMARY,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={large ? 30 : 22}
        color={isEnd ? '#fff' : isActive ? '#fff' : PRIMARY}
      />
    </TouchableOpacity>
  );
};

export default VideocallScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bigVideo: { flex: 1 },

  hiddenCapture: {
    position: 'absolute',
    width: 320,
    height: 240,
    top: 0,
    left: -320,
    opacity: 0.01,
    zIndex: -1,
    overflow: 'hidden',
  },

  /* Face guide */
  userGuide: {
    position: 'absolute',
    top: '16%',
    width: 220,
    height: 300,
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
    gap: 7,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  faceHintText: { fontSize: 13, fontWeight: '600' },
  successBox: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,255,157,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 5,
  },
  successText: { color: '#00FF9D', fontWeight: '600', fontSize: 13 },

  /* Blur overlays */
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurBg: { position: 'absolute', width: '100%', height: '100%' },
  blurTint: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  blurMsgBox: { alignItems: 'center', gap: 10, paddingHorizontal: 32 },
  blurIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,77,79,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,77,79,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  blurMsgTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  blurMsgSub: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  avatarBox: { alignItems: 'center', gap: 14 },
  avatarImg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camOffPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  camOffText: { color: '#bbb', fontSize: 12, fontWeight: '500' },

  /* PiP */
  pip: {
    position: 'absolute',
    top: 70,
    right: 16,
    zIndex: 10,
    elevation: 10,
    borderRadius: 14,
    overflow: 'visible', // must be visible so mic badge isn't clipped
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  pipInner: {
    width: 108,
    height: 156,
    borderRadius: 14,
    overflow: 'hidden', // clip video content inside PiP
  },
  pipCameraOff: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  pipBlurBg: { position: 'absolute', width: '100%', height: '100%' },
  pipTint: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  myMicBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',

    justifyContent: 'center',
    alignItems: 'center',

    zIndex: 1000,
    elevation: 1000,
},
  pipAvatarBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pipAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  pipAvatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipCamOffPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pipCamOffText: { color: '#bbb', fontSize: 9, fontWeight: '500' },

  /* MY mic badge — screen level, position set dynamically via onLayout.
     No top/right here — injected inline from micBadgePos state. */
  myMicScreenBadge: {
    position: 'absolute',
    backgroundColor: '#FF4D4F',
    borderRadius: 12,
    padding: 5,
    zIndex: 999,
    elevation: 999,
  },

  /* OTHER user mic badge — inside bigVideo, bottom-left of remote feed */
  otherMicBadge: {
  position: 'absolute',
  top: 50,
  left: 14,
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: 'rgba(255,77,79,0.95)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 20,
  elevation: 20,
},

  otherBanner: {
    position: 'absolute',
    top: 44,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,77,79,0.88)',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 16,
    zIndex: 30,
  },
  otherBannerText: { color: '#fff', fontSize: 11, fontWeight: '600' },

  waiting: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitText: { color: '#fff', fontSize: 14 },
  waitingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  timerStack: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 6,
    zIndex: 20,
  },
  durationPill: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  durationText: { color: '#fff', fontSize: 13 },
  coinPill: {
    backgroundColor: 'rgba(130,0,230,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinPillLow: { backgroundColor: 'rgba(220,50,50,0.92)' },
  coinPillText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  warningBanner: {
    position: 'absolute',
    top: 128,
    left: 0,
    right: 0,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(220,50,50,0.93)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    zIndex: 99,
  },
  warningText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  bottomBar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    height: 84,
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  roundBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endBtn: { width: 64, height: 64, borderRadius: 32 },
});