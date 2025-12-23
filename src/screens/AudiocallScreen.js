import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { createPC, getAudioStream } from "../utils/webrtc";
import { MAIN_BASE_URL } from "../api/baseUrl1";

const { width } = Dimensions.get("window");

const AudiocallScreen = ({ route, navigation }) => {
  // ---------------------------
  //      ROUTE PARAMS
  // ---------------------------
  const { session_id, target_id } = route?.params || {};

  const [token, setToken] = useState(null);
  const [user_id, setUserId] = useState(null);

  const socket = useRef(null);
  const pc = useRef(null);
  const localStream = useRef(null);

  const [callConnected, setCallConnected] = useState(false);

  // ---------------------------
  // LOAD TOKEN + USER_ID
  // ---------------------------
  useEffect(() => {
    const loadUser = async () => {
      const t = await AsyncStorage.getItem("twittoke");
      const uid = await AsyncStorage.getItem("user_id");

      setToken(t);
      setUserId(uid);

      console.log("TOKEN =>", t);
      console.log("USER_ID =>", uid);
    };
    loadUser();
  }, []);

  // ---------------------------
  // CREATE SOCKET
  // ---------------------------
  useEffect(() => {
    if (!token) return;

    socket.current = io(MAIN_BASE_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    console.log("SOCKET CONNECTED");

    return () => socket.current?.disconnect();
  }, [token]);

  // ---------------------------
  // INIT WEBRTC WHEN READY
  // ---------------------------
  useEffect(() => {
    if (!token || !socket.current || !session_id || !target_id) return;

    initializeWebRTC();

    return () => cleanupCall();
  }, [token, socket.current]);

  const cleanupCall = () => {
    try {
      localStream.current?.getTracks().forEach((t) => t.stop());
      pc.current?.close();
    } catch (err) {}
  };

  // ---------------------------
  // WEBRTC INITIALIZATION
  // ---------------------------
  const initializeWebRTC = async () => {
    pc.current = createPC();

    // ICE CANDIDATE
    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit("audio_ice_candidate", {
          session_id,
          target_id,
          candidate: event.candidate,
        });
      }
    };

    // MICROPHONE STREAM
    localStream.current = await getAudioStream();
    localStream.current.getTracks().forEach((track) =>
      pc.current.addTrack(track, localStream.current)
    );

    listenSocketEvents();

    // CALLER SENDS OFFER
    if (user_id !== target_id) {
      createOffer();
    }
  };

  // ---------------------------
  // SOCKET EVENTS
  // ---------------------------
  const listenSocketEvents = () => {
    // RECEIVER GETS OFFER
    socket.current.on("audio_offer", async ({ offer, from }) => {
      await pc.current.setRemoteDescription(offer);

      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);

      socket.current.emit("audio_answer", {
        session_id,
        target_id: from,
        answer,
      });
    });

    // CALLER GETS ANSWER
    socket.current.on("audio_answer", async ({ answer }) => {
      await pc.current.setRemoteDescription(answer);
    });

    // ICE CANDIDATE
    socket.current.on("audio_ice_candidate", async ({ candidate }) => {
      await pc.current.addIceCandidate(candidate);
    });

    // CALL CONNECTED
    socket.current.on("audio_call_connected", () => {
      setCallConnected(true);
    });

    // CALL ENDED
    socket.current.on("audio_call_ended", () => {
      navigation.goBack();
    });
  };

  // ---------------------------
  // CALLER CREATES OFFER
  // ---------------------------
  const createOffer = async () => {
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    socket.current.emit("audio_offer", {
      session_id,
      target_id,
      offer,
    });
  };

  // ---------------------------
  // END CALL
  // ---------------------------
  const hangupCall = () => {
    socket.current.emit("audio_call_hangup", { session_id });
    navigation.goBack();
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <LinearGradient colors={["#5e007a", "#0d0017"]} style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View>
          <Text style={styles.userName}>User {target_id}</Text>
          <Text style={styles.duration}>
            {callConnected ? "Connected" : "Ringing..."}
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* AVATARS */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarBox}>
          <Image source={require("../assets/boy1.jpg")} style={styles.avatarImg} />
        </View>

        <View style={styles.avatarBox2}>
          <Image source={require("../assets/girl1.jpg")} style={styles.avatarImg} />
        </View>
      </View>

      {/* CALL BUTTON */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.endCallBtn} onPress={hangupCall}>
          <Ionicons name="call" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

    </LinearGradient>
  );
};

export default AudiocallScreen;

// ------------------ STYLES ------------------
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    marginTop: 50,
    paddingHorizontal: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  userName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
  },

  duration: {
    color: "#ccc",
    marginTop: 2,
  },

  avatarContainer: {
    marginTop: 90,
    width: "100%",
    alignItems: "center",
    position: "relative",
    height: 350,
  },

  avatarBox: {
    width: 160,
    height: 160,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarBox2: {
    width: 160,
    height: 160,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 130,
    right: width * 0.18,
  },

  avatarImg: {
    width: "95%",
    height: "95%",
    borderRadius: 20,
  },

  bottomButtons: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },

  endCallBtn: {
    width: 75,
    height: 75,
    backgroundColor: "red",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
