import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const wp = (v) => (width * v) / 100;
const hp = (v) => (height * v) / 100;

const ActiveDostSectionScreen = () => {
  return (
    <View>
      <Text style={styles.sectionLabel}>Active Dost</Text>

      <Text style={styles.placeholderText}>
        No active dost right now...
      </Text>
    </View>
  );
};

export default ActiveDostSectionScreen;

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: wp(5),
    fontWeight: "700",
    color: "#111",
     paddingTop: hp(2),
    paddingHorizontal: wp(4),
  },

  placeholderText: {
    fontSize: wp(3.5),
    color: "#777",
    marginTop: hp(1),
    paddingHorizontal: wp(4),
    alignContent: "center",
  },
});
