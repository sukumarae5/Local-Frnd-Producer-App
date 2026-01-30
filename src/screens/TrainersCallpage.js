// TrainersCallPage.js

import React, { useContext, useRef, useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Alert, Animated, Dimensions
} from "react-native";
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

  const [callingRandom, setCallingRandom] = useState(false);
  const [callingRandomVideo, setCallingRandomVideo] = useState(false);

  const animRefs = useRef([]);

  /** WAVE MOTION */
  useEffect(() => {
    if (users.length === 0) return;

    animRefs.current = users.map(() => new Animated.Value(0));

    users.forEach((_, i) => {
      const randomSpeed = Math.floor(Math.random() * 1500) + 800;

      Animated.loop(
        Animated.sequence([
          Animated.timing(animRefs.current[i], {
            toValue: 1,
            duration: randomSpeed,
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

  /** AUDIO CALL */
  const startRandomAudioCall = () => {
    if (!connected) return Alert.alert("Connecting", "Please wait...");
    if (!gender) return Alert.alert("Profile incomplete", "Please select gender");

    setCallingRandom(true);
    dispatch(startCallRequest({ call_type: "AUDIO", gender }));

    navigation.navigate("CallStatusScreen", { call_type: "AUDIO" });
  };

  /** VIDEO CALL */
  const startRandomVideoCall = () => {
    if (!connected) return Alert.alert("Connecting", "Please wait...");
    if (!gender) return Alert.alert("Profile incomplete", "Please select gender");

    setCallingRandomVideo(true);
    dispatch(startCallRequest({ call_type: "VIDEO", gender }));

    navigation.navigate("CallStatusScreen", { call_type: "VIDEO" });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
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

      {/* GRID */}
      {/* GRID */}
<LinearGradient colors={["#CE4BFB", "#9D00DB"]} style={styles.onlineContainer}>
  <Text style={styles.onlineTitle}>ONLINE</Text>

  <View style={styles.gridWrapper}>
    {users
      .filter((u) => u?.user_id !== myId)
      .map((item, index) => {

        const translateY =
          animRefs.current[index]?.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -WAVE_DISTANCE],
          }) || 0;

        // Zig-zag offset
        const row = Math.floor(index / COLS);
        const offsetX = row % 2 === 0 ? 0 : CELL_WIDTH / 2;

        return (
          <Animated.View
            key={item.user_id}
            style={[
              styles.itemCell,
              {
                transform: [{ translateY }],
                marginLeft: offsetX,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => {
                dispatch(otherUserFetchRequest(item.user_id));
                navigation.navigate("PerfectMatchScreen", {
                  userId: item.user_id,
                });
              }}
            >
              {/* Avatar */}
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

              {/* Language badge */}
              <View style={styles.langBadge}>
                <Text style={styles.langText}>  {item?.native_name || "none"}</Text>
              </View>

              {/* Name */}
              <Text style={styles.nameText}>
                {item?.name || "Guest"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
  </View>
</LinearGradient>

      {/* ACTIONS */}
      <View style={styles.bottomPanel}>
        <TouchableOpacity style={styles.actionCard} onPress={startRandomAudioCall}>
          <LinearGradient colors={["#F239EC", "#9136FF"]} style={styles.actionIconWrap}>
            <Feather name="phone-call" size={18} color="#fff" />
          </LinearGradient>
          <Text style={styles.actionTextTop}>Random</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={startRandomVideoCall}>
          <LinearGradient colors={["#F239EC", "#9136FF"]} style={styles.actionIconWrap}>
            <Feather name="video" size={18} color="#fff" />
          </LinearGradient>
          <Text style={styles.actionTextTop}>Video</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TrainersCallPage;

/*** STYLES ***/
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFEAFD" },
  topWhite: { backgroundColor: "#FFF", paddingTop: 50, paddingHorizontal: 18, paddingBottom: 10, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  topRow: { flexDirection: "row", alignItems: "center" },
  coinText: { marginLeft: 6, fontSize: 14, fontWeight: "600", color: "#444" },
  heading1: { textAlign: "center", fontSize: 16, fontWeight: "600", color: "#6A00A8" },
  heading2: { textAlign: "center", fontSize: 24, fontWeight: "700", color: "#6A00A8" },
  filterRow: { flexDirection: "row", justifyContent: "center", marginTop: 12, gap: 10 },
  filterChip: { backgroundColor: "#F6F0FF", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  filterText: { color: "#6A00A8", fontSize: 13, fontWeight: "600" },
  onlineContainer: { flex: 1, padding: 12, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  onlineTitle: { color: "#fff", fontWeight: "700", fontSize: 14, marginBottom: 10 },
  gridWrapper: {
  flexDirection: "row",
  flexWrap: "wrap",
},

itemCell: {
  width: CELL_WIDTH,
  alignItems: "center",
  marginBottom: 20,
},

avatarWrapper: {
  width: 86,
  height: 86,
  borderRadius: 43,
  backgroundColor: "rgba(255,255,255,0.2)",
  alignItems: "center",
  justifyContent: "center",
},

avatarImage: {
  width: 64,
  height: 64,
  borderRadius: 32,
  borderWidth: 2,
  borderColor: "#fff",
},

onlineDot: {
  width: 14,
  height: 14,
  borderRadius: 7,
  backgroundColor: "#00FF6A",
  borderWidth: 2,
  borderColor: "#fff",
  position: "absolute",
  top: 4,
  right: 4,
  zIndex: 10,
},

langBadge: {
  backgroundColor: "#FFD8A8",
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 10,
  marginTop: 6,
},

langText: {
  fontSize: 11,
  color: "#7A3E00",
  fontWeight: "600",
},

nameText: {
  marginTop: 4,
  fontSize: 15,
  color: "#fff",
  fontWeight: "700",
},

  bottomPanel: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 16, paddingHorizontal: 12, backgroundColor: "#fff" },
  actionCard: { flex: 1, marginHorizontal: 4, borderWidth: 1, borderColor: "#D5B7FF", borderRadius: 14, backgroundColor: "#fff", padding: 12, alignItems: "center" },
  actionIconWrap: { height: 32, width: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  actionTextTop: { marginTop: 4, fontSize: 14, fontWeight: "700", color: "#6A00A8" },
});
