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
import { NativeEventEmitter } from 'react-native';
import { ToastAndroid } from 'react-native';

const showToast = msg => {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
};

const PRIMARY = '#A020F0';

const AudiocallScreen = ({ route, navigation }) => {
  const { session_id, caller_id: routeCallerId } = route.params;
  const { socketRef, connected } = useContext(SocketContext);
  const dispatch = useDispatch();

  const myGender = useSelector(
    state => state.user?.userdata?.user?.gender || state.auth?.user?.gender,
  );
  const myId = useSelector(state => state.user.userdata?.user?.user_id);
  const coinBalance = useSelector(
    state => state.user?.userdata?.user?.coin_balance ?? 0,
  );
  const connectedCallDetails = useSelector(
    state => state?.calls?.connectedCallDetails,
  );

  const callType = route?.params?.call_type || 'AUDIO';
  const isMale = myGender === 'Male';

  // ── Coin rate from server billing (AUDIO=10, VIDEO=60 per minute) ──
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

  // ── Refs ──
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
  // ADD this ref with other refs:
  const alertShownRef = useRef(false);

  // ── State ──
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

  // ── Coin display state (server-driven) ──
  // coinSecondsLeft = total seconds male can talk based on current coins
  // Calculated from initial balance, decremented locally every second
  // Reset/corrected whenever server emits male_minutes_update
  const [coinSecondsLeft, setCoinSecondsLeft] = useState(() => {
    if (!isMale) return null;
    // 10 coins = 60 seconds, so 1 coin = 6 seconds
    return Math.floor((coinBalance / RATE) * 60);
  });
  const [warningMsg, setWarningMsg] = useState('');
  const coinCountdownRef = useRef(null); // local 1s decrement for smooth display

  useEffect(() => {
    otherRef.current = other;
  }, [other]);

  // ── Ripple animation ──
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
    if (session_id) dispatch(callDetailsRequest());
  }, [session_id]);

  // ── Permissions ──
  const requestPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
    return res === PermissionsAndroid.RESULTS.GRANTED;
  };

  /* ═══════════════════════════════════════════
     SERVER COIN EVENTS — join billing room
     Server emits to call:session_id room
  ═══════════════════════════════════════════ */
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !connectedUI) return;

    socket.emit('audio_join_room', { session_id });

    const onMinutesUpdate = ({ remainingCoins, ratePerMinute }) => {
      if (!isMale) return;

      console.log('💰 male_minutes_update:', remainingCoins);

      const newSecondsLeft = Math.floor((remainingCoins / ratePerMinute) * 60);

      setCoinSecondsLeft(newSecondsLeft);
    };

    const onLowBalanceWarning = ({ remainingCoins }) => {
      if (!isMale) return;
      // ✅ Calculate actual minutes left
      const minutesLeft = Math.floor(remainingCoins / RATE);
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
          }),
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

  /* ═══════════════════════════════════════════
     WebRTC INIT
  ═══════════════════════════════════════════ */
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
        onIceCandidate: candidate =>
          socket.emit('audio_ice_candidate', { session_id, candidate }),
        onIceState: setIceState,
        onTrack: stream => {
          const audioTrack = stream.getAudioTracks()[0];
          if (audioTrack) audioTrack.enabled = true;
          setRemoteStream(stream);
        },
      });

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

      socket.emit('audio_join', { session_id });

      socket.on('audio_offer', onOffer);
      socket.on('audio_answer', onAnswer);
      socket.on('audio_ice_candidate', onIce);

      socket.on('call_ended', data => {
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
            }),
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

  // ── Audio device listener ──
  useEffect(() => {
    const subscription = incallEmitter.addListener(
      'onAudioDeviceChanged',
      data => {
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
      },
    );
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
      pcRef.current.getReceivers().forEach(r => {
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
      pcRef.current.getReceivers().forEach(r => {
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

  /* ═══════════════════════════════════════════
     onConnected — start wall-clock timer +
     smooth coin countdown for male
  ═══════════════════════════════════════════ */
  const onConnected = () => {
    if (timerRef.current) return;
    connectedRef.current = true;
    setConnectedUI(true);

    const localTrack = localStreamRef.current?.getAudioTracks()[0];
    if (localTrack) localTrack.enabled = true;
    setTimeout(() => InCallManager.setMicrophoneMute(false), 500);
    setSpeakerOn(false);
    dispatch(callDetailsRequest());

    // Wall-clock seconds counter
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);

    // ── Male only: start smooth local countdown ──
    // Server will correct this via male_minutes_update every billing cycle
    // Inside onConnected, replace the coinCountdownRef.current setInterval block:

    if (isMale) {
      if (coinBalance < RATE) {
        setWarningMsg('No coins! Purchase coins to call.');
        showToast('Insufficient coins to make this call.');
        setTimeout(() => handleEndCall(), 2000);
        return;
      }

      // ✅ CORRECT initial seconds: 7961 coins / 10 * 60 = 47766 seconds = 796m 6s
      const initialSeconds = Math.floor((coinBalance / RATE) * 60);
      setCoinSecondsLeft(initialSeconds);

      coinCountdownRef.current = setInterval(() => {
        setCoinSecondsLeft(prev => {
          if (prev === null) return null;

          if (prev <= 0) {
            clearInterval(coinCountdownRef.current);
            coinCountdownRef.current = null;

            setCoinSecondsLeft(0);

            handleEndCall();

            return 0;
          }

          const next = prev - 1;

          // 30-second warning
          if (next === 30 && !alertShownRef.current) {
            alertShownRef.current = true;

            setWarningMsg(
              'Low Balance\nRecharge now. Your call will end in 30 seconds.',
            );
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
    localStreamRef.current?.getTracks().forEach(t => t.stop());
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
      }),
    );
  };

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    const newState = !track.enabled;
    track.enabled = newState;
    setMicOn(newState);
    const socket = socketRef.current;
    if (socket?.connected)
      socket.emit('mic_status', { session_id, user_id: myId, micOn: newState });
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
    const unsubscribe = navigation.addListener('beforeRemove', e => {
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

  const getRippleStyle = anim => ({
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(226,133,251,0.25)',
    transform: [
      {
        scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }),
      },
    ],
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
  });

  // ── Format coin time ──
  const formatCoinTime = secs => {
    if (secs === null || secs === undefined) return null;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const coinDisplay = formatCoinTime(coinSecondsLeft);
  const coinIsLow = coinSecondsLeft !== null && coinSecondsLeft <= 60;

  return (
    <LinearGradient
      colors={['#e2b9fd', '#f19ced', '#FFD1E8']}
      style={styles.container}
    >
      {/* Hearts background */}
      <View style={styles.topheats} pointerEvents="none">
        <MaskedView
          style={styles.heartMask}
          maskElement={<Ionicons name="heart" style={styles.heartIcon} />}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.5)', 'rgba(152,50,248,0.15)']}
            style={styles.heartGradient}
          />
        </MaskedView>
        <MaskedView
          style={styles.heartMaskTopRight}
          maskElement={<Ionicons name="heart" style={styles.heartIconTiny} />}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.5)', 'rgba(152,50,248,0.15)']}
            style={styles.heartGradient}
          />
        </MaskedView>
        <MaskedView
          style={styles.heartMaskSmall}
          maskElement={<Ionicons name="heart" style={styles.heartIconSmall} />}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.5)', 'rgba(152,50,248,0.15)']}
            style={styles.heartGradient}
          />
        </MaskedView>
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

      {/* ── Top pills row ── */}
      <View style={styles.pillsRow}>
        {/* Call duration */}
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

        {/* Coin countdown — male only, shown after connected */}
        {connectedUI && isMale && coinDisplay !== null && (
          <View style={[styles.coinPill, coinIsLow && styles.coinPillLow]}>
            <Text style={styles.coinPillText}>🪙 {coinDisplay}</Text>
          </View>
        )}
      </View>

      {/* Warning banner */}
      {warningMsg !== '' && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning-outline" size={16} color="#fff" />
          <Text style={styles.warningText}>{warningMsg}</Text>
        </View>
      )}

      {/* User cards */}
      {connectedCallDetails?.connected && me && other && (
        <View style={styles.usersRow}>
          <View style={styles.userCard}>
            <View style={styles.avatarWrapper}>
              <Animated.View style={getRippleStyle(ripple1)} />
              <Animated.View style={getRippleStyle(ripple2)} />
              <LinearGradient
                colors={['#c084fc', '#e879f9', '#f472b6']}
                style={styles.gradientRing}
              >
                <Image
                  source={{ uri: me.display_profile_image }}
                  style={styles.avatar}
                />
              </LinearGradient>
              {!micOn && (
                <View style={styles.muteIcon}>
                  <Ionicons name="mic-off" size={16} color="#fff" />
                </View>
              )}
            </View>
            <Text style={styles.userName}>{me.name}</Text>
            <Text style={styles.desc}>{me.bio || 'No bio'}</Text>
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
              <LinearGradient
                colors={['#c084fc', '#e879f9', '#f472b6']}
                style={styles.gradientRing}
              >
                <Image
                  source={{ uri: other.display_profile_image }}
                  style={styles.avatar}
                />
              </LinearGradient>
              {!otherMicOn && (
                <View style={styles.muteIcon}>
                  <Ionicons name="mic-off" size={16} color="#fff" />
                </View>
              )}
            </View>
            <Text style={styles.userName}>{other.name}</Text>
            <Text style={styles.desc}>{other.bio || 'No bio'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.circleBtn,
            { backgroundColor: speakerOn ? PRIMARY : '#fff' },
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
            { backgroundColor: micOn ? PRIMARY : '#fff' },
          ]}
          onPress={toggleMic}
        >
          <Ionicons
            name={micOn ? 'mic' : 'mic-off'}
            size={24}
            color={micOn ? '#fff' : PRIMARY}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.endBtn}
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
        >
          <Ionicons name="call" size={22} color="#8f0a0a" />
        </TouchableOpacity>
      </View>

      {remoteStream && (
        <RTCView
          key={remoteStream.toURL()}
          streamURL={remoteStream.toURL()}
          style={{ width: 1, height: 1 }}
        />
      )}
    </LinearGradient>
  );
};

export default AudiocallScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, alignItems: 'center' },

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
  heartMaskTopRight: {
    position: 'absolute',
    top: 80,
    right: 20,
    width: 80,
    height: 100,
    opacity: 0.35,
  },
  heartIcon: { fontSize: 200, color: 'black' },
  heartIconSmall: { fontSize: 70, color: 'black' },
  heartIconTiny: { fontSize: 80, color: 'black' },
  heartGradient: { flex: 1 },

  // ── Pills ──
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timePill: {
    backgroundColor: '#fb6b7c',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timeText: { color: '#fff', fontWeight: '600' },

  coinPill: {
    backgroundColor: 'rgba(130, 0, 230, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinPillLow: {
    backgroundColor: 'rgba(220, 50, 50, 0.92)', // turns red when low
  },
  coinPillText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // ── Warning ──
  warningBanner: {
    position: 'absolute',
    bottom: 140,
    left: 15,
    right: 15,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 20,

    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  warningTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  warningText: {
    flex: 1,
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 10,
    lineHeight: 18,
  },
  // ── Users ──
  usersRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '92%',
    transform: [{ translateY: -200 }],
  },
  userCard: { width: '45%', alignItems: 'center' },
  avatarWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#ddd' },
  userName: { fontSize: 18, fontWeight: 'bold' },
  desc: { fontSize: 12, textAlign: 'center', color: '#444' },
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

  // ── Controls ──
  controls: { position: 'absolute', bottom: 50, flexDirection: 'row', gap: 25 },
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
});
