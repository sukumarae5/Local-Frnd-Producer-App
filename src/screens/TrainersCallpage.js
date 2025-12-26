import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { audioCallRequest } from "../features/calls/callAction";
import { getSocket } from "../socket/globalSocket";

const TrainersCallPage = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const myId = useSelector((state) => state.user?.userdata?.user?.user_id);
  const gender = useSelector((state) => state.user?.userdata?.user?.gender);

  /* ================= SOCKET ================= */
  useEffect(() => {
    let mounted = true;

    (async () => {
      const socket = await getSocket();
      if (!socket || !mounted) return;

      socket.on("call_matched", ({ session_id, role }) => {
        navigation.navigate("AudiocallScreen", {
          session_id,
          role,
          my_id: myId,
        });
      });
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleAudioCall = () => {
    dispatch(audioCallRequest({ call_type: "AUDIO", gender }));
  };

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#130018" },
  header: { paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15 },
  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },
  wallet: {
    flexDirection: "row",
    backgroundColor: "#3A003F",
    padding: 8,
    borderRadius: 20,
  },
  walletText: { color: "#fff", marginLeft: 6 },
  callBtnWrapper: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    padding: 20,
  },
  callBox: {
    backgroundColor: "#A100D7",
    height: 80,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  callTitle: { color: "#fff", marginBottom: 6 },
});
