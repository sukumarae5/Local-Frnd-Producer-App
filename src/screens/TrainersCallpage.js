// TrainersCallPage.js

import React, { useContext, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useDispatch, useSelector } from "react-redux";

import {
  callRequest,
  searchingFemalesRequest,
} from "../features/calls/callAction";

import { otherUserFetchRequest } from "../features/Otherusers/otherUserActions";
import { SocketContext } from "../socket/SocketProvider";

const { width } = Dimensions.get("window");
const CELL_WIDTH = width / 3 - 16;
const WAVE_DISTANCE = 18;

const TrainersCallPage = ({ navigation }) => {
  /* ---------------- HOOKS (DO NOT MOVE / DO NOT WRAP) ---------------- */

  const dispatch = useDispatch();
  const socketCtx = useContext(SocketContext);

  const callstatus = useSelector((state) => state.calls.call);
  const users = useSelector((state) => state.calls.searchingFemales || []);

  const hasNavigatedRef = useRef(false);
  const animRefs = useRef([]);

  const [callingRandom, setCallingRandom] = useState(false);
  const [callingRandomVideo, setCallingRandomVideo] = useState(false);

  const connected = socketCtx?.connected;

  /* ---------------- EFFECTS ---------------- */

  // Load searching females (polling)
  useEffect(() => {
    dispatch(searchingFemalesRequest());

    const interval = setInterval(() => {
      dispatch(searchingFemalesRequest());
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Animations (safe)
  useEffect(() => {
    animRefs.current = users.map(() => new Animated.Value(0));

    users.forEach((_, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animRefs.current[index], {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(animRefs.current[index], {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [users]);

  // Navigate once when call is connected
  useEffect(() => {
    if (!callstatus?.session_id) return;
    if (hasNavigatedRef.current) return;

    hasNavigatedRef.current = true;
    setCallingRandom(false);
    setCallingRandomVideo(false);

    navigation.navigate(
      callstatus.call_type === "VIDEO"
        ? "VideocallScreen"
        : "AudiocallScreen",
      {
        session_id: callstatus.session_id,
        role: "caller",
      }
    );
  }, [callstatus, navigation]);

  /* ---------------- ACTIONS ---------------- */

  const startRandomAudioCall = () => {
      if (!connected || callingRandom || callingRandomVideo) return;

    // if (!connected) {
    //   Alert.alert("Please wait", "Socket is connecting...");
    //   return;
    // }
    hasNavigatedRef.current = false;
    setCallingRandom(true);
    dispatch(callRequest({ call_type: "AUDIO" }));
        navigation.navigate("CallStatusScreen", { call_type: "AUDIO" });

  };

  const startRandomVideoCall = () => {
     if (!connected || callingRandom || callingRandomVideo) return;

    // if (!connected) {
    //   Alert.alert("Please wait", "Socket is connecting...");
    //   return;
    // }
    hasNavigatedRef.current = false;
    setCallingRandomVideo(true);
    dispatch(callRequest({ call_type: "VIDEO" }));
            navigation.navigate("CallStatusScreen", { call_type: "VIDEO" });

  };

  /* ---------------- RENDER ---------------- */

  return (
    <View style={styles.container}>
      <View style={styles.topWhite}>
        <Text style={styles.heading2}>Connecting Room</Text>
      </View>

      <LinearGradient colors={["#CE4BFB", "#9D00DB"]} style={styles.onlineContainer}>
        <Text style={styles.onlineTitle}>SEARCHING FEMALES</Text>

        <View style={styles.gridWrapper}>
          {users.map((item, index) => {
            const translateY =
              animRefs.current[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -WAVE_DISTANCE],
              }) || 0;

            return (
              <Animated.View
                key={item.session_id}   // ✅ UNIQUE
                style={[styles.itemCell, { transform: [{ translateY }] }]}
              >
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => {
                    dispatch(otherUserFetchRequest(item.user_id));
                    navigation.navigate("AboutScreen", {
                      userId: item.user_id,
                    });
                  }}
                >
                  <View style={styles.avatarWrapper}>
                    <View style={styles.onlineDot} />
                    <Image
                      source={require("../assets/boy1.jpg")}
                      style={styles.avatarImage}
                    />
                  </View>

                  <Text style={styles.nameText}>
                    User #{item.user_id}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </LinearGradient>

      <View style={styles.bottomPanel}>
        <TouchableOpacity style={styles.actionBtn} onPress={startRandomAudioCall}>
          <Text style={styles.actionText}>
            {callingRandom ? "Connecting…" : "Random Audio"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={startRandomVideoCall}>
          <Text style={styles.actionText}>
            {callingRandomVideo ? "Connecting…" : "Random Video"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TrainersCallPage;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFEAFD" },
  topWhite: {
    backgroundColor: "#FFF",
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heading2: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6A00A8",
    textAlign: "center",
  },
  onlineContainer: {
    flex: 1,
    padding: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  onlineTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 10,
  },
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
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
  },
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
    padding: 14,
    backgroundColor: "#fff",
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#6A00A8",
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
