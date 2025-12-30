import React, { useEffect, useRef, useState } from "react";
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
import { getSocket } from "../socket/globalSocket";

const TrainersCallPage = ({ navigation }) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  /* ================= REDUX ================= */
  const callState = useSelector((state) => state.calls);
  const { userdata } = useSelector((state) => state.user);

  const myId = userdata?.user?.user_id;
  const gender = userdata?.user?.gender;

  console.log("MY ID:", myId);
  console.log("MY GENDER:", gender);
  console.log("CALL STATE:", callState);

  /* ================= LOCAL STATE ================= */
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [callingRandom, setCallingRandom] = useState(false);

  /* ================= SOCKET (ONLY FOR PRESENCE) ================= */
  useEffect(() => {
    let mounted = true;

    const initSocket = async () => {
      const socket = await getSocket();
      if (!socket || !mounted) return;

      socketRef.current = socket;

      socket.emit("get_online_users");

      socket.off("online_users");
      socket.on("online_users", (users) => {
        setOnlineUsers(users);
      });
    };

    initSocket();

    return () => {
      mounted = false;
      socketRef.current?.off("online_users");
    };
  }, []);

useEffect(() => {
  const initSocket = async () => {
    const socket = await getSocket();

    socket.off("call_matched");
    socket.on("call_matched", (data) => {
      console.log("📥 FE(MALE) ← socket call_matched", data);

      navigation.navigate("AudiocallScreen", data);
    });
  };

  initSocket();
}, []);


 

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
    console.log("📤 FE → REST random-connect", {
    user: myId,
    gender,
    type: "AUDIO",
  });

    setCallingRandom(true);

    dispatch(
      audioCallRequest({
        call_type: "AUDIO",
        gender,
      })
    );
  };

  /* ================= DIRECT CALL ================= */
  const startCallWithUser = (targetUserId) => {
    dispatch(
      audioCallRequest({
        call_type: "AUDIO",
        target_user_id: targetUserId,
      })
    );
  };

  /* ================= UI ================= */
  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.callBox}
      onPress={() => startCallWithUser(item)}
    >
      <Text style={styles.callTitle}>User ID: {item}</Text>
      <Feather name="phone" size={22} color="#fff" />
    </TouchableOpacity>
  );

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

      {/* ONLINE USERS */}
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