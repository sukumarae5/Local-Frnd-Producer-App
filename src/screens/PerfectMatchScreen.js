// PerfectMatchScreen.js

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";

import { useSelector, useDispatch } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import WelcomeScreenbackgroungpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";
import Svg, { Defs, ClipPath, Path, Image as SvgImage } from "react-native-svg";

import { callDetailsRequest } from "../features/calls/callAction";

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
  const dispatch = useDispatch();
  const navigatedRef = useRef(false);

  const { call_type, session_id } = route.params || {};

  /* ---------------- REDUX ---------------- */

  const call = useSelector(state => state.calls?.call);
  const connectedCallDetails = useSelector(
    state => state.calls?.connectedCallDetails
  );

  const myId = useSelector(
    state => state.auth?.user?.user_id
  );

  /* ---------------- FETCH CALL DETAILS ---------------- */

  useEffect(() => {
    if (session_id) {
      dispatch(callDetailsRequest());
    }
  }, [session_id]);

  /* ---------------- SAFELY RESOLVE USERS ---------------- */

  const caller = connectedCallDetails?.caller;
  const connectedUser = connectedCallDetails?.connected_user;

  const me =
    String(caller?.user_id) === String(myId)
      ? caller
      : connectedUser;

  const other =
    String(caller?.user_id) === String(myId)
      ? connectedUser
      : caller;

  /* ---------------- AUTO NAVIGATION AFTER 2s ---------------- */

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
  }, [session_id, call_type]);

  /* ---------------- STATUS BASED NAVIGATION ---------------- */

  useEffect(() => {
    if (!call?.status) return;
    if (call.session_id !== session_id) return;

    const status = String(call.status).toUpperCase();

    if (status === "ACCEPTED" || status === "CONNECTED") {
      if (navigatedRef.current) return;
      navigatedRef.current = true;

      navigation.replace(
        call.call_type === "VIDEO"
          ? "VideocallScreen"
          : "AudiocallScreen",
        {
          session_id: call.session_id,
        }
      );
    }
  }, [call?.status]);

  /* ---------------- LOADING GUARD ---------------- */

  if (!caller || !connectedUser) {
    return (
      <WelcomeScreenbackgroungpage>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ce7df7" />
        </View>
      </WelcomeScreenbackgroungpage>
    );
  }

  /* ---------------- UI ---------------- */

  /* ---------------- UI ---------------- */

return (
  <WelcomeScreenbackgroungpage>
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Floating Hearts */}
      <Text style={[styles.floatingHeart, { top: 120, left: 40 }]}>💜</Text>
      <Text style={[styles.floatingHeart, { top: 100, right: 50 }]}>💜</Text>
      <Text style={[styles.floatingHeart, { bottom: 200, left: 60 }]}>💜</Text>
      <Text style={[styles.floatingHeart, { bottom: 180, right: 60 }]}>💜</Text>

      {/* Profiles */}
      <View style={styles.profileRow}>
        <View style={styles.profileBlock}>
          {me?.avatar && (
            <>
              <HeartImage source={{ uri: me.avatar }} size={180} />
              <Text style={styles.name}>{me.name}</Text>
            </>
          )}
        </View>

        <View style={styles.profileBlock}>
          {other?.avatar && (
            <>
              <HeartImage source={{ uri: other.avatar }} size={180} />
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

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  profileRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
    marginBottom: 50,
  },

  profileBlock: {
    alignItems: "center",
  },

  name: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },

  matchText: {
    color: "#c464ff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
  },

  congrats: {
    color: "#c464ff",
    fontSize: 32,
    fontWeight: "700",
    fontStyle: "italic",
  },

  floatingHeart: {
    position: "absolute",
    fontSize: 22,
    opacity: 0.7,
  },
});