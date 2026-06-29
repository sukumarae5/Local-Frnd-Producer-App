import React, { useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  BackHandler,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SocketContext } from '../socket/SocketProvider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CommonActions } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { clearCall } from '../features/calls/callAction';

// Module-level dedup — survives stale closures
const handledSessions = new Set();

const RING_TIMEOUT_MS = 31000; // 1s more than server's 30s — catches server timeout + network delay

const IncomingCallScreen = ({ route, navigation }) => {
  const { session_id, call_type } = route.params;
  const { socketRef } = useContext(SocketContext);
  const dispatch = useDispatch();
  const localTimerRef = useRef(null); // ✅ client-side fallback timer

  // Clean up when screen unmounts
  useEffect(() => {
    return () => {
      handledSessions.delete(session_id);
      if (localTimerRef.current) {
        clearTimeout(localTimerRef.current);
      }
    };
  }, [session_id]);

  /* =============================================
     CORE — single exit point for ALL cases:
     - reject button pressed
     - caller cancelled
     - server timeout
     - client-side fallback timeout
  ============================================= */
  const navigateAway = (skipEmit = false) => {
    if (handledSessions.has(session_id)) return;
    handledSessions.add(session_id);

    // Clear local fallback timer
    if (localTimerRef.current) {
      clearTimeout(localTimerRef.current);
      localTimerRef.current = null;
    }

    if (!skipEmit) {
      socketRef.current?.emit('call_reject', { session_id });
    }

    dispatch(clearCall());

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'ReceiverBottomTabs' }],
        }),
      );
    }
  };

  /* =============================================
     CLIENT-SIDE FALLBACK TIMER
     In case server timeout event never arrives
     (network issue, socket disconnect, etc.)
  ============================================= */
  useEffect(() => {
    localTimerRef.current = setTimeout(() => {
      console.log('⏰ Client-side ring timeout — auto dismissing');
      navigateAway(false); // emit reject so server cleans up
    }, RING_TIMEOUT_MS);

    return () => {
      if (localTimerRef.current) {
        clearTimeout(localTimerRef.current);
      }
    };
  }, [session_id]);

  /* =============================================
     SOCKET LISTENERS
  ============================================= */
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Caller cancelled before receiver answered
    const handleRejected = data => {
      console.log('📵 call_rejected in IncomingCallScreen:', data);
      if (data?.session_id !== session_id) return;
      navigateAway(true);
    };

    // Server 30s timeout fired
    const handleTimeout = data => {
      console.log('⏰ call_timeout in IncomingCallScreen:', data);
      if (data?.session_id && data.session_id !== session_id) return;
      navigateAway(true); // server already ended session — skip emit
    };

    // Call ended for any other reason
    const handleCallEnded = data => {
      if (data?.session_id && data.session_id !== session_id) return;
      navigateAway(true);
    };

    socket.on('call_rejected', handleRejected);
    socket.on('call_timeout', handleTimeout);
    socket.on('call_ended', handleCallEnded);

    return () => {
      socket.off('call_rejected', handleRejected);
      socket.off('call_timeout', handleTimeout);
      socket.off('call_ended', handleCallEnded);
    };
  }, [session_id]);

  /* =============================================
     HARDWARE BACK — treat as reject
  ============================================= */
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      navigateAway(false);
      return true;
    });
    return () => sub.remove();
  }, [session_id]);

  /* =============================================
     ACCEPT
  ============================================= */
  const accept = () => {
    if (handledSessions.has(session_id)) return;
    handledSessions.add(session_id);

    // Clear timer — no longer needed
    if (localTimerRef.current) {
      clearTimeout(localTimerRef.current);
      localTimerRef.current = null;
    }

    socketRef.current?.emit('call_accept', { session_id });

    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: 'ReceiverBottomTabs' },
          {
            name: 'CallStatusScreen',
            params: { call_type, role: 'friend_receiver', session_id },
          },
        ],
      }),
    );
  };

  /* =============================================
     REJECT BUTTON
  ============================================= */
  const reject = () => {
    navigateAway(false);
  };

  return (
    <LinearGradient
      colors={['#E9C9FF', '#F4C9F2', '#FFD1E8']}
      style={styles.container}
      pointerEvents="auto"
    >
      <Image
        source={require('../assets/leftheart.png')}
        style={styles.leftHeart}
      />
      <Image
        source={require('../assets/rightheart.png')}
        style={styles.rightHeart}
      />

      <Text style={styles.title}>Incoming {call_type} Call</Text>

      <View style={styles.avatarWrap}>
        <Image source={require('../assets/girl2.jpg')} style={styles.avatar} />
      </View>

      <Text style={styles.subtitle}>Someone is calling you…</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.reject]}
          onPress={reject}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={26} color="#fff" />
          <Text style={styles.btnText}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.accept]}
          onPress={accept}
          activeOpacity={0.8}
        >
          <Ionicons
            name={call_type === 'VIDEO' ? 'videocam' : 'call'}
            size={24}
            color="#fff"
          />
          <Text style={styles.btnText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default IncomingCallScreen;

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  leftHeart: {
    position: 'absolute',
    left: -30,
    top: 80,
    width: 120,
    height: 120,
    opacity: 0.25,
  },
  rightHeart: {
    position: 'absolute',
    right: -20,
    bottom: 120,
    width: 110,
    height: 110,
    opacity: 0.25,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#5A0066',
    marginBottom: 30,
  },
  avatarWrap: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    borderColor: '#A943FF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 8,
  },
  avatar: { width: 140, height: 140, borderRadius: 70 },
  subtitle: {
    marginTop: 20,
    fontSize: 15,
    color: '#7a2a8a',
    fontWeight: '600',
  },
  row: { flexDirection: 'row', marginTop: 60, gap: 40 },
  actionBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  accept: { backgroundColor: '#5BCF8E' },
  reject: { backgroundColor: '#FF6A6A' },
  btnText: { marginTop: 6, color: '#fff', fontSize: 12, fontWeight: '700' },
});