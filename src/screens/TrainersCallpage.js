import React, { useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import { useDispatch, useSelector } from "react-redux";
import { randomUserRequest } from "../features/RandomUsers/randomuserAction";
import { audioCallRequest } from "../features/calls/callAction";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MAIN_BASE_URL } from "../api/baseUrl1";

const { width, height } = Dimensions.get("window");
const AVATAR_SIZE = 70;
const GAP = 15;

const TrainersCallPage = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  const gender = useSelector(
    (state) => state.user?.userdata?.user?.gender
  );

  useEffect(() => {
    dispatch(randomUserRequest());
  }, []);

  /* SOCKET (JWT AUTH) */
  useEffect(() => {
    AsyncStorage.getItem("twittoke").then((token) => {
      if (!token) return;

      socketRef.current = io(MAIN_BASE_URL, {
        transports: ["websocket"],
        auth: { token },
      });

      socketRef.current.on("call_ready", (data) => {
        navigation.navigate("AudiocallScreen", {
          session_id: data.session_id,
          role: data.role,
        });
      });
    });

    return () => socketRef.current?.disconnect();
  }, []);

  const handleAudioCall = () => {
    dispatch(audioCallRequest({ call_type: "AUDIO", gender }));
  };

  /* animation logic untouched */

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#4B0082", "#2E004D"]} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Personal Training</Text>
          <View style={styles.wallet}>
            <Icon name="wallet-outline" size={18} color="#FFC300" />
            <Text style={styles.walletText}>100</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.callBtnWrapper}>
        <TouchableOpacity style={styles.callBox} onPress={handleAudioCall}>
          <Text style={styles.callTitle}>Random Audio Call</Text>
          <Feather name="phone" size={26} color="#fff" />
        </TouchableOpacity>
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
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },

  wallet: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A003F",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  walletText: {
    color: "#fff",
    marginLeft: 6,
  },

  mapContainer: {
    flex: 1,
  },

  loading: {
    color: "#fff",
    textAlign: "center",
    marginTop: 30,
  },

  avatarWrapper: {
    position: "absolute",
    alignItems: "center",
  },

  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: "#FF46D9",
    overflow: "hidden",
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  nameTag: {
    backgroundColor: "#FF00E6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 15,
    marginTop: 5,
  },

  nameText: {
    color: "#fff",
    fontSize: 12,
  },

  callBtnWrapper: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    paddingHorizontal: 20,
  },

  callBox: {
    backgroundColor: "#A100D7",
    height: 80,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  callTitle: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 6,
  },
});