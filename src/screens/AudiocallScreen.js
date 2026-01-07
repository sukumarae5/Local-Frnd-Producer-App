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
import { mediaDevices } from "react-native-webrtc";
import { SocketContext } from "../socket/SocketProvider";
import { createPC } from "../utils/webrtc";
import { CommonActions } from "@react-navigation/native";

const AudiocallScreen = ({ route, navigation }) => {
  const { session_id, role } = route.params;
 console.log("🚀 AudiocallScreen params:", route.params);
  const socket = useContext(SocketContext)?.current;

  /* ================= REFS ================= */
  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const cleanupRef = useRef(false);
  const timerRef = useRef(null);
  const iceConnectedRef = useRef(false);

  /* ================= STATE ================= */
  const [seconds, setSeconds] = useState(0);
  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [iceState, setIceState] = useState("new");

  /* ================= ICE GRACE PERIOD (2 MIN) ================= */
  useEffect(() => {
    console.log("⏳ ICE grace timer started (2 minutes)");

    const t = setTimeout(() => {
      if (!iceConnectedRef.current) {
        console.log(
          "⏳ ICE still connecting — keeping call alive (no cleanup)"
        );
      }
    }, 2 * 60 * 1000);

    return () => clearTimeout(t);
  }, []);

  /* ================= PERMISSION ================= */
  const requestPermission = async () => {
    if (Platform.OS === "android") {
      const res = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      return res === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  /* ================= CREATE PEER (ONCE) ================= */
  const createPeerOnce = async () => {
    if (pcRef.current) return;

    console.log("✅ Creating PeerConnection");

    const pc = createPC({
      onIceCandidate: (candidate) => {
        socket.emit("audio_ice_candidate", {
          session_id,
          candidate,
        });
      },
      onIceState: (state) => {
        console.log("🧊 ICE =", state);
        setIceState(state);

        if (state === "connected" || state === "completed") {
          iceConnectedRef.current = true;
        }
      },
    });

    pcRef.current = pc;

    streamRef.current = await mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    pc.addTrack(
      streamRef.current.getAudioTracks()[0],
      streamRef.current
    );
  };

  /* ================= INIT ================= */
  useEffect(() => {
    if (!socket) return;

    const init = async () => {
      const ok = await requestPermission();
      if (!ok) {
        console.log("❌ Mic permission denied");
        return;
      }

      console.log("📞 audio_join");
      socket.emit("audio_join", { session_id });

      socket.on("audio_connected", onConnected);
      socket.on("audio_offer", onOffer);
      socket.on("audio_answer", onAnswer);
      socket.on("audio_ice_candidate", onIce);
      socket.on("audio_call_ended", onRemoteEnd);
    };

    init();

    return () => {
      socket.off("audio_connected", onConnected);
      socket.off("audio_offer", onOffer);
      socket.off("audio_answer", onAnswer);
      socket.off("audio_ice_candidate", onIce);
      socket.off("audio_call_ended", onRemoteEnd);
    };
  }, [socket]);

  /* ================= CONNECTED ================= */
  const onConnected = async () => {
    console.log("🔗 audio_connected");
    setConnected(true);
    startTimer();

    await createPeerOnce();

    if (role === "caller") {
      // 🔥 IMPORTANT: delay offer slightly (Android stability)
      setTimeout(async () => {
        console.log("📤 Creating offer (caller)");

        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);

        socket.emit("audio_offer", { session_id, offer });
      }, 400);
    }
  };

  /* ================= SIGNALING ================= */
  const onOffer = async ({ offer }) => {
    console.log("📥 Offer received");

    await createPeerOnce();

    await pcRef.current.setRemoteDescription(offer);

    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    socket.emit("audio_answer", { session_id, answer });
  };

  const onAnswer = async ({ answer }) => {
    console.log("📥 Answer received");
    await pcRef.current.setRemoteDescription(answer);
  };

  const onIce = async ({ candidate }) => {
    await pcRef.current.addIceCandidate(candidate);
  };

  /* ================= TIMER ================= */
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  };

  /* ================= MIC ================= */
  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  };

  /* ================= CALL END (SAFE) ================= */
  const onRemoteEnd = () => {
    if (!iceConnectedRef.current) {
      console.log(
        "⚠️ Ignoring early audio_call_ended (ICE not connected)"
      );
      return;
    }

    cleanup();
  };

  /* ================= MANUAL END ================= */
  const endCall = () => {
    cleanup();
  };

  /* ================= CLEANUP ================= */
  const cleanup = () => {
    if (cleanupRef.current) return;
    cleanupRef.current = true;

    console.log("🧹 Cleanup");

    clearInterval(timerRef.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name:
                role === "caller"
                  ? "TrainersCallPage"
                  : "ReciverHomeScreen",
            },
          ],
        })
      );
    }, 300);
  };

  /* ================= UI ================= */
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
            size={28}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={endCall}>
          <Ionicons name="call" size={36} color="red" />
        </TouchableOpacity>
      </View>

      <Text style={styles.debug}>ICE: {iceState}</Text>
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
    fontSize: 22,
    marginBottom: 30,
  },
  controls: {
    flexDirection: "row",
    gap: 40,
  },
  debug: {
    marginTop: 20,
    color: "#00ffcc",
    fontSize: 12,
  },
});