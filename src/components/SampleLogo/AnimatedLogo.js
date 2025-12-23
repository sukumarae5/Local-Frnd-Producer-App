import React, { useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

/* ================= ANIMATED CIRCLE ================= */
const AnimatedCircle = ({ delay }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1.3,
              duration: 2500,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 2500,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    const timeout = setTimeout(animate, delay);
    return () => clearTimeout(timeout);
  }, [delay, scale, opacity]);

  return (
    <Animated.View
      style={[
        styles.circle,
        {
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
};

/* ================= ANIMATED LOGO ================= */
const AnimatedLogo = ({ style }) => (
  <View style={[styles.center, style]}>
    {/* Animated circles */}
    {/* <AnimatedCircle delay={0} />
    <AnimatedCircle delay={800} />
    <AnimatedCircle delay={1600} /> */}

    {/* Gradient ring */}
    {/* <LinearGradient
      // colors={["#ff00ff", "#c724c7", "#7b2cff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    > */}
      {/* 🔥 ONLY IMAGE – NO WHITE BACKGROUND */}
      <Image
        source={require("../BackgroundPages/log4.png")}
        style={styles.logo}
      />
    {/* </LinearGradient> */}
  </View>
);

export default AnimatedLogo;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
    width: 300,
    height: 300,
    position: "relative",
  },

  gradient: {
    width: 160,        // ⬆ increased
    height: 160,       // ⬆ increased
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 70,
    left: 70,
    shadowColor: "#C724C7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },

  circle: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.2)",
    top: 20,
    left: 20,
  },

  logo: {
    width: 110,       // ⬆ increased image size
    height: 110,      // ⬆ increased image size
    resizeMode: "contain",
  },
});
