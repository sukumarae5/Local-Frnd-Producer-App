import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SocketContext } from "../socket/SocketProvider";
import Ionicons from "react-native-vector-icons/Ionicons";
import { CommonActions } from "@react-navigation/native";

const IncomingCallScreen = ({ route, navigation }) => {

  const { session_id, call_type } = route.params;
  const { socketRef } = useContext(SocketContext);

  const accept = () => {
    socketRef.current.emit("call_accept", { session_id });
  };
// const accept = () => {
//   socketRef.current.emit("call_accept", { session_id });

//   navigation.dispatch(
//     CommonActions.navigate({
//       name: "CallStatusScreen",
//       params: {
//         session_id,
//         call_type,
//         role: "receiver",
//       },
//     })
//   );
// };

  const reject = () => {
    socketRef.current.emit("call_reject", { session_id });
  };

  return (
    <LinearGradient
      colors={["#E9C9FF", "#F4C9F2", "#FFD1E8"]}
      style={styles.container} pointerEvents="auto"  
    >

      {/* hearts background */}
      <Image
        source={require("../assets/leftheart.png")}
        style={styles.leftHeart}
      />
      <Image
        source={require("../assets/rightheart.png")}
        style={styles.rightHeart}
      />

      <Text style={styles.title}>Incoming {call_type} Call</Text>

      <View style={styles.avatarWrap}>
        <Image
          source={require("../assets/girl2.jpg")}
          style={styles.avatar}
        />
      </View>

      <Text style={styles.subtitle}>Someone is calling you…</Text>

      <View style={styles.row}>

        {/* Reject */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.reject]}
          onPress={reject}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={26} color="#fff" />
          <Text style={styles.btnText}>Reject</Text>
        </TouchableOpacity>

        {/* Accept */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.accept]}
          onPress={accept}
          activeOpacity={0.8}
        >
          <Ionicons
            name={call_type === "VIDEO" ? "videocam" : "call"}
            size={24}
            color="#fff"
          />
          <Text style={styles.btnText}>Accept</Text>
        </TouchableOpacity>

      </View>

    </LinearGradient>
  );
};

export default IncomingCallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },

  leftHeart: {
    position: "absolute",
    left: -30,
    top: 80,
    width: 120,
    height: 120,
    opacity: 0.25
  },

  rightHeart: {
    position: "absolute",
    right: -20,
    bottom: 120,
    width: 110,
    height: 110,
    opacity: 0.25
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#5A0066",
    marginBottom: 30
  },

  avatarWrap: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    borderColor: "#A943FF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    elevation: 8
  },

  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70
  },

  subtitle: {
    marginTop: 20,
    fontSize: 15,
    color: "#7a2a8a",
    fontWeight: "600"
  },

  row: {
    flexDirection: "row",
    marginTop: 60,
    gap: 40
  },

  actionBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6
  },

  accept: {
    backgroundColor: "#5BCF8E"
  },

  reject: {
    backgroundColor: "#FF6A6A"
  },

  btnText: {
    marginTop: 6,
    color: "#fff",
    fontSize: 12,
    fontWeight: "700"
  }
});
