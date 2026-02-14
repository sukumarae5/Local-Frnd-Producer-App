// CallStatusScreen.js

import React, { useEffect, useRef,useContext  } from "react";
import { View, Text, StyleSheet, Image, Animated } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSelector, useDispatch } from "react-redux";
import { callDetailsRequest } from "../features/calls/callAction";
import { SocketContext } from "../socket/SocketProvider";

/* ---------------- STATIC DATA ---------------- */
const smallAvatars = [
  require("../assets/girl1.jpg"),
  require("../assets/boy1.jpg"),
  require("../assets/girl2.jpg"),
  require("../assets/girl3.jpg"),
  require("../assets/boy2.jpg"),
];

const CENTER_SIZE = 150;
const SMALL_SIZE = 40;
const DOT_RADIUS = (CENTER_SIZE * 1.7) / 2;

const CallStatusScreen = ({ navigation, route }) => {


  const dispatch = useDispatch();
const { socketRef, connected } = useContext(SocketContext);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const navigatedRef = useRef(false);

  const call = useSelector((state) => state.calls?.call);
console.log(call)
  const call_type = route?.params?.call_type || "AUDIO";
  const role = route?.params?.role || "male";
useEffect(() => {
  console.log("CALL OBJECT =>", call);
}, [call]);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    );

    anim.start();

    return () => anim.stop();
  }, [rotateAnim]);
useEffect(() => {

  if (role !== "female") return;
  if (!connected || !socketRef.current) return;

  const socket = socketRef.current;

  const onIncomingCall = (data) => {

    if (navigatedRef.current) return;

    navigatedRef.current = true;

    const screen =
      data.call_type === "VIDEO"
        ? "VideocallScreen"
        : "AudiocallScreen";

    navigation.replace(screen, {
      session_id: data.session_id,
      role: "receiver",
    });
  };

  socket.on("incoming_call", onIncomingCall);

  return () => {
    socket.off("incoming_call", onIncomingCall);
  };

}, [role, connected, socketRef, navigation]);

  useEffect(() => {

    if (!call || !call.status) return;

    const status = call.status.toUpperCase();
    if (role === "male") {

      if (status === "RINGING") {

        if (navigatedRef.current) return;
        navigatedRef.current = true;

        dispatch(callDetailsRequest());

        navigation.replace("PerfectMatchScreen", {
          call_type: call.call_type,
          session_id: call.session_id,
        });

        return;
      }
    }

    if (status === "FAILED" || status === "CANCELED") {
      navigation.goBack();
    }

  }, [call, role, navigation, dispatch]);

  /* ---------------- UI ANIMATIONS ---------------- */
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    const anim = Animated.loop(
      Animated.parallel([
        Animated.timing(ripple1, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(1500),
          Animated.timing(ripple2, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    anim.start();

    return () => anim.stop();

  }, [ripple1, ripple2]);

  const rippleStyle1 = {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(225, 123, 253, 0.96)",
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
    backgroundColor: "rgba(196, 18, 245, 0.96)",
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
    <LinearGradient
      colors={["#E9C9FF", "#F4C9F2", "#FFD1E8"]}
      style={styles.container}
    >

      <View style={styles.topheats}>
        <Image
          source={require("../assets/leftheart.png")}
          style={styles.leftheart}
        />
        <Image
          source={require("../assets/rightheart.png")}
          style={styles.rightheart}
        />
      </View>

      <View style={{ height: 60 }} />

      <View style={styles.centerArea}>

        <Animated.View style={rippleStyle1} />
        <Animated.View style={rippleStyle2} />

        <View style={styles.dottedCircle} />

        <Animated.View style={styles.rotatingRing}>
          {smallAvatars.map((img, i) => {

            const angle =
              (i * (360 / smallAvatars.length)) * (Math.PI / 180);

            const r = DOT_RADIUS;

            return (
              <Image
                key={i}
                source={img}
                style={[
                  styles.smallAvatar,
                  {
                    transform: [
                      { translateX: r * Math.cos(angle) },
                      { translateY: r * Math.sin(angle) },
                    ],
                  },
                ]}
              />
            );
          })}
        </Animated.View>

        <View style={styles.centerCircle}>
          <Image
            source={require("../assets/girl2.jpg")}
            style={styles.centerImage}
          />
        </View>

      </View>

      <View style={styles.tag}>
        <Text style={styles.tagText}>
          {call_type === "VIDEO" ? "Video Call" : "Audio Call"}
        </Text>
      </View>

      <Text style={styles.searchingText}>
        {call?.status || "Initializing..."}
      </Text>

      <View style={{ flex: 1 }} />

      <Image
        source={require("../assets/smallheart1.png")}
        style={styles.bottomHeart}
      />

    </LinearGradient>
  );
};

export default CallStatusScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center" },

  topheats: {
    position: "absolute",
    top: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    zIndex: 10,
  },

  leftheart: { marginTop: 150, left: -40 },
  rightheart: { marginTop: 80, left: 40 },

  centerArea: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 270,
  },

  dottedCircle: {
    position: "absolute",
    width: CENTER_SIZE * 1.7,
    height: CENTER_SIZE * 1.7,
    borderRadius: (CENTER_SIZE * 2.4) / 2,
    borderWidth: 2,
    borderColor: "#C97CFF",
    borderStyle: "dotted",
    opacity: 0.6,
  },

  rotatingRing: {
    position: "absolute",
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },

  smallAvatar: {
    width: SMALL_SIZE,
    height: SMALL_SIZE,
    borderRadius: SMALL_SIZE / 2,
    borderWidth: 2,
    borderColor: "#fff",
    position: "absolute",
  },

  centerCircle: {
    width: CENTER_SIZE + 18,
    height: CENTER_SIZE + 18,
    borderRadius: (CENTER_SIZE + 20) / 2,
    borderWidth: 8,
    borderColor: "#A943FF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    elevation: 10,
  },

  centerImage: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
  },

  tag: {
    backgroundColor: "#A943FF",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginTop: 100,
  },

  tagText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  searchingText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#5A0066",
    marginTop: 12,
  },

  bottomHeart: {
    width: 35,
    height: 35,
    marginBottom: 200,
  },
});
