import React from "react";
import { View, Text, StyleSheet, Image, StatusBar } from "react-native";
import WelcomeScreenbackgroungpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";
import Svg, { Defs, ClipPath, Path, Image as SvgImage } from "react-native-svg";

/* ---------------- HEART IMAGE COMPONENT ---------------- */
const HeartImage = ({ source, size = 150 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <ClipPath id="clipHeart">
        <Path
          d="
            M50 82
            C20 60 10 45 10 30
            A20 20 0 0 1 50 30
            A20 20 0 0 1 90 30
            C90 45 80 60 50 82
            Z
          "
        />
      </ClipPath>
    </Defs>

    {/* Heart clipped image */}
    <SvgImage
      width="100%"
      height="100%"
      href={source}
      clipPath="url(#clipHeart)"
      preserveAspectRatio="xMidYMid slice"
    />

    {/* Heart border */}
    <Path
      d="
        M50 82
        C20 60 10 45 10 30
        A20 20 0 0 1 50 30
        A20 20 0 0 1 90 30
        C90 45 80 60 50 82
        Z
      "
      fill="none"
      stroke="#c464ff"
      strokeWidth="1"
    />
  </Svg>
);

/* ---------------- MAIN SCREEN ---------------- */
const PerfectMatchScreen = ({ route }) => {
  const user1 = route?.params?.user1 || {
    name: "anushka",
    image: require("../assets/girl2.jpg"),
  };

  const user2 = route?.params?.user2 || {
    name: "anvesh",
    image: require("../assets/boy1.jpg"),
  };

  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Floating hearts */}
        <Image
          source={require("../assets/smallheart1.png")}
          style={[styles.heart2, { top: 120, left: 40 }]}
        />
        <Image
          source={require("../assets/smallheart1.png")}
          style={[styles.heart3, { top: 140, left: 330 }]}
        />
        
        <Image
          source={require("../assets/smallheart.png")}
          style={[styles.heart, { top: 170, right: 190 }]}
        />
        <Image
          source={require("../assets/smallheart.png")}
          style={[styles.heart1, { bottom: 200, left: 50 }]}
        />
        <Image
          source={require("../assets/smallheart1.png")}
          style={[styles.heart1, { bottom: 220, right: 60 }]}
        />

        {/* Profiles */}
        <View style={styles.profileRow}>
          <View style={styles.profileBlock}>
            <HeartImage source={user1.image} size={170} />
            <Text style={styles.name}>{user1.name}</Text>
          </View>

          <View style={styles.profileBlock}>
            <HeartImage source={user2.image} size={170} />
            <Text style={styles.name}>{user2.name}</Text>
          </View>
        </View>

        {/* Match Text */}
        <Text style={styles.matchText}>Perfect Match</Text>
        <Text style={styles.congrats}>Congratulations!</Text>
      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default PerfectMatchScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 40,
  },

  profileBlock: {
    alignItems: "center",
  },

  name: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },

  matchText: {
    color: "#ce7df7",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 50,
  },

  congrats: {
    color: "#ce7df7",
    fontSize: 30,
    fontWeight: "700",
    
  },

  heart1: {
    // width: 50,
    // height: 30,
    marginBottom:160,
    position: "absolute",
    tintColor: "#B028FF",
  },
   heart: {
    marginBottom:160,
    position: "absolute",
    tintColor: "#B028FF",
  },
   heart2: {
    marginTop:110,
    position: "absolute",
    tintColor: "#B028FF",
  },
  heart3: {
    marginTop:110,
    left:100,
    position: "absolute",
    tintColor: "#B028FF",
  },
});
