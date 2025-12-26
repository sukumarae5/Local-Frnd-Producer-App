// ReciverHomeScreen.js (Female)

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

const WAIT_TIMEOUT = 60 * 1000;

const ReciverHomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const socketRef = useRef(null);
  const timeoutRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const gender = useSelector((s) => s.auth?.Otp?.user?.gender);
  const myId = useSelector((s) => s.auth?.Otp?.user?.user_id);

  /* ================= SOCKET ================= */
  useEffect(() => {
    let active = true;

    (async () => {
      const token = await AsyncStorage.getItem("twittoke");
      if (!token || !active) return;

      if (socketRef.current) return;

      socketRef.current = io(MAIN_BASE_URL, {
        transports: ["websocket"],
        auth: { token },
      });

      socketRef.current.on("call_matched", (data) => {
        clearTimeout(timeoutRef.current);
        setWaiting(false);

        navigation.navigate("AudiocallScreen", {
          session_id: data.session_id,
          role: data.role,
          peer_id: data.peer_id,
          my_id: myId,
        });
      });
    })();

    return () => {
      active = false;
      clearTimeout(timeoutRef.current);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  /* ================= AUDIO ================= */
  const handleAudio = () => {
    setShowModal(false);
    setWaiting(true);

    dispatch(audioCallRequest({ call_type: "AUDIO", gender }));

    timeoutRef.current = setTimeout(() => {
      setWaiting(false);
      alert("No users available right now.");
    }, WAIT_TIMEOUT);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={["#6a007a", "#3b003f"]} style={styles.header}>
        <Text style={styles.appName}>Local Friend</Text>
      </LinearGradient>

      <View style={styles.middle}>
        <TouchableOpacity disabled={waiting} onPress={() => setShowModal(true)}>
          <LinearGradient
            colors={waiting ? ["#555", "#333"] : ["#ff2fd2", "#b000ff"]}
            style={styles.onlineBtn}
          >
            <Icon name="radio" size={36} color="#fff" />
            <Text style={styles.onlineText}>
              {waiting ? "WAITING…" : "GO ONLINE"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={showModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.callBtn} onPress={handleAudio}>
            <Text style={{ color: "#fff" }}>Audio Call</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ReciverHomeScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#2a002d" },
  header: { padding: 20 },
  appName: { color: "#fff", fontSize: 22 },
  middle: { flex: 1, justifyContent: "center", alignItems: "center" },
  onlineBtn: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: "center",
    alignItems: "center",
  },
  onlineText: { color: "#fff", marginTop: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  callBtn: {
    padding: 20,
    backgroundColor: "#6a007a",
    borderRadius: 12,
  },
});
