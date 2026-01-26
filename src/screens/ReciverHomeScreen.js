import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { useSelector } from "react-redux";

import { startCallRequest } from '../features/calls/callAction';
import { SocketContext } from '../socket/SocketProvider';

const WAIT_TIMEOUT = 60000;

const ReciverHomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { socketRef, connected } = useContext(SocketContext);
console.log("ReciverHomeScreen Rendered");
console.log("Socket Connected:", connected);
console.log("Socket ID:", socketRef?.current?.id);
  const timeoutRef = useRef(null);
  const navigatingRef = useRef(false);

  const [waiting, setWaiting] = useState(false);
  const [callType, setCallType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
const { incoming } = useSelector((state) => state.friends);

  /* ================= SOCKET MATCH ================= */
  useEffect(() => {
    if (!connected || !socketRef.current) return;

    const socket = socketRef.current;

    const onMatched = data => {
      if (navigatingRef.current) return;

      navigatingRef.current = true;
      clearTimeout(timeoutRef.current);
      setWaiting(false);

      if (data.call_type === 'VIDEO') {
        navigation.replace('VideocallScreen', {
          session_id: data.session_id,
          role: data.role,
          peer_id: data.peer_id,
        });
      } else {
        navigation.replace('AudiocallScreen', {
          session_id: data.session_id,
          role: data.role,
          peer_id: data.peer_id,
        });
      }
    };

    socket.on('call_matched', onMatched);

    return () => {
      socket.off('call_matched', onMatched);
      clearTimeout(timeoutRef.current);
    };
  }, [connected, navigation]);

  /* ================= GO ONLINE ================= */
  const handleGoOnline = type => {
    if (!connected || !socketRef.current || waiting) return;

    navigatingRef.current = false;
    setWaiting(true);
    setCallType(type);
    setShowModal(false);

    dispatch(
      startCallRequest({
        call_type: type,
        gender: 'Female',
      }),
    );

    timeoutRef.current = setTimeout(() => {
      setWaiting(false);
      setCallType(null);
    }, WAIT_TIMEOUT);
  };

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    try {
      clearTimeout(timeoutRef.current);
      await AsyncStorage.clear();

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        }),
      );
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  /* ================= UI ================= */
  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <LinearGradient colors={['#6a007a', '#3b003f']} style={styles.header}>
        <View style={styles.headerRow}>
          {/* LEFT PLACEHOLDER */}
          <View style={{ width: 40 }} />

          {/* TITLE */}
          <Text style={styles.appName}>Local Friend</Text>

          {/* RIGHT ICONS */}
          <View style={styles.headerIcons}>
            <View>
  <TouchableOpacity
    style={styles.iconBtn}
    onPress={() => navigation.navigate("FriendRequestsScreen")}
  >
    <Icon name="notifications-outline" size={26} color="#fff" />
  </TouchableOpacity>

  {incoming.length > 0 && (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{incoming.length}</Text>
    </View>
  )}    
</View>


            {/* 🚪 LOGOUT */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setShowLogoutModal(true)}
            >
              <Icon name="log-out-outline" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* BODY */}
      <View style={styles.middle}>
        {!waiting ? (
          <TouchableOpacity onPress={() => setShowModal(true)}>
            <LinearGradient
              colors={['#ff2fd2', '#b000ff']}
              style={styles.onlineBtn}
            >
              <Icon name="radio" size={34} color="#fff" />
              <Text style={styles.onlineText}>GO ONLINE</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <Text style={styles.waitingText}>
            Waiting for {callType === 'VIDEO' ? 'VIDEO' : 'AUDIO'} call… 📞
          </Text>
        )}
      </View>

      {/* CALL TYPE MODAL */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Go Online</Text>

            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => handleGoOnline('AUDIO')}
            >
              <Icon name="call-outline" size={26} color="#fff" />
              <Text style={styles.callText}>Audio Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.callBtn, styles.videoBtn]}
              onPress={() => handleGoOnline('VIDEO')}
            >
              <Icon name="videocam-outline" size={26} color="#fff" />
              <Text style={styles.callText}>Video Call</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* LOGOUT MODAL */}
      <Modal transparent visible={showLogoutModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Logout?</Text>

            <TouchableOpacity
              style={styles.logoutConfirm}
              onPress={handleLogout}
            >
              <Icon name="log-out-outline" size={24} color="#fff" />
              <Text style={styles.callText}>Yes, Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowLogoutModal(false)}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ReciverHomeScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A001A' },

  header: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  appName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },

  headerIcons: {
    flexDirection: 'row',
    gap: 14,
  },

  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
badge: {
  position: "absolute",
  top: -6,
  right: -6,
  backgroundColor: "#ff0044",
  borderRadius: 10,
  minWidth: 20,
  height: 20,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 6,
},

badgeText: {
  color: "#fff",
  fontSize: 12,
  fontWeight: "bold",
},

  middle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  onlineBtn: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 40,
    alignItems: 'center',
  },

  onlineText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
  },

  waitingText: {
    color: '#fff',
    fontSize: 18,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    backgroundColor: '#1a0033',
    padding: 25,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
  },

  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },

  callBtn: {
    flexDirection: 'row',
    backgroundColor: '#ff00ff',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
    justifyContent: 'center',
  },

  videoBtn: {
    backgroundColor: '#ff005c',
  },

  logoutConfirm: {
    flexDirection: 'row',
    backgroundColor: '#ff0044',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
    justifyContent: 'center',
  },

  callText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },

  closeText: {
    color: '#aaa',
    marginTop: 10,
  },
});
