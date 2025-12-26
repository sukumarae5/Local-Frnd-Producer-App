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
import { useDispatch } from "react-redux";
import { audioCallRequest } from "../features/calls/callAction";
import { getSocket } from "../socket/globalSocket";

const WAIT_TIMEOUT = 60 * 1000;

const ReciverHomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [showModal, setShowModal] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [incoming, setIncoming] = useState(null);

  const timeoutRef = useRef(null);

  /* ================= SOCKET ================= */
  useEffect(() => {
    let mounted = true;

    (async () => {
      const socket = await getSocket();
      if (!socket || !mounted) return;

      socket.on("incoming_call", (data) => {
        clearTimeout(timeoutRef.current);
        setWaiting(false);
        setIncoming(data);
      });
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* ================= GO ONLINE ================= */
  const handleGoOnline = () => {
    setShowModal(false);
    setWaiting(true);

    dispatch(audioCallRequest({ call_type: "AUDIO", gender: "Female" }));

    timeoutRef.current = setTimeout(() => {
      setWaiting(false);
    }, WAIT_TIMEOUT);
  };

  /* ================= ACCEPT ================= */
  const acceptCall = () => {
    navigation.navigate("AudiocallScreen", {
      session_id: incoming.session_id,
      role: "receiver",
    });
    setIncoming(null);
  };

  const rejectCall = () => {
    setIncoming(null);
    setWaiting(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={["#6a007a", "#3b003f"]} style={styles.header}>
        <Text style={styles.appName}>Local Friend</Text>
      </LinearGradient>

      <View style={styles.middle}>
        {!waiting && !incoming && (
          <TouchableOpacity onPress={() => setShowModal(true)}>
            <LinearGradient
              colors={["#ff2fd2", "#b000ff"]}
              style={styles.onlineBtn}
            >
              <Icon name="radio" size={34} color="#fff" />
              <Text style={styles.onlineText}>GO ONLINE</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {waiting && <Text style={styles.waitingText}>Waiting for call… 📞</Text>}
      </View>

      {/* MODALS */}
      <Modal transparent visible={showModal}>
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

      <Modal transparent visible={!!incoming}>
        <View style={styles.modalOverlay}>
          <View style={styles.incomingBox}>
            <Text style={styles.modalTitle}>Incoming Call 📞</Text>

            <View style={styles.row}>
              <TouchableOpacity style={styles.acceptBtn} onPress={acceptCall}>
                <Icon name="call" size={26} color="#fff" />
                <Text style={styles.btnText}>Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.rejectBtn} onPress={rejectCall}>
                <Icon name="close" size={26} color="#fff" />
                <Text style={styles.btnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ReciverHomeScreen;
