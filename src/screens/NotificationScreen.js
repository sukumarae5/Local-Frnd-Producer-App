import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

import {
  fetchNotifications,
  markNotificationsRead,
} from "../features/notification/notificationAction";

import {
  friendAcceptRequest,
  friendRejectRequest,
} from "../features/friend/friendAction";

import {
  FRIEND_ACCEPT_REQUEST,
  FRIEND_REJECT_REQUEST,
} from "../features/friend/friendType";

const getDayLabel = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();

  const startToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const startDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diff = (startToday - startDate) / (1000 * 60 * 60 * 24);

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return "Earlier";
};

const formatTimeAgo = (dateString) => {
  const diffMin = Math.floor((Date.now() - new Date(dateString)) / 60000);

  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)} hr ago`;
  return `${Math.floor(diffMin / 1440)} d ago`;
};

const NotificationScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { list = [], loading } = useSelector((s) => s.notification);

  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(markNotificationsRead());
  }, [dispatch]);

  const sections = useMemo(() => {
    const grouped = {};

    list.forEach((item) => {
      const label = getDayLabel(item.created_at);
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(item);
    });

    return Object.keys(grouped).map((key) => ({
      title: key,
      data: grouped[key],
    }));
  }, [list]);

  /* ================= ACCEPT ================= */

  const handleAccept = (item) => {
    if (processingId) return;

    setProcessingId(item.id);

    dispatch({
      type: FRIEND_ACCEPT_REQUEST,
      payload: { sender_id: item.sender_id },
      meta: { notificationId: item.id }, // used in saga to remove notification
    });
  };

  /* ================= REJECT ================= */

  const handleReject = (item) => {
    if (processingId) return;

    setProcessingId(item.id);

    dispatch({
      type: FRIEND_REJECT_REQUEST,
      payload: { sender_id: item.sender_id },
      meta: { notificationId: item.id }, // used in saga to remove notification
    });
  };

  /* ================= RENDER ITEM ================= */

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <LinearGradient
        colors={["#B620E0", "#7B2FF7"]}
        style={styles.avatarBorder}
      >
        <Image
          source={{
            uri:
              item.avatar_url ||
              "https://i.pravatar.cc/150?img=12",
          }}
          style={styles.avatar}
        />
      </LinearGradient>

      <View style={styles.textContainer}>
        <Text style={styles.name}>
          {item.sender_name || "Notification"}
        </Text>
        <Text style={styles.subtitle}>{item.message}</Text>
        <Text style={styles.time}>
          {formatTimeAgo(item.created_at)}
        </Text>
      </View>

      {item.type === "FRIEND_REQUEST" && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.acceptBtn}
            disabled={processingId === item.id}
            onPress={() => handleAccept(item)}
          >
            <Text style={styles.acceptText}>
              {processingId === item.id ? "..." : "Accept"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rejectBtn}
            disabled={processingId === item.id}
            onPress={() => handleReject(item)}
          >
            <Text style={styles.rejectText}>
              {processingId === item.id ? "..." : "Reject"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>
            {section.title}
          </Text>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading ? "Loading..." : "No notifications"}
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F3F5",
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 25,
  },
  backButton: {
    marginRight: 10,
  },
  backArrow: {
    fontSize: 26,
    color: "#000",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 18,
    color: "#444",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  avatarBorder: {
    padding: 2,
    borderRadius: 40,
    marginRight: 12,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },
  subtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 3,
  },
  time: {
    fontSize: 12,
    color: "#9A9A9A",
    marginTop: 3,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  acceptBtn: {
    backgroundColor: "#B620E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 6,
  },
  acceptText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  rejectBtn: {
    backgroundColor: "#E5E5EA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  rejectText: {
    color: "#555",
    fontSize: 12,
    fontWeight: "500",
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
  },
});