import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,  Text,  StyleSheet,  TouchableOpacity,  Image,  Alert,  Animated,  Dimensions,} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import { useDispatch, useSelector } from "react-redux";
import { startCallRequest } from "../features/calls/callAction";
import { otherUserFetchRequest } from "../features/Otherusers/otherUserActions";
import { SocketContext } from "../socket/SocketProvider";

const { width } = Dimensions.get("window");
const COLS = 3;
const CELL_WIDTH = width / COLS - 16;
const WAVE_DISTANCE = 18;

const TrainersCallPage = ({ navigation }) => {
  const dispatch = useDispatch();
  const { socketRef, connected } = useContext(SocketContext);

  const { userdata } = useSelector((state) => state.user);
  const rawUsers = useSelector((state) => state.randomusers.users);

  const users = Array.isArray(rawUsers?.users)
    ? rawUsers.users
    : Array.isArray(rawUsers)
    ? rawUsers
    : [];

  const gender = userdata?.user?.gender;
  const myId = userdata?.user?.user_id;

  const hasNavigatedRef = useRef(false);

  const [callingRandom, setCallingRandom] = useState(false);
  const [callingRandomVideo, setCallingRandomVideo] = useState(false);

  /** 🔥 Individual motion anim refs */
  const animRefs = useRef([]);

  /** 🎯 Initialize wave animations */
  useEffect(() => {
    if (users.length === 0) return;

    animRefs.current = users.map(() => new Animated.Value(0));

    users.forEach((_, i) => {
      const randomSpeed = Math.floor(Math.random() * 1500) + 800; // 800ms - 2300ms
      const initialDelay = Math.floor(Math.random() * 500); // 0 - 500ms

      Animated.loop(
        Animated.sequence([
          Animated.timing(animRefs.current[i], {
            toValue: 1,
            duration: randomSpeed,
            delay: initialDelay,
            useNativeDriver: true,
          }),
          Animated.timing(animRefs.current[i], {
            toValue: 0,
            duration: randomSpeed,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [users]);

  /** 🟣 SOCKET MATCH EVENTS */
  useEffect(() => {
    if (!connected || !socketRef.current) return;
    const socket = socketRef.current;

    const onMatched = (data) => {
      if (!data?.session_id) return;
      if (hasNavigatedRef.current) return;

      hasNavigatedRef.current = true;
      setCallingRandom(false);
      setCallingRandomVideo(false);

      const callType = data.call_type || "AUDIO";
      const screen = callType === "VIDEO" ? "VideocallScreen" : "AudiocallScreen";

      navigation.navigate(screen, {
        session_id: data.session_id,
        peer_id: data.peer_id,
        role: "caller",
      });
    };

    socket.on("call_matched", onMatched);
    return () => socket.off("call_matched", onMatched);
  }, [connected, navigation]);

  /** 🎙 START AUDIO */
  const startRandomAudioCall = () => {
    if (callingRandom) return;
    if (!connected) return Alert.alert("Connecting", "Please wait...");
    if (!gender) return Alert.alert("Profile incomplete", "Please select gender");

    hasNavigatedRef.current = false;
    setCallingRandom(true);
    dispatch(startCallRequest({ call_type: "AUDIO", gender }));
  };

  /** 📹 START VIDEO */
  const startRandomVideoCall = () => {
    if (callingRandomVideo) return;
    if (!connected) return Alert.alert("Connecting", "Please wait...");
    if (!gender) return Alert.alert("Profile incomplete", "Please select gender");

    hasNavigatedRef.current = false;
    setCallingRandomVideo(true);
    dispatch(startCallRequest({ call_type: "VIDEO", gender }));
  };

  return (
    <View style={styles.container}>
      {/* TOP HEADER */}
      <View style={styles.topWhite}>
        <View style={styles.topRow}>
          <Icon name="wallet-outline" size={20} color="#FFCA28" />
          <Text style={styles.coinText}>2999</Text>
          <View style={{ flex: 1 }} />
          <Feather name="user" size={22} color="#6A00A8" />
        </View>

        <Text style={styles.heading1}>Lokal frnd</Text>
        <Text style={styles.heading2}>Connecting Room</Text>

        <View style={styles.filterRow}>
          <View style={styles.filterChip}><Text style={styles.filterText}>Telugu</Text></View>
          <View style={styles.filterChip}><Text style={styles.filterText}>Party</Text></View>
          <View style={styles.filterChip}><Text style={styles.filterText}>Lokal</Text></View>
        </View>
      </View>

      {/* ONLINE GRID */}
      <LinearGradient colors={["#CE4BFB", "#9D00DB"]} style={styles.onlineContainer}>
        <Text style={styles.onlineTitle}>ONLINE</Text>

        <View style={styles.gridWrapper}>
          {users.filter((u) => u?.user_id !== myId).map((item, index) => {
            const translateY = animRefs.current[index]?.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -WAVE_DISTANCE],
            }) || 0;

            return (
              <Animated.View
                key={item?.user_id}
                style={[styles.itemCell, { transform: [{ translateY }] }]}
              >
                <TouchableOpacity
                  onPress={() => {
                    dispatch(otherUserFetchRequest(item.user_id));
                    navigation.navigate("AboutScreen", { userId: item.user_id });
                  }}
                  style={styles.userItem}
                >
                  <View style={styles.avatarWrapper}>
                    <View style={styles.onlineDot} />
                    <Image
                      source={
                        item?.primary_image
                          ? { uri: item.primary_image }
                          : require("../assets/boy1.jpg")
                      }
                      style={styles.avatarImage}
                    />
                  </View>
                  <Text style={styles.nameText}>{item?.name || "Guest"}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </LinearGradient>

      {/* BOTTOM ACTION PANEL */}
      <View style={styles.bottomPanel}>
        <TouchableOpacity style={styles.actionCard} onPress={startRandomAudioCall}>
          <LinearGradient colors={["#F239EC", "#9136FF"]} style={styles.actionIconWrap}>
            <Feather name="phone-call" size={18} color="#fff" />
          </LinearGradient>
          <View style={{ marginLeft: 6 }}>
            <Text style={styles.actionTextTop}>Random</Text>
            <Text style={styles.actionTextBottom}>
              {callingRandom ? "Connecting…" : "audio call"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={startRandomVideoCall}>
          <LinearGradient colors={["#F239EC", "#9136FF"]} style={styles.actionIconWrap}>
            <Feather name="video" size={18} color="#fff" />
          </LinearGradient>
          <View style={{ marginLeft: 6 }}>
            <Text style={styles.actionTextTop}>Random</Text>
            <Text style={styles.actionTextBottom}>
              {callingRandomVideo ? "Connecting…" : "video call"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <LinearGradient colors={["#F239EC", "#9136FF"]} style={styles.actionIconWrap}>
            <Feather name="map-pin" size={18} color="#fff" />
          </LinearGradient>
          <View style={{ marginLeft: 6 }}>
            <Text style={styles.actionTextTop}>Random</Text>
            <Text style={styles.actionTextBottom}>lokal calls</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TrainersCallPage;

/* ================== STYLES ================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFEAFD" },
  topWhite: {
    backgroundColor: "#FFF",
    paddingTop: 50,
    paddingHorizontal: 18,
    paddingBottom: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topRow: { flexDirection: "row", alignItems: "center" },
  coinText: { marginLeft: 6, fontSize: 14, fontWeight: "600", color: "#444" },
  heading1: { fontSize: 16, fontWeight: "600", color: "#6A00A8", textAlign: "center", marginTop: 8 },
  heading2: { fontSize: 24, fontWeight: "700", color: "#6A00A8", textAlign: "center" },

  filterRow: { flexDirection: "row", justifyContent: "center", marginTop: 12, gap: 10 },
  filterChip: { backgroundColor: "#F6F0FF", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  filterText: { color: "#6A00A8", fontSize: 13, fontWeight: "600" },

  onlineContainer: { flex: 1, padding: 12, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  onlineTitle: { color: "#fff", fontWeight: "700", fontSize: 14, marginBottom: 10, marginLeft: 5 },

  gridWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  itemCell: {
    width: CELL_WIDTH,
    height: 120,
    alignItems: "center",
    marginBottom: 14,
  },

  userItem: { alignItems: "center" },
  avatarWrapper: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#D38AFB",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarImage: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#fff" },
  onlineDot: {
    width: 12,
    height: 12,
    backgroundColor: "#00FF00",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
    position: "absolute",
    top: 3,
    right: 3,
  },
  nameText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },

  bottomPanel: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#D5B7FF",
    borderRadius: 14,
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconWrap: {
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextTop: { fontSize: 14, fontWeight: "700", color: "#6A00A8" },
  actionTextBottom: { fontSize: 12, fontWeight: "500", color: "#6A00A8" },
});
