import React, {
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView ,
  SafeAreaView,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { useDispatch, useSelector } from "react-redux";

import {
  callRequest,
  searchingFemalesRequest,
  directCallRequest,
} from "../features/calls/callAction";

import { otherUserFetchRequest } from "../features/Otherusers/otherUserActions";
import { SocketContext } from "../socket/SocketProvider";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const CELL_WIDTH = width / 3 - 18;
const WAVE_DISTANCE = 10;

const TrainersCallPage = ({ navigation }) => {

  const dispatch = useDispatch();
  const socketCtx = useContext(SocketContext);

  const callstatus = useSelector((state) => state.calls.call);
  const users = useSelector((state) => state.calls.searchingFemales || []);

  const hasNavigatedRef = useRef(false);
  const animRefs = useRef([]);

  const [callingRandom, setCallingRandom] = useState(false);
  const [callingRandomVideo, setCallingRandomVideo] = useState(false);
  const [callingDirect, setCallingDirect] = useState(false);

  const connected = socketCtx?.connected;

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    dispatch(searchingFemalesRequest());

    const interval = setInterval(() => {
      dispatch(searchingFemalesRequest());
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    animRefs.current = users.map(() => new Animated.Value(0));

    users.forEach((_, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animRefs.current[index], {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(animRefs.current[index], {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [users]);
  
  useFocusEffect(
    React.useCallback(() => {
      setCallingRandom(false);
      setCallingRandomVideo(false);
      setCallingDirect(false);
      hasNavigatedRef.current = false;
    }, [])
  );

  // useEffect(() => {
  //   if (!callstatus?.session_id) return;
  //   if (hasNavigatedRef.current) return;

  //   hasNavigatedRef.current = true;

  //   setCallingRandom(false);
  //   setCallingRandomVideo(false);
  //   setCallingDirect(false);

  //   navigation.navigate(
  //     callstatus.call_type === "VIDEO"
  //       ? "VideocallScreen"
  //       : "AudiocallScreen",
  //     {
  //       session_id: callstatus.session_id,
  //       role: "caller",
  //     }
  //   );
  // }, [callstatus, navigation]);

  /* ---------------- ACTIONS ---------------- */

  const startRandomAudioCall = () => {
    if (!connected || callingRandom || callingRandomVideo || callingDirect)
      return;

    hasNavigatedRef.current = false;
    setCallingRandom(true);

    dispatch(callRequest({ call_type: "AUDIO" }));
    navigation.navigate("CallStatusScreen", { call_type: "AUDIO",  role: "male", });
  };

  const startRandomVideoCall = () => {
    if (!connected || callingRandom || callingRandomVideo || callingDirect)
      return;

    hasNavigatedRef.current = false;
    setCallingRandomVideo(true);

    dispatch(callRequest({ call_type: "VIDEO" }));
    navigation.navigate("CallStatusScreen", { call_type: "VIDEO", role: "male", });
  };

  const startDirectCall = (item) => {
    if (!connected || callingRandom || callingRandomVideo || callingDirect)
      return;

    hasNavigatedRef.current = false;
    setCallingDirect(true);

    dispatch(
      directCallRequest({
        female_id: item.user_id,
        call_type: item.type,
      })
    );

    navigation.navigate("CallStatusScreen", {
      call_type: item.type,
    });
  };

  /* ---------------- RENDER ---------------- */

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* ---------------- TOP WHITE ---------------- */}
      <View style={styles.topWhiteArea}>
        <Text style={styles.lookText}>Local frnd</Text>
        <Text style={styles.pageTitle}>Connecting Room</Text>

        <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.filterRow}
>
  <View style={[styles.filterChip, styles.filterChipActive]}>
    <Text style={styles.filterTextActive}>ONLINE</Text>
  </View>

  <View style={styles.filterChip}>
    <Text style={styles.filterText}>Audio</Text>
  </View>

  <View style={styles.filterChip}>
    <Text style={styles.filterText}>Video</Text>
  </View>
  
  <View style={styles.filterChip}>
    <Text style={styles.filterText}>language</Text>
  </View>
  
  <View style={styles.filterChip}>
    <Text style={styles.filterText}>Location</Text>
  </View>
  
  <View style={styles.filterChip}>
    <Text style={styles.filterText}>ALL</Text>
  </View>

  <View style={styles.filterChip}>
    <Text style={styles.filterText}>ALL</Text>
  </View>

</ScrollView>

      </View>

      {/* ---------------- PURPLE USERS AREA ---------------- */}
      <LinearGradient
        colors={["#ee60f3", "#8B2CE2"]}
        style={styles.middlePurple}
      >
        <View style={styles.gridWrapper}>
          {users.map((item, index) => {

            const translateY =
              animRefs.current[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -WAVE_DISTANCE],
              }) || 0;

            return (
              <Animated.View
                key={item.session_id}
                style={[styles.itemCell, { transform: [{ translateY }] }]}
              >
                <TouchableOpacity
                  style={styles.userCard}
                  onPress={() => startDirectCall(item)}
                  onLongPress={() => {
                    dispatch(otherUserFetchRequest(item.user_id));
                    navigation.navigate("AboutScreen", {
                      userId: item.user_id,
                    });
                  }}
                >
<Animated.View
  style={[
    styles.avatarOuter,
    {
      transform: [
        {
          scale:
            animRefs.current[index]?.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.12],   // ✅ zoom glow
            }) || 1,
        },
      ],
      shadowOpacity:
        animRefs.current[index]?.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 0.9],     // ✅ glow strength
        }) || 0.3,
    },
  ]}
>
                    <Image
                      source={require("../assets/boy1.jpg")}
                      style={styles.avatar}
                    />

                    <View style={styles.callBadge}>
                      <MaterialIcons
                        name={item.type === "VIDEO" ? "videocam" : "call"}
                        size={12}
                        color="#fff"
                      />
                    </View>
</Animated.View>

                  <Text style={styles.userText}>
                    User #{item.user_id}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </LinearGradient>

      {/* ---------------- BOTTOM WHITE ---------------- */}
      {/* ---------------- BOTTOM WHITE ---------------- */}
<View style={styles.bottomWhiteArea}>

  {/* Random audio */}
  <TouchableOpacity
    style={styles.bottomPill}
    onPress={startRandomAudioCall}
  >
    <MaterialIcons name="call" size={16} color="#fff" />

    <View style={styles.pillTextWrap}>
      <Text style={styles.pillTitle}>
        {callingRandom ? "Connecting..." : "Random"}
      </Text>
      <Text style={styles.pillSub}>audio call</Text>
    </View>
  </TouchableOpacity>

  {/* Random video */}
  <TouchableOpacity
    style={styles.bottomPill}
    onPress={startRandomVideoCall}
  >
    <MaterialIcons name="videocam" size={16} color="#fff" />

    <View style={styles.pillTextWrap}>
      <Text style={styles.pillTitle}>
        {callingRandomVideo ? "Connecting..." : "Random"}
      </Text>
      <Text style={styles.pillSub}>video call</Text>
    </View>
  </TouchableOpacity>

  {/* Random locked calls – UI only (same logic, no handler change) */}
  <View style={[styles.bottomPill, styles.lockedPill]}>
    <MaterialIcons name="lock" size={16} color="#fff" />

    <View style={styles.pillTextWrap}>
      <Text style={styles.pillTitle}>Random</Text>
      <Text style={styles.pillSub}>locked calls</Text>
    </View>
  </View>

</View>

    </SafeAreaView>
  );
};

