import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RTCView, mediaDevices, MediaStream } from 'react-native-webrtc';
import { CommonActions } from '@react-navigation/native';
import InCallManager from 'react-native-incall-manager';
import { useDispatch, useSelector } from 'react-redux';

import EndCallConfirmModal from '../screens/EndCallConfirmationScreen';

import { clearCall, callDetailsRequest } from '../features/calls/callAction';
import { submitRatingRequest } from '../features/rating/ratingAction';

import { SocketContext } from '../socket/SocketProvider';
import { createPC } from '../utils/webrtc';

const VideocallScreen = ({ route, navigation }) => {
  const { session_id, role } = route.params || {};
  const { socketRef, connected } = useContext(SocketContext);

  const dispatch = useDispatch();

  /* ---------------- REDUX ---------------- */

  const { userdata } = useSelector(state => state.user);
  const myGender = userdata?.user?.gender;

  const connectedCallDetails = useSelector(
    state => state?.calls?.connectedCallDetails,
  );

  const myId = useSelector(state => state.auth?.user?.user_id);

  const caller = connectedCallDetails?.caller;
  const connectedUser = connectedCallDetails?.connected_user;

  const other =
    String(caller?.user_id) === String(myId) ? connectedUser : caller;

  /* ---------------- STATE ---------------- */

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const [localURL, setLocalURL] = useState(null);
  const [remoteURL, setRemoteURL] = useState(null);

  const [connectedUI, setConnectedUI] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(false);

  const [activeBtn, setActiveBtn] = useState(null);
  const [isRemoteLarge, setIsRemoteLarge] = useState(true);

  const [showEndModal, setShowEndModal] = useState(false);

  /* ---------------- REFS ---------------- */

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingIceRef = useRef([]);
  const timerRef = useRef(null);
  const startedRef = useRef(false);
  const endedRef = useRef(false);
  const manualExitRef = useRef(false);
  /* ---------------- SWAP VIDEO ---------------- */

  const swapVideos = () => {
    // Prevent rapid re-render glitch
    requestAnimationFrame(() => {
      setIsRemoteLarge(prev => !prev);
    });
  };

  const flipCamera = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];

    if (!videoTrack) return;

    videoTrack._switchCamera(); // 🔥 React Native WebRTC magic
  };
  /* ---------------- PERMISSION ---------------- */

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

  // if (!connectedCallDetails) {
  //   console.log('⏳ Waiting for call details...');
  //   return;
  // }

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    if (!connected || !socketRef.current || startedRef.current) return;

    startedRef.current = true;

    const socket = socketRef.current;

    const start = async () => {
      try {
        /* ================= PERMISSION ================= */
        const ok = await requestPermission();
        if (!ok) {
          navigation.goBack();
          return;
        }

        /* ================= INIT ================= */
        setRemoteStream(null);

      // 🔥 ANDROID AUDIO MODE (ADD FIRST)


InCallManager.start({ media: 'video' });

// 🔥 FULL AUDIO CONFIG
InCallManager.setForceSpeakerphoneOn(true);
InCallManager.setSpeakerphoneOn(true);
InCallManager.setMicrophoneMute(false);
        /* ================= CREATE PC ================= */
        pcRef.current = createPC({
          onIceCandidate: candidate => {
            socket.emit('video_ice_candidate', { session_id, candidate });
          },

          onTrack: stream => {
            console.log('✅ REMOTE STREAM RECEIVED');

            if (stream) {
              setRemoteStream(stream);
              setRemoteURL(stream.toURL());
            }
          },
        });

        /* ================= GET LOCAL MEDIA ================= */
        const stream = await mediaDevices.getUserMedia({
          // 
          audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
          video: {
            facingMode: 'user',
            width: 640,
            height: 480,
            frameRate: 30,
          },
        });

        console.log(
          '🎥 LOCAL TRACKS:',
          stream.getTracks().map(t => t.kind),
        );

        localStreamRef.current = stream;
        setLocalStream(stream);
        setLocalURL(stream.toURL());
        /* ================= ADD TRACKS BEFORE JOIN ================= */
        stream.getTracks().forEach(track => {
          track.enabled = true; // 🔥 IMPORTANT
          pcRef.current.addTrack(track, stream);
        });

        console.log('✅ ALL TRACKS ADDED');

        /* ================= SOCKET EVENTS ================= */

        socket.on('video_offer', onOffer);
        socket.on('video_answer', onAnswer);
        socket.on('video_ice_candidate', onIce);

        socket.on('video_call_ended', () => {
          stopCallMedia();

          setTimeout(() => {
            setShowEndModal(true);
          }, 100);
        });

        socket.on('video_connected', async () => {
          console.log('🚀 video_connected');

          onConnected();

          if (!pcRef.current) {
            console.log('❌ PC not ready');
            return;
          }
          // 🛑 SAFETY CHECK (CRITICAL)
          if (!caller || !caller.user_id) {
            console.log('⛔ Caller not ready → skipping');
            return;
          }

          if (!myId) {
            console.log('⛔ My ID not ready → skipping');
            return;
          }

          const isCaller = String(myId) === String(caller.user_id);

          console.log('👤 My ID:', myId);
          console.log('📞 Caller ID:', caller.user_id);
          console.log('🎯 Am I caller?', isCaller);

          if (!isCaller) {
            console.log('🙋 I am receiver');
            return;
          }

          console.log('📞 I am caller → creating offer');

          setTimeout(async () => {
            try {
              const offer = await pcRef.current.createOffer();
              await pcRef.current.setLocalDescription(offer);

              console.log('📤 SENDING OFFER');

              socket.emit('video_offer', { session_id, offer });
            } catch (err) {
              console.log('❌ OFFER ERROR:', err);
            }
          }, 500);
        });

        socket.emit('video_join', { session_id });
      } catch (err) {
        console.log('❌ START ERROR:', err);
      }
    };

    start();

    return () => {
      console.log('🧹 CLEANUP');

      socket.off('video_offer', onOffer);
      socket.off('video_answer', onAnswer);
      socket.off('video_ice_candidate', onIce);
      socket.off('video_connected');
      socket.off('video_call_ended');

      stopCallMedia();
    };
  }, [connected]); /* ---------------- SIGNALING ---------------- */

  const flushIce = async () => {
    if (!pcRef.current) return;

    for (const c of pendingIceRef.current) {
      try {
        await pcRef.current.addIceCandidate(c);
      } catch {}
    }

    pendingIceRef.current = [];
  };

  const onOffer = async ({ offer }) => {
    await pcRef.current.setRemoteDescription(offer);
    await flushIce();

    const answer = await pcRef.current.createAnswer();
    console.log('📄 ANSWER SDP:', answer.sdp);
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
      if (pcRef.current.remoteDescription) {
        await pcRef.current.addIceCandidate(candidate);
      } else {
        pendingIceRef.current.push(candidate);
      }
    } catch (e) {
      console.log('ICE ERROR', e);
    }
  };

  /* ---------------- CONNECTED ---------------- */

  const onConnected = () => {
    if (timerRef.current) return;

    setConnectedUI(true);

    // dispatch(callDetailsRequest());

    timerRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  };

  /* ---------------- STOP CALL ---------------- */

  const stopCallMedia = () => {
    if (endedRef.current) return;

    endedRef.current = true;

    clearInterval(timerRef.current);

    InCallManager.stop();

    localStreamRef.current?.getTracks().forEach(t => t.stop());

    pcRef.current?.close();
  };

  /* ---------------- LEAVE SCREEN ---------------- */

  const leaveScreen = () => {
    dispatch(clearCall());

    const nextScreen =
      myGender === 'Male' ? 'MaleHomeTabs' : 'ReceiverBottomTabs';

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: nextScreen }],
      }),
    );
  };

  /* ---------------- EXIT CONFIRM ---------------- */

  /* ---------------- EXIT CONFIRM ---------------- */

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      // 🚫 ALWAYS BLOCK navigation
      e.preventDefault();

      // Allow navigation only after confirm
      if (manualExitRef.current) {
        navigation.dispatch(e.data.action);
        return;
      }

      Alert.alert('Exit from Call', 'Are you sure you want to exit the call?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            setShowEndModal(true); // ✅ ONLY show modal
          },
        },
      ]);
    });

    return unsubscribe;
  }, [navigation]);

  /* ---------------- AUTO CLEANUP ---------------- */

  useEffect(() => {
    return () => {
      if (!endedRef.current) {
        socketRef.current?.emit('video_call_hangup', { session_id });

        stopCallMedia();
      }
    };
  }, []);
  /* ---------------- UI ---------------- */

  return (
    <View style={styles.container}>

     {!connectedCallDetails ? (
      <View style={styles.waiting}>
        <Text style={{ color: "white" }}>Loading call...</Text>
      </View>
    ) : !localURL ? (
      <View style={styles.waiting}>
        <Text style={{ color: "white" }}>Starting camera...</Text>
      </View>
    ) : !remoteURL ? (
      <>
        {/* SHOW LOCAL VIDEO WHILE WAITING */}
        <RTCView
          key="bigVideo"
          streamURL={localURL}
          style={styles.bigVideo}
          objectFit="cover"
          mirror
        />
        <View style={styles.waitingOverlay}>
          <Text style={{ color: "white" }}>Waiting for user...</Text>
        </View>
      </>
    ) : (
      <>
        {/* 🔥 BOTH VIDEOS */}
        <RTCView
          key="bigVideo"
          streamURL={isRemoteLarge ? remoteURL : localURL}
          style={styles.bigVideo}
          objectFit="cover"
          mirror={!isRemoteLarge}
        />

        <TouchableOpacity
          style={styles.smallVideoContainer}
          onPress={() => setIsRemoteLarge(prev => !prev)}
        >
          <RTCView
            key="smallVideo"
            streamURL={isRemoteLarge ? localURL : remoteURL}
            style={styles.smallVideo}
            objectFit="cover"
            mirror={isRemoteLarge}
          />
        </TouchableOpacity>
      </>
    )}

      {/* TIMER */}
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

      {/* CONTROLS */}
      <LinearGradient colors={['#1b1b1b', '#101010']} style={styles.bottomBar}>
        <RoundBtn
          id="speaker"
          activeBtn={activeBtn}
          setActiveBtn={setActiveBtn}
          icon={speakerOn ? 'volume-high' : 'volume-mute'}
          onPress={() => {
            setSpeakerOn(prev => {
              InCallManager.setSpeakerphoneOn(!prev);
              return !prev;
            });
          }}
        />

        <RoundBtn
          id="mic"
          activeBtn={activeBtn}
          setActiveBtn={setActiveBtn}
          icon={micOn ? 'mic' : 'mic-off'}
          onPress={() => {
            const track = localStreamRef.current?.getAudioTracks()[0];
            if (!track) return;

            track.enabled = !track.enabled;
            setMicOn(track.enabled);
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
            const track = localStreamRef.current?.getVideoTracks()[0];
            if (!track) return;

            track.enabled = !track.enabled;
            setCameraOn(track.enabled);
          }}
        />

        <RoundBtn
          id="end"
          activeBtn={activeBtn}
          setActiveBtn={setActiveBtn}
          icon="call"
          large
          onPress={() => {
            if (!connectedUI) {
              stopCallMedia();
              leaveScreen();
              return;
            }

            manualExitRef.current = true;
            setShowEndModal(true);
          }}
        />
      </LinearGradient>

      {/* MODAL */}
      <EndCallConfirmModal
        visible={showEndModal}
        otherUser={other}
        onCancel={() => setShowEndModal(false)}
        onConfirm={rating => {
          setShowEndModal(false);

          dispatch(
            submitRatingRequest({
              session_id,
              rated_user_id: other?.user_id,
              rating,
              duration: seconds,
            }),
          );

          manualExitRef.current = true;

          socketRef.current?.emit('video_call_hangup', { session_id });

          stopCallMedia();
          leaveScreen();
        }}
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
        onPress && onPress();
      }}
      style={[
        styles.roundBtn,
        large && styles.endBtn,
        {
          backgroundColor: isEnd ? '#ff3b30' : isActive ? '#ff3b30' : '#fff',
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={large ? 30 : 22}
        color={isActive ? '#fff' : '#9b2a91'}
      />
    </TouchableOpacity>
  );
};

export default VideocallScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  remote: { flex: 1 },

  smallContainer: {
    position: 'absolute',
    top: 70,
    right: 16,
    zIndex: 10,
    elevation: 10,
  },
  bigVideo: {
    flex: 1,
  },

  smallVideoContainer: {
    position: 'absolute',
    top: 70,
    right: 16,
    zIndex: 10,
    elevation: 10,
  },

  smallVideo: {
    width: 110,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
  },

  waiting: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.3)",
},
  local: {
    width: 110,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
  },

  timerPill: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  timerText: { color: '#fff' },

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

  endBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});
