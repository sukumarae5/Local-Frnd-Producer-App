// AudiocallScreen.js

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
  const cleanedRef = useRef(false);

  const [connected, setConnected] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [seconds, setSeconds] = useState(0);

  /* ================= PERMISSION ================= */
  const askPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error("Microphone permission denied");
      }
    }
  };

  /* ================= INIT ================= */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        await askPermission();

        const socket = await getSocket();
        if (!socket || !mounted) return;

        if (!socket.connected) {
          await new Promise((res) => socket.once("connect", res));
        }

        socketRef.current = socket;

        socket.off("audio_connected");
        socket.off("audio_offer");
        socket.off("audio_answer");
        socket.off("audio_ice_candidate");
        socket.off("audio_call_ended");

        socket.emit("audio_join", { session_id });

        InCallManager.start({ media: "audio" });
        InCallManager.setSpeakerphoneOn(true);
        InCallManager.setForceSpeakerphoneOn(true);
        InCallManager.setMicrophoneMute(false);

        if (role === "caller") {
          InCallManager.startRingback();
        }

        socket.on("audio_connected", onConnected);
        socket.on("audio_offer", onOffer);
        socket.on("audio_answer", onAnswer);
        socket.on("audio_ice_candidate", onIceCandidate);
        socket.on("audio_call_ended", onRemoteEnded);
      } catch (err) {
        console.error("Audio init error:", err);
        navigation.goBack();
      }
    };

    init();

    return () => {
      mounted = false;
      
    };
  }, []);

  /* ================= SOCKET HANDLERS ================= */
  const onConnected = async () => {
    InCallManager.stopRingback();

    if (!pcRef.current) {
      await startWebRTC();
    }

    startTimer();
  };

  const onRemoteEnded = () => {
    cleanup(false);
  };

  /* ================= TIMER ================= */
  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  };

  /* ================= WEBRTC ================= */
  const startWebRTC = async () => {
    if (pcRef.current) return;

    setConnected(true);

    const pc = createPC();
    pcRef.current = pc;

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("audio_ice_candidate", {
          session_id,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = () => {
      InCallManager.stopRingback();
    };

    localStreamRef.current = await mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    localStreamRef.current.getTracks().forEach((track) =>
      pc.addTrack(track, localStreamRef.current)
    );

    if (role === "caller") {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit("audio_offer", { session_id, offer });
    }
  };

  const onOffer = async ({ offer }) => {
    if (!pcRef.current) await startWebRTC();

    await pcRef.current.setRemoteDescription(offer);
    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    socketRef.current.emit("audio_answer", { session_id, answer });
  };

  const onAnswer = async ({ answer }) => {
    await pcRef.current?.setRemoteDescription(answer);
  };

  const onIceCandidate = async ({ candidate }) => {
    await pcRef.current?.addIceCandidate(candidate);
  };

  /* ================= CONTROLS ================= */
  const toggleSpeaker = () => {
    InCallManager.setSpeakerphoneOn(!speakerOn);
    setSpeakerOn(!speakerOn);
  };

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !micOn;
    setMicOn(!micOn);
  };

  const endCall = () => {
    cleanup(true);
  };

  /* ================= CLEANUP ================= */
  const cleanup = (sendHangup) => {
  if (cleanedRef.current) return;
  cleanedRef.current = true;

  clearInterval(timerRef.current);
  timerRef.current = null;

  InCallManager.stop();

  localStreamRef.current?.getTracks().forEach(t => t.stop());
  localStreamRef.current = null;

  pcRef.current?.close();
  pcRef.current = null;

  if (sendHangup) {
    socketRef.current?.emit("audio_call_hangup", { session_id });
  }

  if (navigation.canGoBack()) {
    navigation.goBack();
  }
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
          <Ionicons
            name={micOn ? "mic" : "mic-off"}
            size={26}
            color="#fff"
          />
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

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timer: {
    color: "#00ffcc",
    fontSize: 20,
  },
  controls: {
    flexDirection: "row",
    gap: 30,
    marginTop: 40,
  },
});