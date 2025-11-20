import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import LinearGradient from "react-native-linear-gradient";

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

const AnimatedLogo = ({ style }) => (
  <View style={[styles.center, style]}>
    {/* Animated circles behind the logo */}
    <AnimatedCircle delay={0} />
    <AnimatedCircle delay={800} />
    <AnimatedCircle delay={1600} />
    {/* Centered gradient and logo */}
    <LinearGradient colors={["#C724C7", "#C724C7"]} style={styles.gradient}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>L🤝F</Text>
      </View>
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
    width: 300,
    height: 300,
    position: "relative",
  },
  gradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 80,
    left: 80,
    shadowColor: "#C724C7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 4,
  },
  circle: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.2)",
    top: 30,
    left: 30,
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  logoText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#000",
  },
});

export default AnimatedLogo;
