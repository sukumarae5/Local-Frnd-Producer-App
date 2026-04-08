import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Animated,
  Image,
  Alert,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mediaDevices, MediaStream } from 'react-native-webrtc';
import { CommonActions } from '@react-navigation/native';
import InCallManager from 'react-native-incall-manager';

import { useDispatch, useSelector } from 'react-redux';
import { clearCall, callDetailsRequest } from '../features/calls/callAction';
import { otherUserFetchRequest } from '../features/Otherusers/otherUserActions';
import { submitRatingRequest } from '../features/rating/ratingAction';

import EndCallConfirmModal from '../screens/EndCallConfirmationScreen';
import { SocketContext } from '../socket/SocketProvider';
import { createPC } from '../utils/webrtc';

const AudiocallScreen = ({ route, navigation }) => {
  const { session_id, role } = route.params;
  const { socketRef, connected } = useContext(SocketContext);

  const dispatch = useDispatch();

  const connectedCallDetails = useSelector(
    state => state?.calls?.connectedCallDetails,
  );
  const { userdata } = useSelector(state => state.user);

  const myGender = userdata?.user?.gender;
  const myId = userdata?.user?.user_id;

  const caller = connectedCallDetails?.caller;
  const connectedUser = connectedCallDetails?.connected_user;

  const me = String(caller?.user_id) === String(myId) ? caller : connectedUser;

  const other =
    String(caller?.user_id) === String(myId) ? connectedUser : caller;

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingIceRef = useRef([]);
  const manualExitRef = useRef(false);
  const startedRef = useRef(false);
  const endedRef = useRef(false);
  const timerRef = useRef(null);
  const micAnim = useRef(new Animated.Value(1)).current;

  const [connectedUI, setConnectedUI] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [iceState, setIceState] = useState('new');
const [remoteStream, setRemoteStream] = useState(null);
  const [showEndModal, setShowEndModal] = useState(false);

  /* ================= PERMISSION ================= */

  const requestPermission = async () => {
    if (Platform.OS !== 'android') return true;

    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );

    return res === PermissionsAndroid.RESULTS.GRANTED;
  };

  /* ================= INIT ================= */
useEffect(() => {
  console.log("🔥 ICE STATE UI:", iceState);
}, [iceState]);
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

  // ✅ START AUDIO ENGINE
InCallManager.start({ media: 'video' });

  InCallManager.setMicrophoneMute(false);
  InCallManager.setForceSpeakerphoneOn(true);
  InCallManager.setSpeakerphoneOn(true);

  // ✅ CREATE PEER CONNECTION
  pcRef.current = createPC({
    onIceCandidate: (candidate) => {
      console.log("📤 Sending ICE:", candidate);
      socket.emit('audio_ice_candidate', { session_id, candidate });
    },

    onIceState: setIceState,
onTrack: (stream) => {
  console.log("🔥 REMOTE STREAM RECEIVED");

  setRemoteStream(stream);
}
  });

  // ✅ GET LOCAL AUDIO
  const stream = await mediaDevices.getUserMedia({
     audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
    video: false,
  });
