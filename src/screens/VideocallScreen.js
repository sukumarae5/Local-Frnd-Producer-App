import React, { useEffect, useRef, useState, useContext } from "react";
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
import { RTCView, mediaDevices } from "react-native-webrtc";
import { CommonActions } from "@react-navigation/native";
import InCallManager from "react-native-incall-manager";
import { useDispatch } from "react-redux";
import { clearCall } from "../features/calls/callAction";
import { SocketContext } from "../socket/SocketProvider";
import { createPC } from "../utils/webrtc";

const VideocallScreen = ({ route, navigation }) => {
  const { session_id, role } = route.params;
  const { socketRef, connected } = useContext(SocketContext);
const dispatch = useDispatch();

  /* ================= REFS ================= */
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingIceRef = useRef([]);
  const startedRef = useRef(false);
  const endedRef = useRef(false);
  const timerRef = useRef(null);

  /* ================= STATE ================= */
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectedUI, setConnectedUI] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [seconds, setSeconds] = useState(0);

  /* ================= PERMISSION ================= */
  const requestPermission = async () => {
    if (Platform.OS !== "android") return true;

    const mic = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    const cam = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );

    return (
      mic === PermissionsAndroid.RESULTS.GRANTED &&
      cam === PermissionsAndroid.RESULTS.GRANTED
    );
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

      /* 🔊 ANDROID AUDIO ROUTING (CORRECT WAY) */
      InCallManager.start({ media: "audio" });
      InCallManager.setMicrophoneMute(false);
      InCallManager.setSpeakerphoneOn(false); // start with earpiece / BT

      pcRef.current = createPC({
        onIceCandidate: (candidate) => {
          socket.emit("video_ice_candidate", { session_id, candidate });
        },
        onTrack: (stream) => {
          // 🔊 FORCE REMOTE AUDIO ENABLED
          stream.getAudioTracks().forEach((t) => (t.enabled = true));
          setRemoteStream(stream);
        },
      });

      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: "user" },
      });

      localStreamRef.current = stream;
      stream.getTracks().forEach((t) => pcRef.current.addTrack(t, stream));

      socket.emit("video_join", { session_id });

      socket.on("video_offer", onOffer);
      socket.on("video_answer", onAnswer);
      socket.on("video_ice_candidate", onIce);
      socket.on("video_call_ended", () => cleanup(false));

      socket.on("video_connected", async () => {
        if (role !== "caller") return;

        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        socket.emit("video_offer", { session_id, offer });
      });
    };

    start();

    return () => {
      socket.off("video_offer", onOffer);
      socket.off("video_answer", onAnswer);
      socket.off("video_ice_candidate", onIce);
      socket.off("video_call_ended");
      socket.off("video_connected");
    };
  }, [connected]);

  /* ================= HEARTBEAT ================= */
  useEffect(() => {
    const ping = setInterval(() => {
      socketRef.current?.emit("video_ping", { session_id });
    }, 15000);

    return () => clearInterval(ping);
  }, []);

  /* ================= SIGNALING ================= */
  const flushIce = async () => {
    if (!pcRef.current || endedRef.current) return;

    for (const c of pendingIceRef.current) {
      try {
        await pcRef.current.addIceCandidate(c);
      } catch {}
    }
    pendingIceRef.current = [];
  };

  const onOffer = async ({ offer }) => {
    if (!pcRef.current || endedRef.current) return;

    await pcRef.current.setRemoteDescription(offer);
    await flushIce();

    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    socketRef.current.emit("video_answer", { session_id, answer });
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
  };

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setCameraOn(track.enabled);
  };

  /* 🔊 Speaker ONLY (Bluetooth auto handled by system) */
  const toggleSpeaker = () => {
    setSpeakerOn((prev) => {
      InCallManager.setSpeakerphoneOn(!prev);
      return !prev;
    });
  };

  /* 🎥 SAFE CAMERA SWITCH (NO FREEZE) */
  const switchCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track && track._switchCamera) {
      track._switchCamera();
    }
  };

  /* ================= CLEANUP ================= */
  const cleanup = (emit = true) => {
    if (endedRef.current) return;
    endedRef.current = true;
 dispatch(clearCall());
    clearInterval(timerRef.current);

    if (emit) {
      socketRef.current?.emit("video_call_hangup", { session_id });
    }

    InCallManager.stop();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();

    const next =
      role === "caller" ? "TrainersCallpage" : "ReciverHomeScreen";

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: next }],
      })
    );
  };

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remote}
          objectFit="cover"
        />
      )}

      {localStreamRef.current && (
        <RTCView
          streamURL={localStreamRef.current.toURL()}
          style={styles.local}
          objectFit="cover"
        />
      )}

      <LinearGradient colors={["#00000000", "#000000cc"]} style={styles.bottom}>
        <Text style={styles.timer}>
          {connectedUI
            ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
            : "Connecting…"}
        </Text>

        <View style={styles.controls}>
          <Control
            icon={speakerOn ? "volume-high" : "volume-mute"}
            onPress={toggleSpeaker}
          />
          <Control
            icon={micOn ? "mic" : "mic-off"}
            onPress={toggleMic}
            danger={!micOn}
          />
          <Control
            icon={cameraOn ? "videocam" : "videocam-off"}
            onPress={toggleCamera}
          />
          <Control icon="camera-reverse" onPress={switchCamera} />
          <Control icon="call" onPress={() => cleanup(true)} danger />
        </View>
      </LinearGradient>
    </View>
  );
};

const Control = ({ icon, onPress, danger }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.controlBtn, danger && styles.dangerBtn]}
  >
    <Ionicons name={icon} size={26} color="#fff" />
  </TouchableOpacity>
);

export default VideocallScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  remote: { flex: 1 },
  local: {
    position: "absolute",
    width: 120,
    height: 160,
    top: 40,
    right: 20,
    borderRadius: 12,
    zIndex: 10,
  },
  bottom: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingBottom: 30,
    paddingTop: 20,
    alignItems: "center",
  },
  timer: { color: "#00ffcc", fontSize: 18, marginBottom: 12 },
  controls: {
    flexDirection: "row",
    gap: 14,
    justifyContent: "center",
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  dangerBtn: {
    backgroundColor: "#ff3b30",
  },
});
