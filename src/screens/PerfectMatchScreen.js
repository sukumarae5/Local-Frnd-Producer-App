// PerfectMatchScreen.js

import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, StatusBar } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import WelcomeScreenbackgroungpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";
import Svg, { Defs, ClipPath, Path, Image as SvgImage } from "react-native-svg";

/* ---------------- HEART IMAGE COMPONENT ---------------- */
const HeartImage = ({ source, size = 150 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <ClipPath id="clipHeart">
        <Path d="
          M50 82
          C20 60 10 45 10 30
          A20 20 0 0 1 50 30
          A20 20 0 0 1 90 30
          C90 45 80 60 50 82
          Z
        " />
      </ClipPath>
    </Defs>

    <SvgImage
      width="100%"
      height="100%"
      href={source}
      clipPath="url(#clipHeart)"
      preserveAspectRatio="xMidYMid slice"
    />

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

const PerfectMatchScreen = () => {

  const navigation = useNavigation();
  const route = useRoute();

  const { call_type, session_id } = route.params || {};

  const connectedCallDetails = useSelector(
    (state) => state?.calls?.connectedCallDetails
  );

  const myId = useSelector(
    (state) => state.auth?.user?.user_id
  );

  const me =
    connectedCallDetails?.caller?.user_id === myId
      ? connectedCallDetails?.caller
      : connectedCallDetails?.connected_user;

  const other =
    connectedCallDetails?.caller?.user_id === myId
      ? connectedCallDetails?.connected_user
      : connectedCallDetails?.caller;

  useEffect(() => {

    if (!session_id || !call_type) return;

    const t = setTimeout(() => {

      navigation.replace(
        call_type === "VIDEO"
          ? "VideocallScreen"
          : "AudiocallScreen",
        {
          session_id,
          role: "caller",
        }
      );

    }, 2000);

    return () => clearTimeout(t);

  }, [session_id, call_type, navigation]);

  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

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

        <View style={styles.profileRow}>

          <View style={styles.profileBlock}>
            {me?.avatar && (
              <>
                <HeartImage source={{ uri: me.avatar }} size={170} />
                <Text style={styles.name}>{me.name}</Text>
              </>
            )}
          </View>

          <View style={styles.profileBlock}>
            {other?.avatar && (
              <>
                <HeartImage source={{ uri: other.avatar }} size={170} />
                <Text style={styles.name}>{other.name}</Text>
              </>
            )}
          </View>

        </View>

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
    marginBottom: 160,
    position: "absolute",
    tintColor: "#B028FF",
  },
  heart: {
    marginBottom: 160,
    position: "absolute",
    tintColor: "#B028FF",
  },
  heart2: {
    marginTop: 110,
    position: "absolute",
    tintColor: "#B028FF",
  },
  heart3: {
    marginTop: 110,
    left: 100,
    position: "absolute",
    tintColor: "#B028FF",
  },
});
