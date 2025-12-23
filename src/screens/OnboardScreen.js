import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackgroundPagesOne from "../components/BackgroundPages/BackgroundPagesOne";

/* ===== AVATARS DATA ===== */
const avatars = [
  { id: 1, src: require("../assets/boy1.jpg"), angle: 0 },
  { id: 2, src: require("../assets/boy2.jpg"), angle: 60 },
  { id: 3, src: require("../assets/boy3.jpg"), angle: 120 },
  { id: 4, src: require("../assets/boy4.jpg"), angle: 180 },
  { id: 5, src: require("../assets/girl1.jpg"), angle: 240 },
  { id: 6, src: require("../assets/girl2.jpg"), angle: 300 },
];

const RADIUS = 140;
const AVATAR_SIZE = 56;
const OFFSET = AVATAR_SIZE / 2;

const OnboardScreen = ({ navigation }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;

  /* ===== ROTATION ===== */
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  /* ===== BLINK EFFECT ===== */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.7,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* ===== AUTH CHECK ===== */
  useEffect(() => {
    const timer = setTimeout(async () => {
      const token = await AsyncStorage.getItem("twittoke");
      const user_id = await AsyncStorage.getItem("user_id");

      navigation.reset({
        index: 0,
        routes: [{ name: token && user_id ? "Home" : "Login" }],
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <BackgroundPagesOne>
      <View style={styles.container}>
        <View style={styles.centerWrapper}>
          {/* ===== FLYING AVATARS ===== */}
          <Animated.View style={{ transform: [{ rotate }] }}>
            {avatars.map((item) => {
              const rad = (item.angle * Math.PI) / 180;
              return (
                <Image
                  key={item.id}
                  source={item.src}
                  style={[
                    styles.smallAvatar,
                    {
                      transform: [
                        { translateX: RADIUS * Math.cos(rad) - OFFSET },
                        { translateY: RADIUS * Math.sin(rad) - OFFSET },
                      ],
                    },
                  ]}
                />
              );
            })}
          </Animated.View>

          {/* ===== CENTER IMAGE ===== */}
          <View style={styles.outerRing}>
            <Animated.View
              style={[
                styles.innerRing,
                {
                  transform: [{ scale: blinkAnim }],
                  opacity: blinkAnim,
                },
              ]}
            >
              <Image
                source={require("../assets/man.png")}
                style={styles.mainAvatar}
              />
            </Animated.View>
          </View>
        </View>

        {/* ===== TEXT ===== */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to LOCAL FRIEND.</Text>
          <Text style={styles.subtitle}>
            Meet new people who vibe with you{"\n"}
            Smart matching. No awkward small talk.{"\n"}
            Safe, kind, real interactions.
          </Text>
        </View>
      </View>
    </BackgroundPagesOne>
  );
};

export default OnboardScreen;

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  centerWrapper: {
    width: 320,
    height: 320,
    alignItems: "center",
    justifyContent: "center",
  },

  outerRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    zIndex: 1,
  },

  innerRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  mainAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    resizeMode: "cover",
  },

  /* ===== SMALL AVATARS ===== */
  smallAvatar: {
    position: "absolute",
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 10,
  },

  textContainer: {
    marginTop: 60,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  subtitle: {
    color: "#ccc",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
