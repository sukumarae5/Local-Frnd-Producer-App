import React, { useEffect, useRef, useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { audioCallRequest } from "../features/calls/callAction";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MAIN_BASE_URL } from "../api/baseUrl1";

const ReciverHomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  const gender = useSelector((state) => state.auth?.Otp?.user?.gender);

  /* SOCKET (JWT AUTH – REQUIRED) */
  useEffect(() => {
    AsyncStorage.getItem("twittoke").then((token) => {
      if (!token) return;

      socketRef.current = io(MAIN_BASE_URL, {
        transports: ["websocket"],
        auth: { token },
      });

      socketRef.current.on("call_ready", (data) => {
        navigation.navigate("AudiocallScreen", {
          session_id: data.session_id,
          role: data.role,
        });
      });
    });

    return () => socketRef.current?.disconnect();
  }, []);

  const handleAudio = () => {
    setShowModal(false);
    dispatch(audioCallRequest({ call_type: "AUDIO", gender }));
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <LinearGradient colors={["#6a007a", "#3b003f"]} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.appName}>Local Friend</Text>
          <View style={styles.statusPill}>
            <Icon name="radio-outline" size={16} color="#00FF9C" />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
      </LinearGradient>

      {/* CENTER */}
      <View style={styles.middle}>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <LinearGradient
            colors={["#ff2fd2", "#b000ff"]}
            style={styles.onlineBtn}
          >
            <Icon name="radio" size={36} color="#fff" />
            <Text style={styles.onlineText}>GO ONLINE</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.subText}>
          Stay online to receive random audio calls
        </Text>
      </View>

      {/* MODAL */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Choose Call Type</Text>

            <TouchableOpacity style={styles.callBtn} onPress={handleAudio}>
              <Icon name="call-outline" size={26} color="#fff" />
              <Text style={styles.callText}>Audio Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeText}>Close</Text>
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
    backgroundColor: "#2a002d",
  },

  /* HEADER */
  header: {
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  appName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2e0040",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    color: "#00FF9C",
    fontSize: 12,
    marginLeft: 6,
  },

  /* CENTER */
  middle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  onlineBtn: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  onlineText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },

  subText: {
    marginTop: 25,
    color: "#d3a6dd",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 40,
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#2a002d",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
  },

  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },

  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4c0055",
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 16,
  },

  callText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },

  closeBtn: {
    marginTop: 18,
  },

  closeText: {
    color: "#aaa",
    fontSize: 14,
  },
});