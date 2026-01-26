import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode"; 
import WelcomeScreenbackgroundgpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";

const rotatingItems = [
  { id: 1, type: "image", src: require("../assets/boy1.jpg"), size: 52, angle: 2 },
  { id: 2, type: "icon", src: require("../assets/callicon.png"), size: 30, angle: 80 },
  { id: 3, type: "image", src: require("../assets/boy3.jpg"), size: 52, angle: 140 },
  { id: 4, type: "image", src: require("../assets/boy4.jpg"), size: 52, angle: 210 },
  { id: 5, type: "icon", src: require("../assets/Location.png"), size: 38, angle: 300 },
  { id: 6, type: "icon", src: require("../assets/audioicon.png"), size: 70, angle: 170 },
  { id: 7, type: "icon", src: require("../assets/Videocharticon.png"), size: 70, angle: 40 },
];

const RADIUS = 130;

const WelcomeScreen02 = ({ navigation }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  /* 🔄 ROTATION ANIMATION */
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const nextfunction = async () => {
    try {
      const token = await AsyncStorage.getItem("twittoke");
      const gender = await AsyncStorage.getItem("gender");

      console.log("🔑 TOKEN FROM STORAGE:", token);
      console.log("⚧ GENDER FROM STORAGE:", gender);

      if (!token || !gender) {
        console.log("❌ No token or gender, going to WelcomeScreen03");
        navigation.replace("WelcomeScreen03");
        return;
      }

      let decoded;
      try {
        decoded = jwtDecode(token);
      } catch (err) {
        console.log("❌ Invalid token, clearing storage");
        await AsyncStorage.clear();
        navigation.replace("WelcomeScreen03");
        return;
      }

      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        console.log("⏰ Token expired, clearing storage");
        await AsyncStorage.clear();
        navigation.replace("WelcomeScreen03");
        return;
      }

      console.log("🟢 Token valid, auto login now");

      

      if (gender === "Male") {
        navigation.replace("MaleHomeTabs");
      } else {
        navigation.replace("ReceiverBottomTabs");
      }

    } catch (error) {
      console.log("❌ Auto login error:", error);
      navigation.replace("WelcomeScreen03");
    }
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <WelcomeScreenbackgroundgpage>
      <View style={styles.container}>

        <Image
          source={require("../components/BackgroundPages/main_log1.png")}
          style={styles.logo}
        />

        <View style={styles.centerWrapper}>
          <View style={styles.dottedCircle} />

          <Animated.View style={{ transform: [{ rotate }] }}>
            {rotatingItems.map(item => {
              const rad = (item.angle * Math.PI) / 180;
              const size = item.size;
              const offset = size / 2;

              return (
                <Image
                  key={item.id}
                  source={item.src}
                  style={{
                    position: "absolute",
                    width: size,
                    height: size,
                    resizeMode: "contain",
                    borderRadius: item.type === "image" ? size / 2 : 0,
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

          <Image
            source={require("../assets/vedioicon.png")}
            style={styles.videoIcon}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>You can share chat, and</Text>
          <Text style={styles.title}>video call with your match</Text>
        </View>

        <View style={styles.bottomWrapper}>
          <Text
            style={styles.backText}
            onPress={() => navigation.navigate("OnboardScreen")}
          >
            Back
          </Text>

          <View style={styles.paginationWrapper}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>

          {/* 🔥 NEXT BUTTON */}
          <Text
            style={styles.nextText}
            onPress={nextfunction}
          >
            Next
          </Text>
        </View>

      </View>
    </WelcomeScreenbackgroundgpage>
  );
};

export default WelcomeScreen02;

/* ===== STYLES ===== */
const styles = StyleSheet.create({

  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
  },
  logo: {
    width: 100,
    height: 140,
    resizeMode: "contain",
    marginBottom: 55,
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
    opacity: 0.8,
  },
  videoIcon: {
    width: 40,
    height: 40,
    tintColor: "#BC76FD",
    resizeMode: "contain",
  },

  textContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
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
  backText: { fontSize: 14, color: "#999", fontWeight: "600" },
  nextText: { fontSize: 14, color: "#9747FF", fontWeight: "600" },
  paginationWrapper: { flexDirection: "row", alignItems: "center" },
  dot: {
    width: 6,
    height: 6,
    marginHorizontal: 3,
    borderRadius: 3,
    backgroundColor: "#D9BFFB",
  },
  dotActive: { width: 18, backgroundColor: "#9747FF" },
});
