import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import {
  friendPendingRequest,
  friendAcceptRequest,
  friendUnfriendRequest,
  friendListRequest,
} from "../features/friend/friendAction";

/* ================= TIME HELPER ================= */
const getDayLabel = (dateString) => {
  if (!dateString) return "Earlier";

  const date = new Date(dateString);
  const today = new Date();

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffDays =
    (startOfToday - startOfDate) / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return "Earlier";
};

const FriendRequestsScreen = ({ navigation }) => {   // ✅ CHANGED
  const dispatch = useDispatch();
  const { incoming, friends, loading } = useSelector((s) => s.friends);

  /* ================= INIT ================= */
  useEffect(() => {
    dispatch(friendPendingRequest());
    dispatch(friendListRequest());
  }, [dispatch]);

  /* ================= ACTIONS ================= */
  const accept = (requestId) => {
    dispatch(friendAcceptRequest(requestId));
  };

  const reject = (senderId) => {
    dispatch(friendUnfriendRequest(senderId));
  };

  const unfriend = (userId) => {
    dispatch(friendUnfriendRequest(userId));
  };

  /* ================= GROUP PENDING BY DATE ================= */
  const groupedPending = useMemo(() => {
    const groups = { Today: [], Yesterday: [], Earlier: [] };

    incoming.forEach((item) => {
      const label = getDayLabel(item.created_at);
      groups[label].push(item);
    });

    return groups;
  }, [incoming]);

  /* ================= PENDING ITEM ================= */
  const renderPendingItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{item.sender_name}</Text>
        <Text style={styles.sub}>User ID: {item.sender_id}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.accept]}
          onPress={() => accept(item.request_id)}
        >
          <Text style={styles.btnText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.remove]}
          onPress={() => reject(item.sender_id)}
        >
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ================= FRIEND ITEM ================= */
  const renderFriendItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate("ChatScreen", { user: item })
      }
    >
      <View style={[styles.card, styles.friend]}>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>User ID: {item.user_id}</Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, styles.remove]}
          onPress={() => unfriend(item.user_id)}
        >
          <Text style={styles.btnText}>Unfriend</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friend Requests</Text>

      {["Today", "Yesterday", "Earlier"].map((section) =>
        groupedPending[section].length ? (
          <View key={section}>
            <Text style={styles.sectionTitle}>{section}</Text>

            <FlatList
              data={groupedPending[section]}
              keyExtractor={(i) => String(i.request_id)}
              renderItem={renderPendingItem}
            />
          </View>
        ) : null
      )}

      {!incoming.length && (
        <Text style={styles.empty}>
          {loading ? "Loading…" : "No pending requests"}
        </Text>
      )}

      <Text style={[styles.title, { marginTop: 30 }]}>
        Friends
      </Text>

      <FlatList
        data={friends}
        keyExtractor={(i) => String(i.user_id)}
        renderItem={renderFriendItem}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading ? "Loading…" : "No friends yet"}
          </Text>
        }
      />
    </View>
  );
};

export default FriendRequestsScreen;


/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#120018",
    padding: 16,
  },

  title: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 10,
    fontWeight: "700",
  },

  sectionTitle: {
    color: "#bbb",
    fontSize: 14,
    marginVertical: 8,
    fontWeight: "600",
  },

  empty: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },

  card: {
    backgroundColor: "#2a003f",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  friend: {
    borderColor: "#7f00ff",
    borderWidth: 1,
  },

  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  sub: {
    color: "#ccc",
    fontSize: 12,
    marginTop: 2,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  btn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },

  accept: {
    backgroundColor: "#00c853",
  },

  remove: {
    backgroundColor: "#ff3b30",
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
