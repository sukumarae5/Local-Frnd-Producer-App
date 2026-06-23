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

  // ✅ Same as AudiocallScreen — get callType from route params
  const callType = route?.params?.call_type || 'VIDEO';

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
  const [isRemoteLarge, setIsRemoteLarge] = useState(true);
  const [otherFaceGone, setOtherFaceGone] = useState(false);
  const [otherCameraOff, setOtherCameraOff] = useState(false);

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

  // ✅ Same refs as AudiocallScreen
  const manualExitRef = useRef(false);
  const forceExitRef = useRef(false);
  const remoteEndedRef = useRef(false);
  const disableExitRef = useRef(false);
  const isExitingRef = useRef(false);
  const otherRef = useRef(null);

  connectedUIRef.current = connectedUI;
  cameraOnRef.current = cameraOn;

  // ✅ Same as AudiocallScreen — keep otherRef always current
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

  const myFaceGone = faceStatus === 'no_face';
  const isFaceCentered = faceStatus === 'single_face' && faceCount === 1;

  /* ── Camera toggle notify ── */
  useEffect(() => {
    if (!connectedUI) return;
    socketRef.current?.emit('camera_status', {
      session_id,
      user_id: myId,
      camera_on: cameraOn,
    });
  }, [cameraOn, connectedUI]);

  /* ── Listen: other user face + camera ── */
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

  /* ── Call details ── */
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

  /* ── WebRTC ── */
  useEffect(() => {
    if (!connected || !socketRef.current || startedRef.current) return;
    startedRef.current = true;
    const socket = socketRef.current;

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

        socket.on('video_offer', onOffer);
        socket.on('video_answer', onAnswer);
        socket.on('video_ice_candidate', onIce);

        // ✅ Same as AudiocallScreen call_ended handler
        socket.on('call_ended', data => {
          const endedBy = data?.endedBy;

          // Only handle if OTHER user ended it
          if (String(endedBy) === String(myId)) return;

          const currentOther = otherRef.current;
          const otherName = currentOther?.name || 'User';

          showToast(`${otherName} ended the call`);

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
                  {
                    name:
                      myGender === 'Male'
                        ? 'MaleHomeTabs'
                        : 'ReceiverBottomTabs',
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
          }, 800);
        });

        // ============ ADD inside start() after call_ended handler ============
        // ✅ Handle video_call_ended too — some servers emit this for video calls
        socket.on('video_call_ended', data => {
          const endedBy = data?.endedBy;

          if (String(endedBy) === String(myId)) return;

          const currentOther = otherRef.current;
          const otherName = currentOther?.name || 'User';

          showToast(`${otherName} ended the call`);

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
                  {
                    name:
                      myGender === 'Male'
                        ? 'MaleHomeTabs'
                        : 'ReceiverBottomTabs',
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
          }, 800);
        });

        socket.on('video_connected', async () => {
          onConnected();
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
      socket.off('video_offer', onOffer);
      socket.off('video_answer', onAnswer);
      socket.off('video_ice_candidate', onIce);
      socket.off('video_connected');
      socket.off('call_ended'); // ✅ matches what we registered
      socket.off('video_call_ended'); // ✅ also clean this up
    };
  }, [connected]);

  const flushIce = async () => {
    for (const c of pendingIceRef.current) {
      try {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(c));
      } catch {}
    }
    pendingIceRef.current = [];
  };

  const onOffer = async ({ offer }) => {
    await pcRef.current.setRemoteDescription(offer);
    await flushIce();
    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);
    socketRef.current.emit('video_answer', { session_id, answer });
    onConnected();
  };

  const onAnswer = async ({ answer }) => {
    await pcRef.current.setRemoteDescription(answer);
    await flushIce();
    onConnected();
  };

  const onIce = async ({ candidate }) => {
    if (!pcRef.current) return;
    try {
      if (pcRef.current.remoteDescription)
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      else pendingIceRef.current.push(candidate);
    } catch {}
  };

  const onConnected = () => {
    if (timerRef.current) return;
    connectedRef.current = connectedUIRef.current = true;
    setConnectedUI(true);
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    setSpeakerOn(true);
    InCallManager.setForceSpeakerphoneOn(true);
    InCallManager.setSpeakerphoneOn(true);
  };

  const stopCallMedia = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    clearInterval(timerRef.current);
    InCallManager.stop();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
  };

  // ✅ Exact same as AudiocallScreen handleEndCall
  // ============ REPLACE handleEndCall in VideocallScreen ============

  const handleEndCall = () => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    manualExitRef.current = true;

    const currentOther = otherRef.current;

    // ✅ Emit BOTH events — covers both server implementations
    socketRef.current?.emit('call_end', {
      session_id,
      user_id: myId,
    });
    socketRef.current?.emit('video_call_hangup', {
      session_id,
      user_id: myId,
    });

    stopCallMedia();
    callManager.reset();
    dispatch(clearCall());

    showToast('You ended the call');

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

  // ✅ Exact same as AudiocallScreen beforeRemove
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', e => {
      if (forceExitRef.current) {
        navigation.dispatch(e.data.action);
        return;
      }
      if (remoteEndedRef.current || disableExitRef.current) {
        navigation.dispatch(e.data.action);
        return;
      }
      if (manualExitRef.current) {
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
    return unsub;
  }, [navigation]);

  // ============ REPLACE auto cleanup useEffect in VideocallScreen ============

  useEffect(() => {
    return () => {
      if (startedRef.current && !endedRef.current && !manualExitRef.current) {
        console.log('🧹 Video auto cleanup');
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
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handle = ({ user_id, micOn: mOn }) => {
      if (String(user_id) !== String(myId)) setOtherMicOn(mOn);
    };
    socket.on('mic_status_update', handle);
    return () => socket.off('mic_status_update', handle);
  }, []);

  const flipCamera = () =>
    localStreamRef.current?.getVideoTracks()[0]?._switchCamera();

  const showOtherBlur = !myFaceGone && otherFaceGone && !otherCameraOff;
  const showOtherAvatar = !myFaceGone && otherCameraOff;

  return (
    <View style={styles.container}>
      {localURL && connectedUI && (
        <View
          ref={captureViewRef}
          collapsable={false}
          renderToHardwareTextureAndroid
          style={styles.hiddenCapture}
        >
          <RTCView
            streamURL={localURL}
            style={StyleSheet.absoluteFill}
            objectFit="cover"
            mirror
            zOrder={0}
          />
        </View>
      )}

      {!otherMicOn && (
        <View style={styles.micRight}>
          <Ionicons name="mic-off" size={15} color="#fff" />
        </View>
      )}
      {!micOn && (
        <View style={styles.micLeft}>
          <Ionicons name="mic-off" size={15} color="#fff" />
        </View>
      )}

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
          <View style={styles.bigVideo}>
            {myFaceGone ? (
              <>
                <RTCView
                  streamURL={localURL}
                  style={StyleSheet.absoluteFill}
                  objectFit="cover"
                  mirror
                  zOrder={0}
                />
                <View style={styles.userGuide}>
                  <Svg height="100%" width="100%" viewBox="0 0 220 300">
                    <Circle
                      cx="110"
                      cy="120"
                      r="3"
                      fill={isFaceCentered ? '#00FF9D' : '#FF4D4F'}
                    />
                    <Path
                      d="M110 40 C145 40, 170 75, 170 110 C170 150, 145 180, 110 185 C75 180, 50 150, 50 110 C50 75, 75 40, 110 40 Z"
                      stroke={isFaceCentered ? '#00FF9D' : '#FF4D4F'}
                      strokeWidth="3"
                      strokeDasharray="10,6"
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      fill="none"
                    />
                    <Path
                      d="M40 250 Q110 190 180 250"
                      stroke={isFaceCentered ? '#00FF9D' : '#FF4D4F'}
                      strokeWidth="3"
                      strokeDasharray="10,6"
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </Svg>
                </View>
                <View style={styles.faceHintBox}>
                  <Ionicons name="scan-outline" size={16} color="#FF4D4F" />
                  <Text style={styles.faceHintText}>
                    {isFaceCentered
                      ? 'Perfect 👍 Hold steady'
                      : faceCount > 1
                      ? 'Only one face allowed'
                      : 'Look at the camera'}
                  </Text>
                </View>
              </>
            ) : (
              <>
                {isFaceCentered && (
                  <View style={styles.successBox}>
                    <Text style={styles.successText}>Perfect 👍</Text>
                  </View>
                )}
                <RTCView
                  streamURL={remoteURL}
                  style={StyleSheet.absoluteFill}
                  objectFit="cover"
                  zOrder={0}
                />
                {showOtherBlur && (
                  <View style={styles.blurOverlay}>
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
                {showOtherAvatar && (
                  <View style={styles.blurOverlay}>
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

          {!myFaceGone && (
            <TouchableOpacity
              style={styles.pip}
              onPress={() => setIsRemoteLarge(p => !p)}
              activeOpacity={0.9}
            >
              <View style={styles.pipInner}>
                <RTCView
                  streamURL={localURL}
                  style={StyleSheet.absoluteFill}
                  objectFit="cover"
                  mirror
                  zOrder={2}
                />
                {!cameraOn && (
                  <View style={styles.pipBlur}>
                    {userdata?.user?.avatar ? (
                      <Image
                        source={{ uri: userdata.user.avatar }}
                        style={styles.pipBlurBg}
                        blurRadius={12}
                      />
                    ) : (
                      <View
                        style={[
                          styles.pipBlurBg,
                          { backgroundColor: '#1a1a1a' },
                        ]}
                      />
                    )}
                    <View style={styles.pipTint} />
                    <View style={styles.pipAvatarBox}>
                      {userdata?.user?.avatar ? (
                        <Image
                          source={{ uri: userdata.user.avatar }}
                          style={styles.pipAvatar}
                        />
                      ) : (
                        <Ionicons name="person" size={26} color="#666" />
                      )}
                      <Ionicons
                        name="videocam-off"
                        size={11}
                        color="#888"
                        style={{ marginTop: 4 }}
                      />
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        </>
      )}

      {showOtherBlur && connectedUI && (
        <View style={styles.otherBanner}>
          <Ionicons name="eye-off-outline" size={12} color="#fff" />
          <Text style={styles.otherBannerText}>
            Other user's face not visible
          </Text>
        </View>
      )}

      <View style={styles.timerPill}>
        <Text style={styles.timerText}>
          {connectedUI
            ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(
                2,
                '0',
              )}`
            : 'Connecting…'}
        </Text>
      </View>

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
          id="flip"
          activeBtn={activeBtn}
          setActiveBtn={setActiveBtn}
          icon="camera-reverse"
          onPress={flipCamera}
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
        {/* ✅ Same as AudiocallScreen end button — Alert then handleEndCall */}
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
                { text: 'Exit', style: 'destructive', onPress: handleEndCall },
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
    width: 120,
    height: 160,
    top: -200,
    left: 0,
    opacity: 0,
    zIndex: -1,
  },
  faceOval: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    right: '10%',
    bottom: '20%',
    borderWidth: 2,
    borderColor: 'rgba(255,77,79,0.8)',
    borderStyle: 'dashed',
    borderRadius: 300,
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
  faceHintText: { color: '#FF4D4F', fontSize: 13, fontWeight: '600' },
  userGuide: {
    position: 'absolute',
    top: '16%',
    width: 220,
    height: 300,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00FF9D',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
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
  pip: {
    position: 'absolute',
    top: 70,
    right: 16,
    zIndex: 10,
    elevation: 10,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  pipInner: { width: 108, height: 156 },
  pipBlur: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  pipBlurBg: { position: 'absolute', width: '100%', height: '100%' },
  pipTint: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pipAvatarBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  pipAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
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
  timerPill: {
    position: 'absolute',
    top: 44,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: { color: '#fff', fontSize: 13 },
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
  micRight: {
    position: 'absolute',
    top: 90,
    right: 18,
    backgroundColor: '#FF4D4F',
    padding: 5,
    borderRadius: 18,
    zIndex: 20,
  },
  micLeft: {
    position: 'absolute',
    top: 90,
    left: 18,
    backgroundColor: '#FF4D4F',
    padding: 5,
    borderRadius: 18,
    zIndex: 20,
  },
  successBox: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,255,157,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  successText: { color: '#00FF9D', fontWeight: '600', fontSize: 13 },
});