console.log(
  "🎤 LOCAL AUDIO:",
  stream.getAudioTracks().map(t => ({
    enabled: t.enabled,
    readyState: t.readyState,
  }))
);
  stream.getAudioTracks().forEach(track => {
    console.log("🎧 REMOTE AUDIO TRACK:", track.enabled);
    track.enabled = true;
  });

  localStreamRef.current = stream;

  // ✅ ADD TRACKS
  stream.getTracks().forEach(track => {
    pcRef.current.addTrack(track, stream);
  });

  // ✅ JOIN ROOM
  socket.emit('audio_join', { session_id });

  // ✅ SOCKET EVENTS
  socket.on('audio_offer', onOffer);
  socket.on('audio_answer', onAnswer);
  socket.on('audio_ice_candidate', onIce);

  socket.on('audio_connected', async () => {
    console.log("🚀 audio_connected");

    onConnected();

    if (pcRef.current.signalingState === "stable") {
      const offer = await pcRef.current.createOffer({
        offerToReceiveAudio: true,
      });

      await pcRef.current.setLocalDescription(offer);

      console.log("📤 Sending OFFER");

      socket.emit('audio_offer', { session_id, offer });
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

  /* ================= SIGNALING ================= */
useEffect(() => {
  if (!remoteStream) return;

  console.log("🔊 PLAYING REMOTE AUDIO");

  // 🔥 THIS LINE FIXES AUDIO
  const audioTrack = remoteStream.getAudioTracks()[0];

  if (audioTrack) {
    audioTrack.enabled = true;
  }
}, [remoteStream]);



  const flushIce = async () => {
    if (!pcRef.current || endedRef.current) return;

    for (const c of pendingIceRef.current) {
      try {
        await pcRef.current.addIceCandidate(c);
      } catch {}
    }

    pendingIceRef.current = [];
  };

const onOffer = async ({ offer }) => {
  console.log("📥 Received OFFER");

  await pcRef.current.setRemoteDescription(offer);

  await flushIce();

  const answer = await pcRef.current.createAnswer();

  await pcRef.current.setLocalDescription(answer);

  console.log("📤 Sending ANSWER");

  socketRef.current.emit('audio_answer', { session_id, answer });

  onConnected();
};

  const onAnswer = async ({ answer }) => {
    console.log("📥 Received ANSWER");
    if (!pcRef.current || endedRef.current) return;

    await pcRef.current.setRemoteDescription(answer);
    await flushIce();

    onConnected();
  };

 const onIce = async ({ candidate }) => {
  console.log("📥 Received ICE:", candidate);

  if (!candidate || !pcRef.current || endedRef.current) return;

  if (!pcRef.current.remoteDescription) {
    pendingIceRef.current.push(candidate);
    return;
  }

  try {
    await pcRef.current.addIceCandidate(candidate);
  } catch (e) {
    console.log("ICE ERROR:", e);
  }
};
  /* ================= CONNECTED ================= */

const onConnected = () => {
  if (timerRef.current) return;

  setConnectedUI(true);

  setTimeout(() => {
  console.log("🔊 AUDIO FIX AFTER CONNECT");

  InCallManager.setMicrophoneMute(false);
  InCallManager.setForceSpeakerphoneOn(true);
  InCallManager.setSpeakerphoneOn(true);
}, 500);
setSpeakerOn(true); // 🔥 IMPORTANT

  dispatch(callDetailsRequest());

  timerRef.current = setInterval(() => {
    setSeconds(s => s + 1);
  }, 1000);
};

  /* ================= CONTROLS ================= */

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  };

const toggleSpeaker = () => {
  const newVal = !speakerOn;
 console.log("🔊 Speaker:", newVal ? "ON" : "OFF");

  setSpeakerOn(newVal);



  InCallManager.setForceSpeakerphoneOn(newVal);
  InCallManager.setSpeakerphoneOn(newVal);
};

  /* ================= STOP CALL ================= */

  const stopCallMedia = () => {
    if (endedRef.current) return;

    endedRef.current = true;

    clearInterval(timerRef.current);

    // InCallManager.stop();

    localStreamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
  };

  /* ================= LEAVE SCREEN ================= */

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

  /* ================= EXIT CONFIRM ================= */

useEffect(() => {
  const unsubscribe = navigation.addListener('beforeRemove', (e) => {

    // 🚫 ALWAYS BLOCK navigation
    e.preventDefault();

    // If already exiting (after confirm) → allow navigation
    if (manualExitRef.current) {
      navigation.dispatch(e.data.action);
      return;
    }

    // Show exit popup EVERY time back is pressed
    Alert.alert(
      "Exit from Call",
      "Are you sure you want to exit the call?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            // ❌ do nothing → stay in call
          }
        },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => {

            // ❌ DO NOT navigate
            // ❌ DO NOT end call yet

            setShowEndModal(true); // ✅ show rating modal
          }
        }
      ]
    );
  });

  return unsubscribe;
}, [navigation]);
  /* ================= AUTO CLEANUP ================= */

  useEffect(() => {
    return () => {
      if (!endedRef.current && !manualExitRef.current) {
        socketRef.current?.emit('audio_call_hangup', { session_id });
        stopCallMedia();
      }
    };
  }, []);

  /* ================= UI ================= */

  return (
    <LinearGradient
      colors={['#E9C9FF', '#F4C9F2', '#FFD1E8']}
      style={styles.container}
    >
      <View style={styles.timePill}>
        <Text style={styles.timeText}>
          {connectedUI
            ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(
                2,
                '0',
              )}`
            : 'Connecting…'}
        </Text>
      </View>

      {connectedCallDetails?.connected && me && other && (
        <View style={styles.usersRow}>
          <View style={styles.userCard}>
            <Image source={{ uri: me.avatar }} style={styles.avatar} />
            <Text style={styles.userName}>{me.name}</Text>
          </View>

          <TouchableOpacity
            style={styles.userCard}
            onPress={() => {
              dispatch(otherUserFetchRequest(other.user_id));
              navigation.navigate('AboutScreen');
            }}
          >
            <Image source={{ uri: other.avatar }} style={styles.avatar} />
            <Text style={styles.userName}>{other.name}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
  style={[
    styles.circleBtn,
    speakerOn && { backgroundColor: "#E8F5E9" }
  ]}
  onPress={toggleSpeaker}
>
        {/* <TouchableOpacity style={styles.circleBtn} onPress={toggleSpeaker}> */}
         {/* // <Ionicons name="volume-high" size={22} color="#9b4dff" /> */}
       
       <Ionicons
  name={speakerOn ? "volume-high" : "volume-mute"}
  size={24}
  color={speakerOn ? "#4CAF50" : "#999"} // green when ON
/>
        </TouchableOpacity>

        <TouchableOpacity style={styles.circleBtn} onPress={toggleMic}>
          <Ionicons
            name={micOn ? 'mic' : 'mic-off'}
            size={22}
            color="#9b4dff"
          />
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.endBtn}
          onPress={() => {

            socketRef.current?.emit('audio_call_hangup', { session_id });

            stopCallMedia();
            leaveScreen();

          }}
        > */}

        <TouchableOpacity
          style={styles.endBtn}
          onPress={() => {
            manualExitRef.current = true;

            // ❌ DO NOT end call yet
            // ❌ DO NOT leave screen

            setShowEndModal(true); // ✅ show rating modal first
          }}
        >
          <Ionicons name="call" size={22} color="#8f0a0a" />
        </TouchableOpacity>
      </View>

      <EndCallConfirmModal
        visible={showEndModal}
        otherUser={other}
        onCancel={() => setShowEndModal(false)}
        onConfirm={rating => {
          dispatch(
            submitRatingRequest({
              session_id,
              rater_id: myId,
              rated_user_id: other?.user_id,
              rating,
            }),
          );
          manualExitRef.current = true;
          socketRef.current?.emit('audio_call_hangup', { session_id });

          stopCallMedia();

          leaveScreen();
        }}
      />
    </LinearGradient>
  );
};

export default AudiocallScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
  },

  topheats: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    zIndex: 10,
  },

  leftheart: { marginTop: 500, left: -110 },
  leftheart1: { marginTop: 150, left: -40 },
  rightheart: { marginTop: 460, left: 40 },

  timePill: {
    backgroundColor: '#fb6b7c',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },

  timeText: {
    color: '#fff',
    fontWeight: '600',
  },

  usersRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '92%',
    transform: [{ translateY: -200 }],
  },

  userCard: {
    width: '45%',
    alignItems: 'center',
  },

  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#c77dff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#ddd',
  },

  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  subText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },

  desc: {
    fontSize: 12,
    textAlign: 'center',
    color: '#444',
  },

  controls: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    gap: 25,
  },

  circleBtn: {
    backgroundColor: '#fff',
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },

  endBtn: {
    backgroundColor: '#f0ebf7',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },

  debug: {
    position: 'absolute',
    bottom: 10,
    fontSize: 11,
    color: '#555',
  },
});