export default TrainersCallPage;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /* -------- top white -------- */

  topWhiteArea: {
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  lookText: {
    textAlign: "center",
    fontSize: 12,
    color: "#C35BFF",
    fontWeight: "600",
     paddingTop: 18,
  },

  pageTitle: {
    textAlign: "center",
    fontSize: 22,
    color: "#8B2CE2",
    fontWeight: "800",
    marginTop: 2,
  },

  filterRow: {
  flexDirection: "row",
  paddingHorizontal: 12,
  marginTop: 12,
},


  filterChip: {
    backgroundColor: "#EFE6FF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
  },

  filterChipActive: {
    backgroundColor: "#f5a1ea",
  },

  filterText: {
    fontSize: 12,
    color: "#8B2CE2",
    fontWeight: "700",
  },

  filterTextActive: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "700",
  },

  /* -------- purple middle -------- */

  middlePurple: {
    flex: 1,
    paddingTop: 14,
    marginBottom: 30,
  },

  gridWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },

  itemCell: {
    width: CELL_WIDTH,
    marginBottom: 14,
  },

  userCard: {
    paddingVertical: 20, 
    alignItems: "center",
  },

  avatarOuter: {
  width: 76,
  height: 76,
  borderRadius: 38,
  backgroundColor: "#bb6acf",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 6,

  // ✅ glow
  shadowColor: "#ee6adc",
  shadowOffset: { width: 0, height: 0 },
  shadowRadius: 10,
  elevation: 10, // android glow
},


  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
  },

  callBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#44b62d",
    alignItems: "center",
    justifyContent: "center",
  },

  userText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "700",
  },

  /* -------- bottom white -------- */

  bottomWhiteArea: {
    backgroundColor: "#fff",
    padding: 14,
    flexDirection: "row",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
     marginBottom: 18,
  },

  bottomBtn: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 18,
    backgroundColor: "#F3E8FF",
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  bottomBtnText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "800",
    color: "#8B2CE2",
  },
  bottomPill: {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginHorizontal: 4,
  borderRadius: 22,
  paddingVertical: 10,
  paddingHorizontal: 10,
  backgroundColor: "#9B2CF3",
},

lockedPill: {
  backgroundColor: "#C07BFF",
},

pillTextWrap: {
  marginLeft: 6,
  alignItems: "flex-start",
},

pillTitle: {
  color: "#fff",
  fontSize: 11,
  fontWeight: "800",
  lineHeight: 13,
},

pillSub: {
  color: "#fff",
  fontSize: 10,
  fontWeight: "600",
  lineHeight: 12,
},
});
