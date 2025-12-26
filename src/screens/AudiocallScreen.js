import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import InCallManager from "react-native-incall-manager";
import { mediaDevices } from "react-native-webrtc";
import { createPC } from "../utils/webrtc";
import { getSocket } from "../socket/globalSocket";

const AudiocallScreen = ({ route, navigation }) => {
  const { session_id, role } = route.params;

  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [seconds, setSeconds] = useState(0);

  /* ================= PERMISSION ================= */
  const askPermission = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
    }
  };

  /* ================= INIT ================= */
  useEffect(() => {
    let alive = true;

    (async () => {
      await askPermission();
      socketRef.current = await getSocket();
      if (!socketRef.current || !alive) return;

      socketRef.current.emit("audio_join", { session_id });

      InCallManager.start({ media: "audio" });
      InCallManager.setSpeakerphoneOn(true);
      InCallManager.startRingback();

      socketRef.current.on("audio_connected", () => {
        InCallManager.stopRingback();
        startTimer();
        startWebRTC();
      });

      socketRef.current.on("audio_offer", onOffer);
      socketRef.current.on("audio_answer", onAnswer);
      socketRef.current.on("audio_ice_candidate", onIce);
      socketRef.current.on("audio_call_ended", cleanup);
    })();

    return () => {
      alive = false;
      cleanup(true);
    };
  }, []);

  /* ================= TIMER ================= */
  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(
      () => setSeconds((s) => s + 1),
      1000
    );
  };

  /* ================= WEBRTC ================= */
  const startWebRTC = async () => {
    setConnected(true);
    pcRef.current = createPC();

    pcRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("audio_ice_candidate", {
          session_id,
          candidate: e.candidate,
        });
      }
    };

    localStreamRef.current = await mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current.getTracks().forEach((t) =>
      pcRef.current.addTrack(t, localStreamRef.current)
    );

    if (role === "caller") {
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      socketRef.current.emit("audio_offer", { session_id, offer });
    }
  };

  const onOffer = async ({ offer }) => {
    await pcRef.current.setRemoteDescription(offer);
    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);
    socketRef.current.emit("audio_answer", { session_id, answer });
  };

  const onAnswer = async ({ answer }) => {
    await pcRef.current.setRemoteDescription(answer);
  };

  const onIce = async ({ candidate }) => {
    await pcRef.current.addIceCandidate(candidate);
  };

  /* ================= CONTROLS ================= */
  const toggleSpeaker = () => {
    InCallManager.setSpeakerphoneOn(!speakerOn);
    setSpeakerOn(!speakerOn);
  };

  const toggleMic = () => {
    localStreamRef.current.getAudioTracks()[0].enabled = !micOn;
    setMicOn(!micOn);
  };

  const endCall = () => {
    socketRef.current.emit("audio_call_hangup", { session_id });
    cleanup();
  };

  /* ================= CLEANUP ================= */
  const cleanup = (silent = false) => {
    clearInterval(timerRef.current);
    InCallManager.stop();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    if (!silent) navigation.goBack();
  };

  return (
    <LinearGradient colors={["#1b0030", "#0d0017"]} style={styles.container}>
      <Text style={styles.timer}>
        {connected
          ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
          : "Connecting…"}
      </Text>

      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleMic}>
          <Ionicons name={micOn ? "mic" : "mic-off"} size={26} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleSpeaker}>
          <Ionicons
            name={speakerOn ? "volume-high" : "volume-mute"}
            size={26}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={endCall}>
          <Ionicons name="call" size={26} color="red" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default AudiocallScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  timer: { color: "#00ffcc", fontSize: 20 },
  controls: { flexDirection: "row", gap: 30, marginTop: 40 },
});
