import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSelector } from "react-redux";
import { SocketContext } from "../socket/SocketProvider";

const ChatScreen = ({ route }) => {
  const { user } = route.params;
  const { socketRef } = useContext(SocketContext);

  const myId = useSelector((s) => s.user.userdata?.user?.user_id);
  const friendStatus = useSelector((s) => s.friends.friendStatus);

  const status = friendStatus[user.user_id]?.state;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on("chat_message", (msg) => {
      if (
        msg.sender_id === user.user_id ||
        msg.receiver_id === user.user_id
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("chat_message");
  }, []);

  const sendMessage = () => {
    if (!text.trim()) return;

    const msg = {
      sender_id: myId,
      receiver_id: user.user_id,
      message: text,
    };

    socketRef.current.emit("chat_message", msg);
    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  if (status !== "FRIEND") {
    return (
      <View style={styles.center}>
        <Text>You can chat only after becoming friends</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View
            style={[
              styles.msg,
              item.sender_id === myId ? styles.me : styles.other,
            ]}
          >
            <Text>{item.message}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={styles.input}
          placeholder="Type a message..."
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  msg: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: "70%",
  },

  me: { alignSelf: "flex-end", backgroundColor: "#dcf8c6" },
  other: { alignSelf: "flex-start", backgroundColor: "#eee" },

  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 12,
  },

  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#7e00ff",
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: "center",
  },
});
