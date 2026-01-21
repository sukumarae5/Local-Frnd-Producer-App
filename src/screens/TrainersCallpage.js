import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import { useDispatch, useSelector } from "react-redux";
import { startCallRequest } from "../features/calls/callAction";
import { SocketContext } from "../socket/SocketProvider";

const TrainersCallPage = ({ navigation }) => {
  /* ================= HOOKS (ORDER MUST NEVER CHANGE) ================= */
  const dispatch = useDispatch();
  const { socketRef, connected } = useContext(SocketContext);
  const { userdata } = useSelector((state) => state.user);

  const hasNavigatedRef = useRef(false);

  const [callingRandom, setCallingRandom] = useState(false);
  const [callingRandomVideo, setCallingRandomVideo] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const gender = userdata?.user?.gender;
  const myId = userdata?.user?.user_id;

  /* ================= RESET WHEN SCREEN IS SHOWN ================= */
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      hasNavigatedRef.current = false;
      setCallingRandom(false);
      setCallingRandomVideo(false);
    });

    return unsubscribe;
  }, [navigation]);

  /* ================= SOCKET DEBUG ================= */
  useEffect(() => {
    if (!connected || !socketRef.current) return;
    console.log("🧪 Socket connected:", socketRef.current.id);
  }, [connected]);

  /* ================= CALL MATCHED ================= */
  useEffect(() => {
    if (!connected || !socketRef.current) return;

    const socket = socketRef.current;

    const onMatched = (data) => {
      if (!data?.session_id) return;
      if (hasNavigatedRef.current) return;

      hasNavigatedRef.current = true;
      setCallingRandom(false);
      setCallingRandomVideo(false);

      const callType = data.call_type || data.type || "AUDIO";

      console.log("📥 Call matched:", data);

      if (callType === "VIDEO") {
        navigation.navigate("VideocallScreen", {
          session_id: data.session_id,
          peer_id: data.peer_id,
          role: "caller",
        });
      } else {
        navigation.navigate("AudiocallScreen", {
          session_id: data.session_id,
          peer_id: data.peer_id,
          role: "caller",
        });
      }
    };

    socket.on("call_matched", onMatched);

    return () => {
      socket.off("call_matched", onMatched);
    };
  }, [connected, navigation]);

  /* ================= AUDIO CALL ================= */
  const startRandomAudioCall = () => {
    if (callingRandom) return;

    if (!connected) {
      Alert.alert("Connecting", "Please wait, connecting to server...");
      return;
    }

    if (!gender) {
      Alert.alert("Profile incomplete", "Update gender first");
      return;
    }

    hasNavigatedRef.current = false;
    setCallingRandom(true);

    dispatch(
      startCallRequest({
        call_type: "AUDIO",
        gender,
      })
    );
  };

  /* ================= VIDEO CALL ================= */
  const startRandomVideoCall = () => {
    if (callingRandomVideo) return;

    if (!connected) {
      Alert.alert("Connecting", "Please wait, connecting to server...");
      return;
    }

    if (!gender) {
      Alert.alert("Profile incomplete", "Update gender first");
      return;
    }

    hasNavigatedRef.current = false;
    setCallingRandomVideo(true);

    dispatch(
      startCallRequest({
        call_type: "VIDEO",
        gender,
      })
    );
  };

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      <LinearGradient colors={["#4B0082", "#2E004D"]} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Personal Training</Text>
          <View style={styles.wallet}>
            <Icon name="wallet-outline" size={18} color="#FFC300" />
            <Text style={styles.walletText}>Coins</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.randomWrapper}>
        <TouchableOpacity
          style={[styles.randomButton, callingRandom && { opacity: 0.6 }]}
          onPress={startRandomAudioCall}
          disabled={callingRandom}
        >
          <Feather name="phone-call" size={26} color="#fff" />
          <Text style={styles.randomText}>
            {callingRandom ? "Connecting…" : "Random Audio Call"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.randomButton,
            styles.videoButton,
            callingRandomVideo && { opacity: 0.6 },
          ]}
          onPress={startRandomVideoCall}
          disabled={callingRandomVideo}
        >
          <Feather name="video" size={26} color="#fff" />
          <Text style={styles.randomText}>
            {callingRandomVideo ? "Connecting…" : "Random Video Call"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listWrapper}>
        {onlineUsers.length === 0 ? (
          <Text style={styles.emptyText}>No users online right now</Text>
        ) : (
          <FlatList
            data={onlineUsers.filter((id) => String(id) !== String(myId))}
            keyExtractor={(item) => String(item)}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.callBox}>
                <Text style={styles.callTitle}>User ID: {item}</Text>
                <Feather name="phone" size={22} color="#fff" />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default TrainersCallPage;



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#130018",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  wallet: {
    flexDirection: "row",
    backgroundColor: "#3A003F",
    padding: 8,
    borderRadius: 20,
  },
  walletText: {
    color: "#fff",
    marginLeft: 6,
  },
  randomWrapper: {
    padding: 20,
  },
  randomButton: {
    backgroundColor: "#A100D7",
    height: 70,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 15,
  },
  videoButton: {
    backgroundColor: "#FF005C",
  },
  randomText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  listWrapper: {
    flex: 1,
    padding: 20,
  },
  callBox: {
    backgroundColor: "#6A00A8",
    height: 65,
    borderRadius: 14,
    marginBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  callTitle: {
    color: "#fff",
    fontSize: 15,
  },
  emptyText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 40,
  },
});