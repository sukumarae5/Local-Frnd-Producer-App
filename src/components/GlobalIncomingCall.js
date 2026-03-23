import React from "react";
import { useSelector } from "react-redux";
import { View, StyleSheet } from "react-native";
import IncomingCallScreen from "../screens/IncomingCallScreen";

const GlobalIncomingCall = ({ navigationRef }) => {

  const incomingCall = useSelector(state => state.calls.incomingCall);
  const call = useSelector(state => state.calls.call);

  if (!incomingCall || incomingCall.call_mode !== "FRIEND") return null;

  if (call?.status === "ACCEPTED" || call?.status === "REJECTED") {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <IncomingCallScreen
  navigation={navigationRef.current} // ✅ FIXED
  route={{ params: incomingCall }}
/>
    </View>
  );
};

export default GlobalIncomingCall;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,        // ✅ VERY IMPORTANT
    elevation: 9999,     // ✅ ANDROID FIX
  }
});