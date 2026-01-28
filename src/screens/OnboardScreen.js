import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WelcomeScreenbackgroundgpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";

/* ===== ROTATING IMAGES ===== */
const rotatingItems = [
  { id: 1, src: require("../assets/boy1.jpg"), type: "image", size: 52, angle: 0 },
  { id: 2, src: require("../assets/callicon.png"), type: "icon", size: 24, angle: 60 },
  { id: 3, src: require("../assets/boy3.jpg"), type: "image", size: 52, angle: 150 },
  { id: 4, src: require("../assets/man.png"), type: "image", size: 52, angle: 240 },
  { id: 5, src: require("../assets/Location.png"), type: "icon", size: 24, angle: 300 },
];

const RADIUS = 130;

const OnboardScreen = ({ navigation }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;

  /* ===== ROTATION ===== */
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  /* ===== DOUBLE RIPPLE EFFECT ===== */
  useEffect(() => {
    const animateRipple = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateRipple(ripple1, 0);
    animateRipple(ripple2, 800);
  }, []);

  /* ===== AUTO NAVIGATION ===== */
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("WelcomeScreen02");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  /* ===== RIPPLE STYLES ===== */
  const rippleStyle1 = {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(226, 133, 251, 0.3)",
    transform: [
      {
        scale: ripple1.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.8],
        }),
      },
    ],
    opacity: ripple1.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    }),
  };

  const rippleStyle2 = {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(226, 133, 251, 0.3)",
    transform: [
      {
        scale: ripple2.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.8],
        }),
      },
    ],
    opacity: ripple2.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    }),
  };

  return (
    <WelcomeScreenbackgroundgpage>    
      <View style={styles.container}>

        {/* LOGO */}
        <Image
          source={require("../components/BackgroundPages/main_log1.png")}
          style={styles.logo}
        />

        {/* CENTER AREA */}
        <View style={styles.centerWrapper}>

          {/* DOTTED ORBIT */}
          <View style={styles.dottedCircle} />

          {/* ROTATING ITEMS */}
          <Animated.View style={{ transform: [{ rotate }] }}>
            {rotatingItems.map(item => {
              const rad = (item.angle * Math.PI) / 180;
              const offset = item.size / 2;

              return (
                <Image
                  key={item.id}
                  source={item.src}
                  style={{
                    position: "absolute",
                    width: item.size,
                    height: item.size,
                    resizeMode: "contain",
                    borderRadius: item.type === "image" ? item.size / 2 : 0,
                    borderWidth: item.type === "image" ? 2 : 0,
                    borderColor: item.type === "image" ? "#fff" : "transparent",
                    transform: [
                      { translateX: RADIUS * Math.cos(rad) - offset },
                      { translateY: RADIUS * Math.sin(rad) - offset },
                    ],
                  }}
                />
              );
            })}
          </Animated.View>

          {/* DOUBLE RIPPLE */}
          <Animated.View style={rippleStyle1} />
          <Animated.View style={rippleStyle2} />

          {/* CENTER AVATAR */}
          <View style={styles.innerRing}>
            <Image
              source={require("../assets/girl1.jpg")}
              style={styles.mainAvatar}
            />
          </View>
        </View>

        {/* TEXT */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>It’s easy to find a soulmate</Text>
          <Text style={styles.subtitle}>nearby & around you</Text>
        </View>

        {/* BOTTOM PAGINATION */}
        <View style={styles.bottomWrapper}>
          <Text style={styles.backText}>Back</Text>
          <View style={styles.paginationWrapper}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <Text style={styles.nextText} onPress={() => navigation.navigate("WelcomeScreen02")}>
            Next
          </Text>
        </View>

      </View>
    </WelcomeScreenbackgroundgpage>
  );
};

export default OnboardScreen;

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
  },
  logo: {
    marginTop: 20,
    width: 140,
    height: 140,
    resizeMode: "contain",
    marginBottom: 100,
  },
  centerWrapper: {
    width: 300,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  dottedCircle: {
    width: 270,
    height: 270,
    borderRadius: 140,
    borderWidth: 2,
    borderColor: "#C78CFF",
    borderStyle: "dotted",
    position: "absolute",
    opacity: 0.7,
  },
  innerRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#9B51E0",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  mainAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  textContainer: {
    marginTop: 70,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginTop: 4,
  },
  bottomWrapper: {
    width: "100%",
    position: "absolute",
    bottom: 40,
    paddingHorizontal: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "600",
  },
  nextText: {
    fontSize: 14,
    color: "#9747FF",
    fontWeight: "600",
  },
  paginationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D9BFFB",
  },
  dotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9747FF",
  },
});
