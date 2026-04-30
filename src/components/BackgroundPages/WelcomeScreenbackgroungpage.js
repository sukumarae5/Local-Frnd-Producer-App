import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const WelcomeScreenbackgroungpage = ({ children }) => {
  return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
    <View style={styles.wrapper}>

      {/* TOP BG IMAGE */}
      <Image
        source={require("./Bg.png")}
        style={styles.topBg}
        pointerEvents="none"
      />

      {/* CHILDREN CONTENT */}
      <View style={styles.content}>
        {children}
      </View>

      {/* BOTTOM BG IMAGE */}
      <Image
        source={require("./Bg1.png")}
        style={styles.bottomBg}
        pointerEvents="none"
      />

    </View>
    </SafeAreaView>
  );
};

export default WelcomeScreenbackgroungpage;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  topBg: {
    position: "absolute",
    top: -80,
    left: -100,
    width: width * 1.8,
    height: height * 0.6,
    resizeMode: "contain",
    opacity: 0.85,
    zIndex: -1,
  },

  content: {
    flex: 1,
    width: "100%",
    // ⛔ Removed center alignment
  },

  bottomBg: {
    position: "absolute",
    bottom: -40,
    left: -10,
    width: width * 0.9,
    height: height * 0.45,
    resizeMode: "contain",
    zIndex: -1,
  },
});
