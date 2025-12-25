import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import InCallManager from "react-native-incall-manager";
import {
  mediaDevices,
  RTCView,
} from "react-native-webrtc";
 
import { createPC } from "../utils/webrtc";
import  MAIN_BASE_URL  from "../api/baseUrl1";


const AudiocallScreen = ({ route, navigation }) => {
  const { session_id, role } = route.params;

  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const startedRef = useRef(false);

  const [state, setState] = useState(
    role === "caller" ? "calling" : "incoming"
  );

  /* ================= PERMISSIONS ================= */
  const requestPermission = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.MODIFY_AUDIO_SETTINGS,
      ]);
    }
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await requestPermission();

      const token = await AsyncStorage.getItem("twittoke");
      if (!token || !mounted) return;

      socketRef.current = io(MAIN_BASE_URL, {
        transports: ["websocket"],
        auth: { token },
      });

      socketRef.current.on("connect", () => {
        socketRef.current.emit("audio_join", { session_id });

        // 🔥 CRITICAL ANDROID AUDIO SETUP
        InCallManager.start({ media: "audio" });
        InCallManager.setForceSpeakerphoneOn(true);
        InCallManager.setSpeakerphoneOn(true);
        InCallManager.setMicrophoneMute(false);
        InCallManager.setKeepScreenOn(true);

        role === "caller"
          ? InCallManager.startRingback()
          : InCallManager.startRingtone("_DEFAULT_");
      });

      socketRef.current.on("audio_accepted", startWebRTC);
      socketRef.current.on("audio_call_ended", cleanup);
    };

    init();

    return () => {
      mounted = false;
      cleanup(true);
    };
  }, []);

  /* ================= ACCEPT / END ================= */
  const acceptCall = () => {
    socketRef.current.emit("audio_accept", { session_id });
  };

  const endCall = () => {
    socketRef.current.emit("audio_call_hangup", { session_id });
    cleanup();
  };

  /* ================= WEBRTC ================= */
  const startWebRTC = async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    setState("connected");

    InCallManager.stopRingback();
    InCallManager.stopRingtone();

    pcRef.current = createPC();

    /* 🔍 CONNECTION DEBUG */
    pcRef.current.onconnectionstatechange = () => {
      console.log("📡 WebRTC:", pcRef.current.connectionState);
    };

    /* ICE */
    pcRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("audio_ice_candidate", {
          session_id,
          candidate: e.candidate,
        });
      }
    };

    /* 🔥 REMOTE AUDIO */
    pcRef.current.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
      console.log("🎧 Remote audio received");
    };

    /* LOCAL AUDIO */
    localStreamRef.current = await mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });

    localStreamRef.current.getTracks().forEach((track) => {
      pcRef.current.addTrack(track, localStreamRef.current);
    });

    /* SIGNALING */
    socketRef.current.on("audio_offer", async ({ offer }) => {
      await pcRef.current.setRemoteDescription(offer);
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socketRef.current.emit("audio_answer", { session_id, answer });
    });

    socketRef.current.on("audio_answer", async ({ answer }) => {
      await pcRef.current.setRemoteDescription(answer);
    });

    socketRef.current.on("audio_ice_candidate", async ({ candidate }) => {
      await pcRef.current.addIceCandidate(candidate);
    });

    if (role === "caller") {
      const offer = await pcRef.current.createOffer({
        offerToReceiveAudio: true,
      });
      await pcRef.current.setLocalDescription(offer);
      socketRef.current.emit("audio_offer", { session_id, offer });
    }
  };

  /* ================= CLEANUP ================= */
  const cleanup = (silent = false) => {
    InCallManager.stop();

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    remoteStreamRef.current?.getTracks().forEach((t) => t.stop());

    pcRef.current?.close();
    socketRef.current?.removeAllListeners();
    socketRef.current?.disconnect();

    if (!silent) navigation.goBack();
  };

  /* ================= UI ================= */
  return (
    <LinearGradient colors={["#5e007a", "#0d0017"]} style={styles.container}>
      <Text style={styles.title}>
        {state === "calling"
          ? "Calling…"
          : state === "incoming"
          ? "Incoming Call"
          : "Connected"}
      </Text>

      {state === "incoming" && (
        <TouchableOpacity style={styles.acceptBtn} onPress={acceptCall}>
          <Ionicons name="call" size={30} color="#fff" />
        </TouchableOpacity>
      )}

      {state === "connected" && (
        <TouchableOpacity style={styles.endBtn} onPress={endCall}>
          <Ionicons name="call" size={30} color="#fff" />
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
};

export default AudiocallScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { color: "#fff", fontSize: 22, marginBottom: 40 },
  acceptBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
  },
  endBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
});