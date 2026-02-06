import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  StatusBar,
} from "react-native";

import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useDispatch, useSelector } from "react-redux";
import { chatListRequest } from "../features/chat/chatAction";
import { useFocusEffect } from "@react-navigation/native";

const MessagesScreen = ({ navigation }) => {

  const dispatch = useDispatch();

  const chatList = useSelector((s) => s.chat.chatList) ?? [];
  const unread   = useSelector((s) => s.chat.unread) ?? {};

  const [search, setSearch] = useState("");

  useFocusEffect(
    useCallback(() => {
      dispatch(chatListRequest());
    }, [dispatch])
  );

  const openChat = (item) => {
    navigation.navigate("ChatScreen", { user: item });
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return chatList;

    return chatList.filter(i =>
      i.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, chatList]);

  const renderItem = ({ item }) => {

    const count = unread[item.user_id] || 0;

    const avatar =
      item.avatar ||
      item.profile_pic ||
      item.profile_image ||
      item.image ||
      null;

    const first = item.name?.[0]?.toUpperCase() || "?";

    return (
      <TouchableOpacity style={styles.row} onPress={() => openChat(item)}>

        <View style={styles.avatarWrap}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Text style={styles.placeholderText}>{first}</Text>
            </View>
          )}

          {Number(item.is_online) === 1 && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.centerPart}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>

          {count > 0 ? (
            <Text style={styles.newMsgText}>{count} new messages</Text>
          ) : (
            <Text style={styles.last} numberOfLines={1}>
              {item.last_message || ""}
            </Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={18} color="#bbb" />

      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>

      <StatusBar barStyle="dark-content" />

      <LinearGradient
        colors={["#F3E7FF", "#FCE6F6"]}
        style={styles.headerGradient}
      >

        <Text style={styles.headerTitle}>Messages</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#999" />
          <TextInput
            placeholder="Search"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

      </LinearGradient>

      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.user_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

    </View>
  );
};

export default MessagesScreen;

const styles = StyleSheet.create({

  root: { flex: 1, backgroundColor: "#fff" },

  headerGradient: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },

  searchBox: {
    height: 38,
    backgroundColor: "#fff",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 13,
  },

  listContent: { paddingHorizontal: 14 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.6,
    borderColor: "#eee",
  },

  avatarWrap: { marginRight: 12 },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  placeholderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#C51DAF",
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: { color: "#fff", fontWeight: "700", fontSize: 18 },

  onlineDot: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#31D158",
    borderWidth: 1.5,
    borderColor: "#fff",
  },

  centerPart: { flex: 1 },

  name: { fontSize: 15, fontWeight: "700" },

  last: { fontSize: 12, color: "#8E8E8E", marginTop: 2 },

  newMsgText: {
    fontSize: 12,
    marginTop: 2,
    color: "#C51DAF",
    fontWeight: "600",
  },
});
