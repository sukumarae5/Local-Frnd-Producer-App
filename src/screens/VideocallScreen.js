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
import { RTCView, mediaDevices } from 'react-native-webrtc';
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
    setIsRemoteLarge(prev => !prev);
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

  /* ---------------- INIT ---------------- */

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
      InCallManager.setSpeakerphoneOn(false);

      pcRef.current = createPC({
        onIceCandidate: candidate => {
          socket.emit('video_ice_candidate', { session_id, candidate });
        },

        onTrack: stream => {
          setRemoteStream(stream);
        },
      });

      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: 'user' },
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      stream.getTracks().forEach(t => {
        pcRef.current.addTrack(t, stream);
      });

      socket.emit('video_join', { session_id });

      socket.on('video_offer', onOffer);
      socket.on('video_answer', onAnswer);
      socket.on('video_ice_candidate', onIce);

      /* When other user ends call */

      socket.on('video_call_ended', () => {

  stopCallMedia();

  setTimeout(() => {
    setShowEndModal(true);
  }, 100);

});

      socket.on('video_connected', async () => {
        onConnected();

        if (role !== 'caller') return;

        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);

        socket.emit('video_offer', { session_id, offer });
      });
    };

    start();
  }, [connected]);

  /* ---------------- SIGNALING ---------------- */

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

    if (!pcRef.current.remoteDescription) {
      pendingIceRef.current.push(candidate);
      return;
    }

    try {
      await pcRef.current.addIceCandidate(candidate);
    } catch {}
  };

  /* ---------------- CONNECTED ---------------- */

  const onConnected = () => {
    if (timerRef.current) return;

    setConnectedUI(true);

    dispatch(callDetailsRequest());

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

  const unsubscribe = navigation.addListener('beforeRemove', (e) => {

    // 🚫 ALWAYS BLOCK navigation
    e.preventDefault();

    // Allow navigation only after confirm
    if (manualExitRef.current) {
      navigation.dispatch(e.data.action);
      return;
    }

    Alert.alert(
      "Exit from Call",
      "Are you sure you want to exit the call?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => {
            setShowEndModal(true); // ✅ ONLY show modal
          }
        }
      ]
    );

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
      {isRemoteLarge
        ? remoteStream && (
            <RTCView
              streamURL={remoteStream.toURL()}
              style={styles.remote}
              objectFit="cover"
              zOrder={0}
            />
          )
        : localStream && (
            <RTCView
              streamURL={localStream.toURL()}
              style={styles.remote}
              objectFit="cover"
              mirror
              zOrder={0}
            />
          )}

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={swapVideos}
        style={styles.smallContainer}
      >
        {isRemoteLarge
          ? localStream && (
              <RTCView
                streamURL={localStream.toURL()}
                style={styles.local}
                objectFit="cover"
                mirror
                zOrder={1}
              />
            )
          : remoteStream && (
              <RTCView
                streamURL={remoteStream.toURL()}
                style={styles.local}
                objectFit="cover"
                zOrder={1}
              />
            )}
      </TouchableOpacity>

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

        {/* END BUTTON */}

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

  // ❌ DO NOT end call yet
  setShowEndModal(true); // ✅ show rating modal

}}
        />
      </LinearGradient>

      {/* MODAL */}

      <EndCallConfirmModal
        visible={showEndModal}
        otherUser={other}
        onCancel={() => {
          setShowEndModal(false);
          
        }}
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

/* BUTTON */

const RoundBtn = ({ id, icon, onPress, large, activeBtn, setActiveBtn }) => {
  const isActive = activeBtn === id;

  return (
    <TouchableOpacity
      onPress={() => {
        setActiveBtn(id);
        onPress && onPress();
      }}
      style={[
        styles.roundBtn,
        large && styles.endBtn,
        { backgroundColor: isActive ? '#ff3b30' : '#fff' },
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