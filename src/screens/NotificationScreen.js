import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import {
  friendPendingRequest,
  friendAcceptRequest,
  friendUnfriendRequest,
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

const NotificationScreen = () => {
  const dispatch = useDispatch();
  const { incoming = [], loading } = useSelector((s) => s.friends);

  useEffect(() => {
    dispatch(friendPendingRequest());
  }, [dispatch]);

  const accept = (requestId) => {
    dispatch(friendAcceptRequest(requestId));
  };

  const reject = (senderId) => {
    dispatch(friendUnfriendRequest(senderId));
  };

  /* ================= GROUP BY DAY ================= */
  const sections = useMemo(() => {
    const groups = { Today: [], Yesterday: [], Earlier: [] };

    incoming.forEach((item) => {
      const label = getDayLabel(item.requested_at); // ✅ FIX
      groups[label].push(item);
    });

    return groups;
  }, [incoming]);

  const renderItem = ({ item }) => {
    return (
      <View style={styles.row}>
        {/* Avatar */}
        <Image
          source={{
            uri: item.avatar_id
              ? item.avatar_id
              : "https://i.pravatar.cc/150?img=12",
          }}
          style={styles.avatar}
        />

        {/* Center text */}
        <View style={styles.center}>
          <Text style={styles.name}>{item.sender_name}</Text>

          <Text style={styles.message}>
            Sent you a friend request
          </Text>

          <Text style={styles.time}>
            {new Date(item.requested_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {/* Right actions */}
        <View style={styles.right}>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => accept(item.request_id)}
          >
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => reject(item.sender_id)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSection = (title, data) => {
    if (!data.length) return null;

    return (
      <View style={styles.sectionBlock}>
        <Text style={styles.section}>{title}</Text>

        <FlatList
          data={data}
          keyExtractor={(i) => String(i.request_id)}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderSection("Today", sections.Today)}
      {renderSection("Yesterday", sections.Yesterday)}
      {renderSection("Earlier", sections.Earlier)}

      {!incoming.length && (
        <Text style={styles.empty}>
          {loading ? "Loading..." : "No notifications"}
        </Text>
      )}
    </View>
  );
};

export default NotificationScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4e9fb",
    paddingHorizontal: 14,
    paddingTop: 12,
  },

  sectionBlock: {
    marginBottom: 8,
  },

  section: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b6b6b",
    marginBottom: 8,
    marginLeft: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
    elevation: 1,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    backgroundColor: "#eee",
  },

  center: {
    flex: 1,
    justifyContent: "center",
  },

  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f1f1f",
  },

  message: {
    fontSize: 12,
    color: "#7a7a7a",
    marginTop: 2,
  },

  time: {
    fontSize: 11,
    color: "#a0a0a0",
    marginTop: 2,
  },

  right: {
    alignItems: "flex-end",
    justifyContent: "center",
  },

  acceptBtn: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 6,
  },

  acceptText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  deleteText: {
    color: "#ff3b30",
    fontSize: 12,
    fontWeight: "500",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
  },
});
