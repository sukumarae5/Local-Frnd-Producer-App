import React, {
  useEffect,
  useContext,
  useRef,
  useState,
  useMemo,
} from "react";

import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";

import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../socket/SocketProvider";

import {
  chatHistoryRequest,
  chatUnreadClear,
  chatMarkReadRequest,
  chatSetActive,
  chatClearActive,
} from "../features/chat/chatAction";

/* helpers */

const getDayLabel = (dateStr) => {
  if (!dateStr) return "";

  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const same = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (same(d, today)) return "Today";
  if (same(d, yesterday)) return "Yesterday";

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getLastSeenText = (dateStr) => {
  if (!dateStr) return "Offline";

  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);

  if (diff < 60) return "Last seen just now";
  if (diff < 3600) return `Last seen ${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `Last seen ${Math.floor(diff / 3600)} hr ago`;

  return `Last seen on ${d.toLocaleDateString()}`;
};

const HeartsBackground = () => (
  <View pointerEvents="none" style={styles.heartsLayer}>
    <Image source={require("../assets/rightheart.png")} style={[styles.heartBig, { top: 40, left: 20 }]} />
    <Image source={require("../assets/rightheart.png")} style={[styles.heartSmall, { top: 130, right: 40 }]} />
    <Image source={require("../assets/rightheart.png")} style={[styles.heartBig, { top: 260, left: 80 }]} />
    <Image source={require("../assets/rightheart.png")} style={[styles.heartSmall, { bottom: 260, right: 60 }]} />
    <Image source={require("../assets/rightheart.png")} style={[styles.heartBig, { bottom: 120, left: 40 }]} />
  </View>
);

const ChatScreen = ({ route, navigation }) => {

  const { user } = route.params;
  const { socketRef } = useContext(SocketContext);

  const dispatch = useDispatch();
  const flatRef = useRef(null);

  const conversationId = useSelector(
    s => s.chat.conversationIds?.[user.user_id]
  );

  const myId = useSelector(
    s => s.user.userdata?.user?.user_id
  );

  const messages =
    useSelector(s => s.chat.conversations[user.user_id]) || [];

  const [text, setText] = useState("");

  /* active chat */

  useEffect(() => {
    dispatch(chatSetActive(user.user_id));
    return () => dispatch(chatClearActive());
  }, [dispatch, user.user_id]);

  /* load history */

  useEffect(() => {
    dispatch(chatHistoryRequest(user.user_id));
  }, [dispatch, user.user_id]);

  /* mark whole conversation read (API) */

  useEffect(() => {
    if (!conversationId) return;
    dispatch(chatMarkReadRequest(user.user_id, conversationId));
  }, [conversationId, dispatch, user.user_id]);

  /* clear badge */

  useEffect(() => {
    dispatch(chatUnreadClear(user.user_id));
  }, [dispatch, user.user_id]);

  /* ---------------- SOCKET READ (correct) ---------------- */

  const lastReadSentRef = useRef(new Set());

  useEffect(() => {

    if (!socketRef.current) return;

    messages.forEach(m => {

      const msg = m.message ?? m;

      if (
        Number(msg.sender_id) === Number(user.user_id) &&
        msg.is_read === 0 &&
        !lastReadSentRef.current.has(msg.message_id)
      ) {

        lastReadSentRef.current.add(msg.message_id);

        socketRef.current.emit("chat_read", {
          messageId: msg.message_id
        });
      }
    });

  }, [messages, socketRef, user.user_id]);

  /* send */

  const sendMessage = () => {
    if (!text.trim()) return;

    socketRef.current?.emit("chat_send", {
      receiverId: user.user_id,
      content: text,
      message_type: "text",
    });

    setText("");
  };

  const messagesWithDate = useMemo(() => {

    const map = new Map();

    messages.forEach(item => {
      const msg = item.message ?? item;
      map.set(msg.message_id, msg);
    });

    const sorted = [...map.values()].sort(
      (a, b) => new Date(a.sent_at) - new Date(b.sent_at)
    );

    const out = [];
    let last = null;

    sorted.forEach(msg => {

      const label = getDayLabel(msg.sent_at);

      if (label && label !== last) {
        out.push({
          type: "date",
          id: "d-" + label + "-" + msg.message_id,
          label,
        });
        last = label;
      }

      out.push({ type: "msg", ...msg });
    });

    return out;

  }, [messages]);

  const renderItem = ({ item }) => {

    if (item.type === "date") {
      return (
        <View style={styles.dateWrap}>
          <Text style={styles.dateText}>{item.label}</Text>
        </View>
      );
    }

    const isMe = Number(item.sender_id) === Number(myId);

    const time = item.sent_at
      ? new Date(item.sent_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return (
      <View style={[
        styles.bubble,
        isMe ? styles.myBubble : styles.otherBubble,
      ]}>
        <Text style={[styles.msgText, isMe && { color: "#fff" }]}>
          {item.content}
        </Text>

        <View style={styles.metaRow}>
          {!!time && (
            <Text style={[styles.timeText, isMe && { color: "#eee" }]}>
              {time}
            </Text>
          )}

          {isMe && (
            <Ionicons
              name={item.is_read ? "checkmark-done" : "checkmark"}
              size={14}
              color={item.is_read ? "#7CFCFF" : "#ddd"}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </View>
    );
  };

  const avatarUri =
    user?.avatar ||
    user?.profile_pic ||
    user?.profile_image ||
    user?.image ||
    null;

  const lastSeenValue =
    user?.last_seen ||
    user?.lastSeen ||
    user?.last_active ||
    null;

  return (
    <View style={styles.container}>
      <HeartsBackground />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >

        <LinearGradient
          colors={["#F3E7FF", "#FCE6F6"]}
          style={styles.chatHeader}
        >

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={26} color="#111" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>

            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerPlaceholder}>
                <Text style={styles.headerPlaceholderText}>
                  {user?.name?.[0]?.toUpperCase() || "?"}
                </Text>
              </View>
            )}

            <View>
              <Text style={styles.headerName} numberOfLines={1}>
                {user?.name}
              </Text>

              <Text style={styles.headerStatus}>
                {Number(user?.is_online) === 1
                  ? "Active now"
                  : getLastSeenText(lastSeenValue)}
              </Text>
            </View>

          </View>
        </LinearGradient>

        <FlatList
          ref={flatRef}
          data={messagesWithDate}
          keyExtractor={(i) =>
            i.type === "date" ? i.id : String(i.message_id)
          }
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatRef.current?.scrollToEnd({ animated: true })
          }
        />

        <View style={styles.inputBar}>

          <TextInput
            placeholder="Type a message..."
            value={text}
            onChangeText={setText}
            style={styles.input}
            placeholderTextColor="#999"
          />

          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>

        </View>

      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;

/* styles unchanged */


const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: "#fdeefe" },

  heartsLayer: { ...StyleSheet.absoluteFillObject },

  heartBig: {
    position: "absolute",
    width: 90,
    height: 90,
    opacity: 0.12,
    tintColor: "#ff3b7a",
  },

  heartSmall: {
    position: "absolute",
    width: 55,
    height: 55,
    opacity: 0.1,
    tintColor: "#270227"
  },

  chatHeader: {
    height: 72,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "android" ? 30 : 8,
    flexDirection: "row",
    alignItems: "center",
  },

  backBtn: { width: 34 },

  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center" },

  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#C51DAF",
  },

  headerPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#C51DAF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  headerPlaceholderText: { color: "#fff", fontWeight: "700" },

  headerName: { fontSize: 15, fontWeight: "700", color: "#111" },

  headerStatus: { fontSize: 11, color: "#6A6A6A" },

  list: { paddingHorizontal: 14, paddingVertical: 10 },

  dateWrap: { alignItems: "center", marginVertical: 10 },

  dateText: {
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: "#666",
  },

  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginVertical: 6,
    maxWidth: "78%",
  },

  myBubble: { alignSelf: "flex-end", backgroundColor: "#7e00ff" },

  otherBubble: { alignSelf: "flex-start", backgroundColor: "#fff" },

  msgText: { fontSize: 15, color: "#222" },

  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4
  },

  timeText: { fontSize: 10 },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },

  input: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },

  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#7e00ff",
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
});
