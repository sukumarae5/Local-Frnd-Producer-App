import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import { useDispatch, useSelector } from "react-redux";

import { RECENT_CALL_REQUEST } from "../features/calls/callType";
import { startCallRequest } from "../features/calls/callAction";

import {
  friendRequest,
  friendAcceptRequest,
  friendUnfriendRequest,
  friendStatusRequest,
  friendPendingRequest,
} from "../features/friend/friendAction";

const TABS = {
  RECENT: "RECENT",
  MOST: "MOST",
};

const RecentsCallHistoryScreen = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.calls);
  const { userdata } = useSelector((s) => s.user);
console.log("RecentsCallHistoryScreen Rendered", list);
  const {
    friendStatus,
    incoming,
    error: friendError,
  } = useSelector((s) => s.friends);
 
  console.log("Friend Status from Redux:", friendStatus, incoming);
  const [tab, setTab] = useState(TABS.RECENT);

  useEffect(() => {
    dispatch({ type: RECENT_CALL_REQUEST });
    dispatch(friendPendingRequest());
  }, []);

 useEffect(() => {
  incoming.forEach((c) => {
    if (c.user_id) {
      console.log("Fetching friend status for:", c.user_id);
      dispatch(friendStatusRequest(c.user_id));
    }
  });
}, [incoming]);


  useEffect(() => {
    if (friendError) {
      Alert.alert("Friend Error", friendError);
    }
  }, [friendError]);

  const callAgain = (userId, type) => {
    Alert.alert("Call Again", `Start ${type} call?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Call",
        onPress: () => {
          dispatch(
            startCallRequest({
              call_type: type,
              gender: userdata?.user?.gender,
              target_user_id: userId,
            })
          );
        },
      },
    ]);
  };


  const handleAddFriend = (userId) => {
    dispatch(friendRequest(userId));
  };

  const handleAccept = (requestId) => {
    dispatch(friendAcceptRequest(requestId));
  };

  const handleUnfriend = (userId) => {
    Alert.alert("Unfriend", "Remove this friend?", [
      { text: "Cancel" },
      {
        text: "Unfriend",
        style: "destructive",
        onPress: () => dispatch(friendUnfriendRequest(userId)),
      },
    ]);
  };


  const renderFriendButton = (item) => {
    const status = friendStatus[item.other_user_id]?.state;

    if (status === "FRIEND") {
      return (
        <TouchableOpacity onPress={() => handleUnfriend(item.other_user_id)}>
          <Ionicons name="person-remove-outline" size={22} color="#ff3b30" />
        </TouchableOpacity>
      );
    }

    if (status === "PENDING_SENT") {
      return <Text style={{ color: "#aaa" }}>Pending</Text>;
    }

    if (status === "PENDING_RECEIVED") {
      const req = incoming.find(
        (r) => r.user_id === item.other_user_id
      );

      if (!req) {
        return <Text style={{ color: "#aaa" }}>Loading…</Text>;
      }

      return (
        <TouchableOpacity onPress={() => handleAccept(req.id)}>
          <Ionicons name="checkmark-circle" size={22} color="#00ffcc" />
        </TouchableOpacity>
      );
    }

 
    return (
      <TouchableOpacity onPress={() => handleAddFriend(item.other_user_id)}>
        <Ionicons name="person-add-outline" size={22} color="#00ffcc" />
      </TouchableOpacity>
    );
  };

  const mostTalked = [...list]
    .sort((a, b) => b.duration_seconds - a.duration_seconds)
    .slice(0, 10);

  const data = tab === TABS.RECENT ? list : mostTalked;

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.user}>User #{item.other_user_id}</Text>
        <Text style={styles.meta}>
          {item.type} • {item.duration_seconds}s
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => callAgain(item.other_user_id, item.type)}>
          <Feather name="phone-call" size={20} color="#00ffcc" />
        </TouchableOpacity>

        {renderFriendButton(item)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#3b0066", "#1b0030"]} style={styles.header}>
        <Text style={styles.title}>Recents</Text>
      </LinearGradient>

      <View style={styles.tabs}>
        <Tab
          label="Recent Calls"
          active={tab === TABS.RECENT}
          onPress={() => setTab(TABS.RECENT)}
        />
        <Tab
          label="Most Talked"
          active={tab === TABS.MOST}
          onPress={() => setTab(TABS.MOST)}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(i) => String(i.other_user_id)}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading ? "Loading…" : "No calls yet"}
          </Text>
        }
      />
    </View>
  );
};

export default RecentsCallHistoryScreen;

const Tab = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.tab, active && styles.tabActive]}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#120018" },

  header: {
    paddingTop: 50,
    paddingBottom: 15,
    alignItems: "center",
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "700" },

  tabs: {
    flexDirection: "row",
    margin: 15,
    backgroundColor: "#2a003f",
    borderRadius: 14,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#7f00ff",
    borderRadius: 14,
  },
  tabText: { color: "#aaa", fontWeight: "600" },
  tabTextActive: { color: "#fff" },

  card: {
    backgroundColor: "#2a003f",
    marginHorizontal: 15,
    marginBottom: 12,
    padding: 15,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  user: { color: "#fff", fontSize: 16, fontWeight: "600" },
  meta: { color: "#bbb", fontSize: 13, marginTop: 4 },

  actions: {
    flexDirection: "row",
    gap: 18,
  },

  empty: {
    textAlign: "center",
    color: "#888",
    marginTop: 50,
  },
});
