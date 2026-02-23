import React, {
  useEffect,
  useCallback,
  useState,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";

import WelcomeScreenbackgroungpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";
import {
  recentCallRequest,
  friendCallRequest,
} from "../features/calls/callAction";

const { width } = Dimensions.get("window");

const RecentsCallHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  /* SAFE SELECTORS */
  const recentCalls =
    useSelector((state) => state.calls?.recentCalls) || [];

  const loading =
    useSelector((state) => state.calls?.loading) || false;

  const userdata =
    useSelector((state) => state.user?.userdata) || null;

  const currentUserId = userdata?.user?.user_id;

  /* LOCAL STATE */
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [callingId, setCallingId] = useState(null);

  /* FETCH DATA */
  useEffect(() => {
    dispatch(recentCallRequest());
  }, [dispatch]);

  /* REFRESH */
  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(recentCallRequest());
    setRefreshing(false);
  };

  /* START FRIEND CALL */
  const startFriendCall = useCallback(
    async (item, type = "AUDIO") => {
      if (!item?.other_user_id) return;

      if (callingId === item.other_user_id) return;

      setCallingId(item.other_user_id);

      await dispatch(
        friendCallRequest({
          friend_id: item.other_user_id,
          call_type: type,
        })
      );

      setCallingId(null);

      navigation.navigate("CallStatusScreen", {
        call_type: type,
        friend: item,
      });
    },
    [dispatch, navigation, callingId]
  );

  /* SEARCH FILTER */
  const filteredData = useMemo(() => {
    if (!search.trim()) return recentCalls;

    return recentCalls.filter((item) =>
      item?.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search, recentCalls]);

  /* FORMAT DURATION */
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "Missed call";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  /* RENDER ITEM */
  const renderItem = ({ item }) => {
    const isOutgoing = item.caller_id === currentUserId;
    const isMissed =
      item.status === "MISSED" ||
      item.duration_seconds === 0;

    const avatar =
      item.avatar ||
      "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    return (
      <View style={styles.row}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          {Number(item.is_online) === 1 && (
            <View style={styles.onlineDot} />
          )}
        </View>

        {/* Name + Info */}
        <View style={styles.centerPart}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name || `User ${item.other_user_id}`}
          </Text>

          <View style={styles.subtitleRow}>
            <Ionicons
              name={isOutgoing ? "arrow-up" : "arrow-down"}
              size={14}
              color={isMissed ? "#ff3b30" : "#C51DAF"}
            />
            <Text
              style={[
                styles.subtitle,
                isMissed && { color: "#ff3b30" },
              ]}
            >
              {" "}
              {isOutgoing ? "Outgoing" : "Incoming"} •{" "}
              {formatDuration(item.duration_seconds)}
            </Text>
          </View>
        </View>

        {/* CALL BUTTONS */}
        <View style={styles.callSection}>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => startFriendCall(item, "AUDIO")}
            disabled={callingId === item.other_user_id}
          >
            <Ionicons
              name="call-outline"
              size={20}
              color="#C51DAF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => startFriendCall(item, "VIDEO")}
            disabled={callingId === item.other_user_id}
          >
            <Ionicons
              name="videocam-outline"
              size={20}
              color="#C51DAF"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* HEADER */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color="#4A4A4A"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Recent</Text>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            placeholder="Search"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
        </View>

        {/* LIST */}
        <FlatList
          data={filteredData}
          keyExtractor={(item) =>
            String(item.other_user_id)
          }
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || loading}
              onRefresh={onRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default RecentsCallHistoryScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 25,
    paddingHorizontal: width * 0.05,
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 12,
  },

  searchBox: {
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 15,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  avatarWrap: {
    marginRight: 12,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  onlineDot: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#31D158",
    borderWidth: 2,
    borderColor: "#fff",
  },

  centerPart: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
  },

  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  subtitle: {
    fontSize: 13,
    color: "#8E8E8E",
  },

  callSection: {
    flexDirection: "row",
  },

  callBtn: {
    padding: 6,
    marginLeft: 6,
  },
});