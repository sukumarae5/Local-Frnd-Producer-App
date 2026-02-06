import React, { useEffect, useRef, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import {
  femaleSearchRequest,
  femaleCancelRequest,
} from "../features/calls/callAction";

import { SocketContext } from "../socket/SocketProvider";
import { userDatarequest } from "../features/user/userAction";

const ReciverHomeScreen = ({ navigation }) => {
  /* ================= HOOK ORDER (DO NOT CHANGE) ================= */
  const dispatch = useDispatch();
  const { socketRef, connected } = useContext(SocketContext);

  const navigatingRef = useRef(false);

  const [waiting, setWaiting] = useState(false);
  const [callType, setCallType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { incoming } = useSelector((state) => state.friends);
const { userdata } = useSelector((state) => state.user);
console.log("userdata", userdata);

  useEffect(() => {
      dispatch(userDatarequest());
    }, []);
  /* ================= SOCKET: INCOMING CALL ================= */
  useEffect(() => {
    if (!connected || !socketRef.current) return;

    const socket = socketRef.current;

    const onIncomingCall = (data) => {
      if (navigatingRef.current) return;

      navigatingRef.current = true;
      setWaiting(false);

      const screen =
        data.call_type === "VIDEO"
          ? "VideocallScreen"
          : "AudiocallScreen";

      navigation.replace(screen, {
        session_id: data.session_id,
        role: "receiver",
      });
    };

    socket.on("incoming_call", onIncomingCall);

    return () => {
      socket.off("incoming_call", onIncomingCall);
    };
  }, [connected, navigation, socketRef]);

  /* ================= START SEARCH ================= */
  const handleGoOnline = (type) => {
    if (!connected || waiting) return;

    navigatingRef.current = false;
    setWaiting(true);
    setCallType(type);
    setShowModal(false);

    dispatch(femaleSearchRequest({ call_type: type }));


  };

  /* ================= CANCEL SEARCH ================= */
  const handleCancel = () => {
dispatch(femaleCancelRequest());
    navigatingRef.current = false;
    setWaiting(false);
    setCallType(null);
  };

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    socketRef?.current?.disconnect();
    await AsyncStorage.clear();

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  };

  /* ================= UI ================= */
  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <LinearGradient colors={["#6a007a", "#3b003f"]} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ width: 40 }} />
          <Text style={styles.appName}>Local Friend</Text>

          <View style={styles.headerIcons}>

  {/* MESSAGE ICON (same as male HomeScreen) */}
  <TouchableOpacity
    style={styles.iconBtn}
    onPress={() => navigation.navigate("MessagesScreen")}
  >
<Icon name="chatbubble-ellipses-outline" size={26} color="#fff" />
  </TouchableOpacity>

  {/* NOTIFICATION ICON */}
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

  {/* LOGOUT ICON */}
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
              colors={["#ff2fd2", "#b000ff"]}
              style={styles.onlineBtn}
            >
              <Icon name="radio" size={34} color="#fff" />
              <Text style={styles.onlineText}>GO ONLINE</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.waitingText}>
              Waiting for {callType} call… 📞
            </Text>

            <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* CALL TYPE MODAL */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Go Online</Text>

            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => handleGoOnline("AUDIO")}
            >
              <Icon name="call-outline" size={26} color="#fff" />
              <Text style={styles.callText}>Audio Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.callBtn, styles.videoBtn]}
              onPress={() => handleGoOnline("VIDEO")}
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
