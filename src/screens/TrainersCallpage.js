import React, { useContext, useEffect, useState } from "react";
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
import { audioCallRequest } from "../features/calls/callAction";
import { SocketContext } from "../socket/SocketProvider";

const TrainersCallPage = ({ navigation }) => {
  /* ================= HOOKS (ORDER MATTERS) ================= */
  const dispatch = useDispatch();
  const socketRef = useContext(SocketContext);
  const socket = socketRef?.current;

  const { userdata } = useSelector((state) => state.user);

  /* ================= DERIVED DATA ================= */
  const myId = userdata?.user?.user_id;
  const gender = userdata?.user?.gender; // "Male"

  /* ================= LOCAL STATE ================= */
  const [callingRandom, setCallingRandom] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  /* ================= SOCKET: CALL MATCHED ================= */
  useEffect(() => {
    if (!socket) return;

    const onMatched = (data) => {
      console.log("📥 FE(MALE) call_matched:", data);
      setCallingRandom(false); // reset state
      navigation.replace("AudiocallScreen", data);
    };

    socket.on("call_matched", onMatched);

    return () => {
      socket.off("call_matched", onMatched);
    };
  }, [socket, navigation]);

  /* ================= RANDOM AUDIO CALL ================= */
  const startRandomAudioCall = () => {
    if (callingRandom) return;

    if (!gender) {
      Alert.alert(
        "Profile incomplete",
        "Please update your gender to start a call."
      );
      return;
    }

    setCallingRandom(true);

    console.log("📤 FE → dispatch audioCallRequest", {
      gender,
      type: "AUDIO",
    });

    dispatch(
      audioCallRequest({
        call_type: "AUDIO",
        gender, // "Male"
      })
    );
  };

  /* ================= DIRECT CALL (OPTIONAL) ================= */
  const startCallWithUser = (targetUserId) => {
    dispatch(
      audioCallRequest({
        call_type: "AUDIO",
        target_user_id: targetUserId,
      })
    );
  };

  /* ================= UI HELPERS ================= */
  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.callBox}
      onPress={() => startCallWithUser(item)}
    >
      <Text style={styles.callTitle}>User ID: {item}</Text>
      <Feather name="phone" size={22} color="#fff" />
    </TouchableOpacity>
  );

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={["#4B0082", "#2E004D"]} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Personal Training</Text>

          <View style={styles.wallet}>
            <Icon name="wallet-outline" size={18} color="#FFC300" />
            <Text style={styles.walletText}>Coins</Text>
          </View>
        </View>
      </LinearGradient>

      {/* RANDOM AUDIO CALL */}
      <View style={styles.randomWrapper}>
        <TouchableOpacity
          style={[
            styles.randomButton,
            callingRandom && { opacity: 0.6 },
          ]}
          onPress={startRandomAudioCall}
          disabled={callingRandom}
        >
          <Feather name="phone-call" size={26} color="#fff" />
          <Text style={styles.randomText}>
            {callingRandom ? "Connecting…" : "Random Audio Call"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ONLINE USERS (OPTIONAL) */}
      <View style={styles.listWrapper}>
        {onlineUsers.length === 0 ? (
          <Text style={styles.emptyText}>
            No users online right now
          </Text>
        ) : (
          <FlatList
            data={onlineUsers.filter(
              (id) => String(id) !== String(myId)
            )}
            keyExtractor={(item) => String(item)}
            renderItem={renderUser}
          />
        )}
      </View>
    </View>
  );
};

export default TrainersCallPage;

/* ================= STYLES ================= */
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