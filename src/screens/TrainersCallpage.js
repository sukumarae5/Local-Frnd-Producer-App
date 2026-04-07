import React, {
  useContext,
  useRef,
  useState,
  useEffect,
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
  ScrollView,
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
import BottomCallPills from "../components/BottomCallPills";

const { width } = Dimensions.get("window");
const CELL_WIDTH = width / 3 - 18;
const WAVE_DISTANCE = 10;

const TrainersCallPage = ({ navigation }) => {
  const dispatch = useDispatch();
  const socketCtx = useContext(SocketContext);

  const { userdata } = useSelector(state => state.user);
  const users = useSelector(state => state.calls.searchingFemales || []);

  const connected = socketCtx?.connected;

  const animRefs = useRef([]);

  const [callingRandom, setCallingRandom] = useState(false);
  const [callingRandomVideo, setCallingRandomVideo] = useState(false);
  const [callingDirect, setCallingDirect] = useState(false);

  const [filters, setFilters] = useState({
    online: 1,
    type: null,
    language: null,
    interest_id: null,
  });

  const [activeFilter, setActiveFilter] = useState("ONLINE");

  useEffect(() => {
    dispatch(searchingFemalesRequest(filters));

    const interval = setInterval(() => {
      dispatch(searchingFemalesRequest(filters));
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch, filters]);

  const setOnlineFilter = () => {
    setFilters({
      online: 1,
      type: null,
      language: null,
      interest_id: null,
    });
    setActiveFilter("ONLINE");
  };

  const setTypeFilter = type => {
    setFilters(prev => ({
      ...prev,
      type,
      language: null,
      interest_id: null,
    }));
    setActiveFilter(type);
  };

  const setLanguageFilter = () => {
    setFilters(prev => ({
      ...prev,
      type: null,
      language: userdata?.language_id || null,
      interest_id: null,
    }));
    setActiveFilter("LANGUAGE");
  };

  const setInterestFilter = () => {
    const interestId = userdata?.interest_ids?.[0] || null;

    setFilters(prev => ({
      ...prev,
      type: null,
      language: null,
      interest_id: interestId,
    }));
    setActiveFilter("INTEREST");
  };

  const resetFilters = () => {
    setFilters({
      online: 1,
      type: null,
      language: null,
      interest_id: null,
    });
    setActiveFilter("ONLINE");
  };

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

  const startRandomAudioCall = () => {
    if (!connected) return;

    setCallingRandom(true);

    dispatch(callRequest({ call_type: "AUDIO" }));

    navigation.navigate("CallStatusScreen", {
      call_type: "AUDIO",
      role: "male",
    });
  };

  const startRandomVideoCall = () => {
    if (!connected) return;

    setCallingRandomVideo(true);

    dispatch(callRequest({ call_type: "VIDEO" }));

    navigation.navigate("CallStatusScreen", {
      call_type: "VIDEO",
      role: "male",
    });
  };

  const startDirectCall = item => {
    console.log("Starting direct call with", item);

    if (!connected) return;

    setCallingDirect(true);

    dispatch(
      directCallRequest({
        female_id: item.user_id,
        call_type: item.type,
      })
    );

    navigation.navigate("CallStatusScreen", {
      call_type: item.type,
      role: "caller",
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      setCallingRandom(false);
      setCallingRandomVideo(false);
      setCallingDirect(false);
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.topWhiteArea}>
        <Text style={styles.lookText}>Local frnd</Text>
        <Text style={styles.pageTitle}>Connecting Room</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {/* ONLINE */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === "ONLINE" && styles.filterChipActive,
            ]}
            onPress={setOnlineFilter}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "ONLINE" && styles.filterTextActive,
              ]}
            >
              ONLINE
            </Text>
          </TouchableOpacity>

          {/* AUDIO */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === "AUDIO" && styles.filterChipActive,
            ]}
            onPress={() => setTypeFilter("AUDIO")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "AUDIO" && styles.filterTextActive,
              ]}
            >
              Audio
            </Text>
          </TouchableOpacity>

          {/* VIDEO */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === "VIDEO" && styles.filterChipActive,
            ]}
            onPress={() => setTypeFilter("VIDEO")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "VIDEO" && styles.filterTextActive,
              ]}
            >
              Video
            </Text>
          </TouchableOpacity>

          {/* LANGUAGE */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === "LANGUAGE" && styles.filterChipActive,
            ]}
            onPress={setLanguageFilter}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "LANGUAGE" && styles.filterTextActive,
              ]}
            >
              My Language
            </Text>
          </TouchableOpacity>

          {/* INTEREST */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === "INTEREST" && styles.filterChipActive,
            ]}
            onPress={setInterestFilter}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "INTEREST" && styles.filterTextActive,
              ]}
            >
              My Interest
            </Text>
          </TouchableOpacity>

          {/* RESET */}
          <TouchableOpacity
            style={styles.filterChip}
            onPress={resetFilters}
            activeOpacity={0.8}
          >
            <Text style={styles.filterText}>Reset</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* USERS GRID */}
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
                  activeOpacity={0.8}
                >
                  <View style={styles.avatarOuter}>
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
                  </View>

                  <Text style={styles.userText}>User #{item.user_id}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </LinearGradient>

      {/* CALL BUTTONS */}
      <BottomCallPills
        callingRandom={callingRandom}
        callingRandomVideo={callingRandomVideo}
        onRandomAudio={startRandomAudioCall}
        onRandomVideo={startRandomVideoCall}
      />
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
    marginTop: 30,
  },

  pageTitle: {
    textAlign: "center",
    fontSize: 22,
    color: "#8B2CE2",
    fontWeight: "800",
    marginTop: 4,
  },

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginTop: 12,
    paddingBottom: 2,
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

  middlePurple: {
    flex: 0.85,
    paddingTop: 8,
    marginBottom: 0,
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
    shadowColor: "#ee6adc",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 10,
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
});