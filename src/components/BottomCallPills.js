import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const BottomCallPills = ({
  callingRandom,
  callingRandomVideo,
  onRandomAudio,
  onRandomVideo,
}) => {
  return (
    <View style={styles.bottomWhiteArea}>
      {/* Random audio */}
      <TouchableOpacity style={styles.bottomPill} onPress={onRandomAudio}>
        <MaterialIcons name="call" size={16} color="#fff" />

        <View style={styles.pillTextWrap}>
          <Text style={styles.pillTitle}>
            {callingRandom ? "Connecting..." : "Random"}
          </Text>
          <Text style={styles.pillSub}>audio call</Text>
        </View>
      </TouchableOpacity>

      {/* Random video */}
      <TouchableOpacity style={styles.bottomPill} onPress={onRandomVideo}>
        <MaterialIcons name="videocam" size={16} color="#fff" />

        <View style={styles.pillTextWrap}>
          <Text style={styles.pillTitle}>
            {callingRandomVideo ? "Connecting..." : "Random"}
          </Text>
          <Text style={styles.pillSub}>video call</Text>
        </View>
      </TouchableOpacity>

      {/* Locked calls */}
      <View style={[styles.bottomPill, styles.lockedPill]}>
        <MaterialIcons name="lock" size={16} color="#fff" />

        <View style={styles.pillTextWrap}>
          <Text style={styles.pillTitle}>Random</Text>
          <Text style={styles.pillSub}>locked calls</Text>
        </View>
      </View>
    </View>
  );
};

export default BottomCallPills;

const styles = StyleSheet.create({
  bottomWhiteArea: {
    backgroundColor: "#fff",
    padding: 14,
    flexDirection: "row",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },

  bottomPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#9B2CF3",
  },

  lockedPill: {
    backgroundColor: "#C07BFF",
  },

  pillTextWrap: {
    marginLeft: 6,
    alignItems: "flex-start",
  },

  pillTitle: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 13,
  },

  pillSub: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 12,
  },
});