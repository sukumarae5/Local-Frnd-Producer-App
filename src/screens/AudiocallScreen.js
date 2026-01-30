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
import { useDispatch } from "react-redux";
import { clearCall } from "../features/calls/callAction";
import { SocketContext } from "../socket/SocketProvider";
import { createPC } from "../utils/webrtc";
import { Image } from "react-native";

const AudiocallScreen = ({ route, navigation }) => {
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
  const micAnim = useRef(new Animated.Value(1)).current;

  /* ================= STATE ================= */
  const [connectedUI, setConnectedUI] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [iceState, setIceState] = useState("new");

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
      stream.getTracks().forEach((t) =>
        pcRef.current.addTrack(t, stream)
      );

      socket.emit("audio_join", { session_id });

      socket.on("audio_offer", onOffer);
      socket.on("audio_answer", onAnswer);
      socket.on("audio_ice_candidate", onIce);
      socket.on("audio_call_ended", () => cleanup(false));

      socket.on("audio_connected", async () => {
        if (role !== "caller") return;
        if (!pcRef.current || !localStreamRef.current) return;

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
      Animated.timing(micAnim, {
        toValue: 0.6,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(micAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
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

    dispatch(clearCall());
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
    <LinearGradient
      colors={["#E9C9FF", "#F4C9F2", "#FFD1E8"]}
      style={styles.container}
    >
      {/* TIME */}
      <View style={styles.timePill}>
        <Text style={styles.timeText}>
          {connectedUI
            ? `${Math.floor(seconds / 60)}:${String(
                seconds % 60
              ).padStart(2, "0")}`
            : "Connecting…"}
        </Text>
      </View>

      {/* USERS */}
      <View style={styles.usersRow}>
        <View style={styles.userCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar} />
          </View>
          <Text style={styles.userName}>User 1</Text>
          <Text style={styles.subText}>About me</Text>
          <Text style={styles.desc}>
            looking for good communication and travel partner
          </Text>
        </View>

        <View style={styles.userCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar} />
          </View>
          <Text style={styles.userName}>User 2</Text>
          <Text style={styles.subText}>About me</Text>
          <Text style={styles.desc}>
            meaningful conversations and positive connection
          </Text>
        </View>
      </View>
<View style={styles.topheats} >
          <Image source={require("../assets/leftheart.png")}  style={styles.leftheart1}></Image>

        <Image source={require("../assets/leftheart.png")}  style={styles.leftheart}></Image>
              <Image source={require("../assets/rightheart.png")}  style={styles.rightheart}></Image>

      </View>
      {/* CONTROLS */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={toggleSpeaker}
        >
          <Ionicons
            name={speakerOn ? "volume-high" : "volume-medium"}
            size={22}
            color="#9b4dff"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.circleBtn} onPress={toggleMic}>
          <Animated.View style={{ transform: [{ scale: micAnim }] }}>
            <Ionicons
              name={micOn ? "mic" : "mic-off"}
              size={22}
              color="#9b4dff"
            />
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.endBtn}
          onPress={() => cleanup(true)}
        >
          <Ionicons name="call" size={22} color="#f43939" />
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
    paddingTop: 60,
    alignItems: "center",
  },
topheats:{
    position:"absolute",
    top:30,
    left:0,
    right:0,
    flexDirection:"row",
    justifyContent:"space-between",
    paddingHorizontal:30,
    zIndex:10,
  },
  leftheart:{marginTop:400,  left:-110  },
    leftheart1:{marginTop:100,  left:-40  },

  rightheart:{marginTop:390, left:40},
  timePill: {
    backgroundColor: "#fb6b7c",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },

  timeText: {
    color: "#fff",
    fontWeight: "600",
  },

  usersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "92%",
    marginTop: 50,
  },

  userCard: {
    width: "45%",
    alignItems: "center",
  },

  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "#c77dff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ddd",
  },

  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },

  subText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
  },

  desc: {
    fontSize: 12,
    textAlign: "center",
    color: "#444",
  },

  controls: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    gap: 25,
  },

  circleBtn: {
    backgroundColor: "#fff",
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  endBtn: {
    backgroundColor: "#9b4dff",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },

  debug: {
    position: "absolute",
    bottom: 10,
    fontSize: 11,
    color: "#555",
  },
});
