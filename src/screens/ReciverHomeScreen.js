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
import { useDispatch } from "react-redux";
import { audioCallRequest } from "../features/calls/callAction";
import { SocketContext } from "../socket/SocketProvider";

const WAIT_TIMEOUT = 60000;

const ReciverHomeScreen = ({ navigation }) => {
  /* ================= HOOKS (ORDER MUST NEVER CHANGE) ================= */
  const dispatch = useDispatch();
  const socketRef = useContext(SocketContext);
  const socket = socketRef?.current;

  const timeoutRef = useRef(null);
  const navigatingRef = useRef(false);

  const [waiting, setWaiting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  /* ================= PRESENCE ================= */
  useEffect(() => {
    if (!socket) return;

    const onPresence = (data) => {
      console.log("👤 FE(FEMALE) Presence:", data.user_id, data.status);
    };

    socket.on("presence_update", onPresence);

    return () => socket.off("presence_update", onPresence);
  }, [socket]);

  /* ================= CALL MATCHED ================= */
  useEffect(() => {
    if (!socket) return;

    const onMatched = (data) => {
      if (navigatingRef.current) return;

      navigatingRef.current = true;

      console.log("📥 FE(FEMALE) call_matched:", data);

      clearTimeout(timeoutRef.current);
      setWaiting(false);

      navigation.replace("AudiocallScreen", data);
    };

    socket.on("call_matched", onMatched);

    return () => {
      socket.off("call_matched", onMatched);
      clearTimeout(timeoutRef.current);
    };
  }, [socket, navigation]);

  /* ================= GO ONLINE ================= */
  const handleGoOnline = () => {
    if (!socket || !socket.connected || waiting) return;

    navigatingRef.current = false;
    setShowModal(false);
    setWaiting(true);

    console.log("📤 FE(FEMALE) → dispatch random-connect");

    dispatch(
      audioCallRequest({
        call_type: "AUDIO",
        gender: "Female", // 🔥 EXPLICIT & INTENTIONAL
      })
    );

    timeoutRef.current = setTimeout(() => {
      console.log("⏳ FE(FEMALE) wait timeout");
      setWaiting(false);
    }, WAIT_TIMEOUT);
  };

  /* ================= UI ================= */
  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={["#6a007a", "#3b003f"]} style={styles.header}>
        <Text style={styles.appName}>Local Friend</Text>
      </LinearGradient>

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
          <Text style={styles.waitingText}>Waiting for call… 📞</Text>
        )}
      </View>

      {/* MODAL */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Go Online?</Text>

            <TouchableOpacity style={styles.callBtn} onPress={handleGoOnline}>
              <Icon name="call-outline" size={26} color="#fff" />
              <Text style={styles.callText}>Audio Call</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowModal(false)}>
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
  safe: {
    flex: 1,
    backgroundColor: "#0A001A",
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  appName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  middle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  onlineBtn: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 40,
    alignItems: "center",
  },
  onlineText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },
  waitingText: {
    color: "#fff",
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#1a0033",
    padding: 25,
    borderRadius: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },
  callBtn: {
    flexDirection: "row",
    backgroundColor: "#ff00ff",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 15,
  },
  callText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  closeText: {
    color: "#aaa",
    marginTop: 10,
  },
});
