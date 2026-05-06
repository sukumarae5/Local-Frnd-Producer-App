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
  Easing,
} from 'react-native';
import { RTCIceCandidate, RTCView } from 'react-native-webrtc';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { mediaDevices, MediaStream } from 'react-native-webrtc';
import { CommonActions } from '@react-navigation/native';
import InCallManager from 'react-native-incall-manager';
import MaskedView from '@react-native-masked-view/masked-view';
import { useDispatch, useSelector } from 'react-redux';
import { clearCall, callDetailsRequest } from '../features/calls/callAction';
import { otherUserFetchRequest } from '../features/Otherusers/otherUserActions';
import { submitRatingRequest } from '../features/rating/ratingAction';
import store from '../reduxStore/store'; // adjust path
import EndCallConfirmModal from '../screens/EndCallConfirmationScreen';
import { SocketContext } from '../socket/SocketProvider';
import { createPC } from '../utils/webrtc';
import callManager from '../utils/callManager';
const PRIMARY = '#A020F0'; // your purple

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
  const call = useSelector(state => state.calls.call);
  const caller = connectedCallDetails?.caller;
  const connectedUser = connectedCallDetails?.connected_user;

  const me = String(caller?.user_id) === String(myId) ? caller : connectedUser;

  const other =
    String(caller?.user_id) === String(myId) ? connectedUser : caller;
  console.log(other);
  console.log(me);
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
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;

  const [connectedUI, setConnectedUI] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [otherMicOn, setOtherMicOn] = useState(true);
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

  useEffect(() => {
    const animate = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    animate(ripple1, 0);
    animate(ripple2, 800);
  }, []);

  useEffect(() => {
    if (session_id) {
      console.log('📡 Fetching call details early');
      dispatch(callDetailsRequest());
    }
  }, [session_id]);

  /* ================= INIT ================= */
  useEffect(() => {
    console.log('🔥 ICE STATE UI:', iceState);
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
      InCallManager.start({ media: 'audio' });

      InCallManager.setForceSpeakerphoneOn(true);
      InCallManager.setSpeakerphoneOn(true);
      InCallManager.setMicrophoneMute(false);

      pcRef.current = createPC({
        onIceCandidate: candidate => {
          console.log('📤 Sending ICE:', candidate);
          socket.emit('audio_ice_candidate', { session_id, candidate });
        },

        onIceState: setIceState,
        onTrack: stream => {
          console.log('✅ REMOTE STREAM RECEIVED');

          const audioTrack = stream.getAudioTracks()[0];

          if (audioTrack) {
            audioTrack.enabled = true;
            console.log('🔊 AUDIO TRACK ENABLED');
          }

          setRemoteStream(stream);

          setTimeout(() => {
            InCallManager.stop(); // reset
            InCallManager.start({ media: 'audio' });

            InCallManager.setForceSpeakerphoneOn(true);
            InCallManager.setSpeakerphoneOn(true);
          }, 500);
        },
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

      localStreamRef.current = stream;

      stream.getTracks().forEach(track => {
        track.enabled = true;
        pcRef.current.addTrack(track, stream);
      });

      // ✅ JOIN ROOM
      socket.emit('audio_join', { session_id });

      // ✅ SOCKET EVENTS
      socket.on('audio_offer', onOffer);
      socket.on('audio_answer', onAnswer);
      socket.on('audio_ice_candidate', onIce);
      socket.on('audio_call_ended', () => {
        console.log('📴 CALL ENDED RECEIVED');
        remoteEndedRef.current = true;
        stopCallMedia();

        setShowEndModal(true);
      });

      socket.on('audio_connected', async () => {
        console.log('🚀 audio_connected');

        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        if (!pcRef.current) {
          console.log('❌ PC not ready');
          return;
        }

        let callerId = null;
        let retries = 0;

        while (retries < 10) {
          // ✅ 1. Try selector first (works for random/direct)
          if (connectedCallDetails?.caller?.user_id) {
            callerId = connectedCallDetails.caller.user_id;
            break;
          }

          // ✅ 2. Fallback to store (works for friend)
          const state = store.getState();
          const details = state.calls.connectedCallDetails;

          if (details?.caller?.user_id) {
            callerId = details.caller.user_id;
            break;
          }

          console.log('⏳ Waiting for caller...');
          await new Promise(r => setTimeout(r, 200));
          retries++;
        }

        if (!callerId) {
          console.log('❌ Caller not found → abort');
          return;
        }

        const isCaller = String(myId) === String(callerId);

        console.log('👤 My ID:', myId);
        console.log('📞 Caller ID:', callerId);
        console.log('🎯 Am I caller?', isCaller);

        if (!isCaller) {
          console.log('🙋 Receiver ready');
          return;
        }

        try {
          console.log('📞 Caller → creating offer');

          const offer = await pcRef.current.createOffer({
            offerToReceiveAudio: true,
          });

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

  /* ================= SIGNALING ================= */

  useEffect(() => {
    if (!remoteStream) return;

    console.log('🔊 PLAYING REMOTE AUDIO');

    const audioTrack = remoteStream.getAudioTracks()[0];

    if (audioTrack) {
      audioTrack.enabled = true;
    }

    setTimeout(() => {
      InCallManager.start({ media: 'audio' }); // 🔥 restart audio engine
      InCallManager.setForceSpeakerphoneOn(true);
      InCallManager.setSpeakerphoneOn(true);
      InCallManager.setMicrophoneMute(false);
    }, 1000); // increase delay
  }, [remoteStream]);

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
      console.log('📥 Received OFFER');

      if (!pcRef.current) return;

      await pcRef.current.setRemoteDescription(offer);

      await flushIce();
      pcRef.current.getReceivers().forEach(r => {
        if (r.track) {
          r.track.enabled = true;
        }
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

      // ✅ ENABLE TRACKS
      pcRef.current.getReceivers().forEach(r => {
        if (r.track) r.track.enabled = true;
      });

      // 🔥 CRITICAL: flush AFTER remote desc
      await flushIce();

      console.log('✅ ANSWER APPLIED + ICE FLUSHED');

      onConnected();
    } catch (err) {
      console.log('❌ onAnswer ERROR:', err);
    }
  };
  const onIce = async ({ candidate }) => {
    console.log('📥 Received ICE:', candidate);

    if (!candidate || !pcRef.current || endedRef.current) return;

    if (
      !pcRef.current.remoteDescription ||
      !pcRef.current.remoteDescription.type
    ) {
      console.log('⏳ Storing ICE (no remote description yet)');
      pendingIceRef.current.push(candidate);
      return;
    }

    console.log('✅ Adding ICE immediately');

    await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
  };
  /* ================= CONNECTED ================= */

  const onConnected = () => {
    if (timerRef.current) return;

    setConnectedUI(true);

    // 🔥 FORCE AUDIO TRACK ENABLE (FIX FEMALE ISSUE)
    const localTrack = localStreamRef.current?.getAudioTracks()[0];

    if (localTrack) {
      localTrack.enabled = true;
      console.log('🎤 LOCAL MIC ENABLED');
    }

    setTimeout(() => {
      console.log('🔊 AUDIO FIX AFTER CONNECT');

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

  // const toggleMic = () => {
  //   const track = localStreamRef.current?.getAudioTracks()[0];
  //   if (!track) return;

  //   track.enabled = !track.enabled;
  //   setMicOn(track.enabled);
  // };

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;

    const newState = !track.enabled;

    track.enabled = newState;
    setMicOn(newState);

    const socket = socketRef.current;

    if (socket && socket.connected) {
      socket.emit('mic_status', {
        session_id,
        user_id: myId,
        micOn: newState,
      });
    } else {
      console.log('⚠️ Socket not connected, mic state not sent');
    }
  };

  const toggleSpeaker = () => {
    const newVal = !speakerOn;
    console.log('🔊 Speaker:', newVal ? 'ON' : 'OFF');

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
  const beforeRemoveRef = useRef(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      // ✅ HARD STOP (FINAL FIX)
      if (disableExitRef.current) {
        navigation.dispatch(e.data.action); // ✅ allow navigation
        return;
      }

      if (manualExitRef.current) {
        navigation.dispatch(e.data.action);
        return;
      }

      e.preventDefault();

      Alert.alert('Exit from Call', 'Are you sure you want to exit the call?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            setShowEndModal(true);
          },
        },
      ]);
    });
    beforeRemoveRef.current = unsubscribe;
    return unsubscribe;
  }, [navigation]);
  /* ================= AUTO CLEANUP ================= */
  useEffect(() => {
    return () => {
      if (!endedRef.current && !manualExitRef.current) {
        socketRef.current?.emit('audio_call_hangup', { session_id });

        stopCallMedia();

        // ✅ ADD THIS
        callManager.reset();
        dispatch(clearCall());
      }
    };
  }, []);
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleMic = ({ user_id, micOn }) => {
      if (String(user_id) !== String(myId)) {
        setOtherMicOn(micOn);
      }
    };

    socket.on('mic_status_update', handleMic);

    return () => {
      socket.off('mic_status_update', handleMic);
    };
  }, []);
  /* ================= UI ================= */
  const getRippleStyle = anim => ({
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(226,133,251,0.25)',
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.6],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    }),
  });

  return (
    <LinearGradient
      colors={['#e2b9fd', '#f19ced', '#FFD1E8']}
      style={styles.container}
    >
      <View style={styles.topheats} pointerEvents="none">
        {/* LEFT BIG */}
        <MaskedView
          style={styles.heartMask}
          maskElement={<Ionicons name="heart" style={styles.heartIcon} />}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.5)', 'rgba(152,50,248,0.15)']}
            style={styles.heartGradient}
          />
        </MaskedView>

        {/* TOP RIGHT SMALL */}
        <MaskedView
          style={styles.heartMaskTopRight}
          maskElement={<Ionicons name="heart" style={styles.heartIconTiny} />}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.5)', 'rgba(152,50,248,0.15)']}
            style={styles.heartGradient}
          />
        </MaskedView>
        {/* LEFT SMALL */}
        <MaskedView
          style={styles.heartMaskSmall}
          maskElement={<Ionicons name="heart" style={styles.heartIconSmall} />}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.5)', 'rgba(152,50,248,0.15)']}
            style={styles.heartGradient}
          />
        </MaskedView>

        {/* RIGHT */}
        <MaskedView
          style={styles.heartMaskRight}
          maskElement={<Ionicons name="heart" style={styles.heartIcon} />}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.5)', 'rgba(152,50,248,0.15)']}
            style={styles.heartGradient}
          />
        </MaskedView>
      </View>
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
            <View style={styles.avatarWrapper}>
              {/* RIPPLE */}
              <Animated.View style={getRippleStyle(ripple1)} />
              <Animated.View style={getRippleStyle(ripple2)} />

              {/* GRADIENT BORDER */}
              <LinearGradient
                colors={['#c084fc', '#e879f9', '#f472b6']}
                style={styles.gradientRing}
              >
                <Image source={{ uri: me.avatar }} style={styles.avatar} />
              </LinearGradient>

              {!micOn && (
                <View style={styles.muteIcon}>
                  <Ionicons name="mic-off" size={16} color="#fff" />
                </View>
              )}
            </View>

            <Text style={styles.userName}>{me.name}</Text>
            <Text style={styles.desc}>{me.bio || 'No bio available'}</Text>
          </View>

          <TouchableOpacity
            style={styles.userCard}
            onPress={() => {
              dispatch(otherUserFetchRequest(other.user_id));
              navigation.navigate('AboutScreen');
            }}
          >
            <View style={styles.avatarWrapper}>
              {/* RIPPLE */}
              <Animated.View style={getRippleStyle(ripple1)} />
              <Animated.View style={getRippleStyle(ripple2)} />

              {/* GRADIENT BORDER */}
              <LinearGradient
                colors={['#c084fc', '#e879f9', '#f472b6']}
                style={styles.gradientRing}
              >
                <Image source={{ uri: other.avatar }} style={styles.avatar} />
              </LinearGradient>

              {!otherMicOn && (
                <View style={styles.muteIcon}>
                  <Ionicons name="mic-off" size={16} color="#fff" />
                </View>
              )}
            </View>
            <Text style={styles.userName}>{other.name}</Text>
            <Text style={styles.desc}>{other.bio || 'No bio available'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.circleBtn,
            {
              backgroundColor: speakerOn ? PRIMARY : '#fff',
            },
          ]}
          onPress={toggleSpeaker}
        >
          <Ionicons
            name={speakerOn ? 'volume-high' : 'volume-mute'}
            size={24}
            color={speakerOn ? '#fff' : PRIMARY}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.circleBtn,
            {
              backgroundColor: micOn ? PRIMARY : '#fff',
            },
          ]}
          onPress={toggleMic}
        >
          <Ionicons
            name={micOn ? 'mic' : 'mic-off'} // 🔥 icon change
            size={24}
            color={micOn ? '#fff' : PRIMARY}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.endBtn}
          onPress={() => {
            setShowEndModal(true); // ✅ show rating modal first
          }}
        >
          <Ionicons name="call" size={22} color="#8f0a0a" />
        </TouchableOpacity>
      </View>

      {remoteStream && (
        <RTCView
          key={remoteStream?.toURL()}
          streamURL={remoteStream.toURL()}
          style={{ width: 1, height: 1 }} // hidden but required
        />
      )}

      <EndCallConfirmModal
        visible={showEndModal}
        otherUser={other}
        onCancel={() => setShowEndModal(false)}
        onConfirm={rating => {
          if (isExitingRef.current) return;
          isExitingRef.current = true;
          disableExitRef.current = true;
          manualExitRef.current = true;

          setShowEndModal(false);

          // remove listener also (extra safe)
          dispatch(
            submitRatingRequest({
              session_id,
              rater_id: myId,
              rated_user_id: other?.user_id,
              rating,
            }),
          );

          if (!remoteEndedRef.current) {
            socketRef.current?.emit('audio_call_hangup', { session_id });
          }
          stopCallMedia();

          callManager.reset();
          dispatch(clearCall());

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
  heartMask: {
    position: 'absolute',
    top: 420,
    left: -50,
    width: 220,
    height: 220,
    opacity: 0.5,
  },

  heartMaskSmall: {
    position: 'absolute',
    top: 120,
    left: 20,
    width: 100,
    height: 100,
    opacity: 0.4,
  },

  heartMaskRight: {
    position: 'absolute',
    top: 320,
    right: -10,
    width: 130,
    height: 230,
    opacity: 0.5,
  },

  // ✅ NEW (4th heart)
  heartMaskTopRight: {
    position: 'absolute',
    top: 80,
    right: 20,
    width: 80,
    height: 100,
    opacity: 0.35,
  },

  // ICON SIZES
  heartIcon: {
    fontSize: 200,
    color: 'black',
  },

  heartIconSmall: {
    fontSize: 70,
    color: 'black',
  },

  heartIconTiny: {
    fontSize: 80,
    color: 'black',
  },

  heartGradient: {
    flex: 1,
  },
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
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },

  endBtn: {
    backgroundColor: '#FF4D4F',
    width: 65,
    height: 65,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },

  debug: {
    position: 'absolute',
    bottom: 10,
    fontSize: 11,
    color: '#555',
  },
  gradientRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },

  avatarWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  muteIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF4D4F',
    borderRadius: 12,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});
