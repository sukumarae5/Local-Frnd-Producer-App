import React, { useEffect, useRef, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Animated,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { mediaDevices } from "react-native-webrtc";
import { CommonActions } from "@react-navigation/native";
import InCallManager from "react-native-incall-manager";

import { SocketContext } from "../socket/SocketProvider";
import { createPC } from "../utils/webrtc";

const AudiocallScreen = ({ route, navigation }) => {
  const { session_id, role } = route.params;
  const { socketRef, connected } = useContext(SocketContext);

  /* ================= REFS ================= */
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingIceRef = useRef([]);
  const startedRef = useRef(false);
  const endedRef = useRef(false);
  const timerRef = useRef(null);

  /* ================= STATE ================= */
  const [connectedUI, setConnectedUI] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [iceState, setIceState] = useState("new");

  const micAnim = useRef(new Animated.Value(1)).current;

  /* ================= PERMISSION ================= */
  const requestPermission = async () => {
    if (Platform.OS !== "android") return true;
    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    return res === PermissionsAndroid.RESULTS.GRANTED;
  };

  /* ================= INIT ================= */
  useEffect(() => {
    if (!connected || !socketRef.current || startedRef.current) return;
    startedRef.current = true;

    const socket = socketRef.current;

    const start = async () => {
      const ok = await requestPermission();
      if (!ok) {
        navigation.goBack();
        return;
      }

      InCallManager.start({ media: "audio" });
      InCallManager.setSpeakerphoneOn(false);

      pcRef.current = createPC({
        onIceCandidate: (candidate) => {
          socket.emit("audio_ice_candidate", { session_id, candidate });
        },
        onIceState: setIceState,
      });

      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      localStreamRef.current = stream;
      stream.getTracks().forEach((t) => pcRef.current.addTrack(t, stream));

      socket.emit("audio_join", { session_id });

      socket.on("audio_offer", onOffer);
      socket.on("audio_answer", onAnswer);
      socket.on("audio_ice_candidate", onIce);
      socket.on("audio_call_ended", () => cleanup(false));

      socket.on("audio_connected", async () => {
        if (role !== "caller") return;
        if (!pcRef.current || !localStreamRef.current) return;

        console.log("📞 audio_connected → creating offer");

        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);

        socket.emit("audio_offer", { session_id, offer });
      });
    };

    start();

    return () => {
      socket.off("audio_offer", onOffer);
      socket.off("audio_answer", onAnswer);
      socket.off("audio_ice_candidate", onIce);
      socket.off("audio_call_ended");
      socket.off("audio_connected");
    };
  }, [connected]);

  /* ================= HEARTBEAT ================= */
  useEffect(() => {
    const ping = setInterval(() => {
      socketRef.current?.emit("audio_ping", { session_id });
    }, 15000);

    return () => clearInterval(ping);
  }, []);

  /* ================= SIGNALING ================= */
  const flushIce = async () => {
    if (!pcRef.current || endedRef.current) return;

    for (const c of pendingIceRef.current) {
      try {
        await pcRef.current.addIceCandidate(c);
      } catch (e) {
        console.log("ICE add error", e);
      }
    }
    pendingIceRef.current = [];
  };

  const onOffer = async ({ offer }) => {
    if (!pcRef.current || endedRef.current) return;

    await pcRef.current.setRemoteDescription(offer);
    await flushIce();

    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    socketRef.current.emit("audio_answer", { session_id, answer });
    onConnected();
  };

  const onAnswer = async ({ answer }) => {
    if (!pcRef.current || endedRef.current) return;

    await pcRef.current.setRemoteDescription(answer);
    await flushIce();
    onConnected();
  };

  const onIce = async ({ candidate }) => {
    if (!candidate || !pcRef.current || endedRef.current) return;

    if (!pcRef.current.remoteDescription) {
      pendingIceRef.current.push(candidate);
      return;
    }

    try {
      await pcRef.current.addIceCandidate(candidate);
    } catch {}
  };

  /* ================= TIMER ================= */
  const onConnected = () => {
    if (timerRef.current) return;

    setConnectedUI(true);
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  };

  /* ================= CONTROLS ================= */
  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setMicOn(track.enabled);

    Animated.sequence([
      Animated.timing(micAnim, { toValue: 0.6, duration: 120, useNativeDriver: true }),
      Animated.spring(micAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const toggleSpeaker = () => {
    setSpeakerOn((prev) => {
      InCallManager.setSpeakerphoneOn(!prev);
      return !prev;
    });
  };

  /* ================= CLEANUP ================= */
  const cleanup = (emit = true) => {
    if (endedRef.current) return;
    endedRef.current = true;

    clearInterval(timerRef.current);

    if (emit) {
      socketRef.current?.emit("audio_call_hangup", { session_id });
    }

    InCallManager.stop();

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();

    const nextScreen =
    role === "caller" ? "TrainersCallpage" : "ReciverHomeScreen";

  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: nextScreen }],
    })
  );
  };

  /* ================= UI ================= */
  return (
    <LinearGradient colors={["#1b0030", "#0d0017"]} style={styles.container}>
      <Text style={styles.timer}>
        {connectedUI
          ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
          : "Connecting…"}
      </Text>

      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleSpeaker}>
          <Ionicons name={speakerOn ? "volume-high" : "volume-medium"} size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleMic}>
          <Animated.View style={{ transform: [{ scale: micAnim }] }}>
            <Ionicons name={micOn ? "mic" : "mic-off"} size={30} color="#fff" />
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => cleanup(true)}>
          <Ionicons name="call" size={36} color="red" />
        </TouchableOpacity>
      </View>

      <Text style={styles.debug}>ICE: {iceState}</Text>
    </LinearGradient>
  );
};

export default AudiocallScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  timer: { color: "#00ffcc", fontSize: 22, marginBottom: 30 },
  controls: { flexDirection: "row", gap: 40 },
  debug: { marginTop: 20, color: "#00ffcc", fontSize: 12 },
});