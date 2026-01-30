import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { friendListRequest } from "../features/friend/friendAction";

const MessagesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { friends } = useSelector((s) => s.friends);

  useEffect(() => {
    dispatch(friendListRequest());
  }, []);

  const openChat = (user) => {
    navigation.navigate("ChatScreen", { user });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        keyExtractor={(i) => String(i.user_id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => openChat(item)}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.sub}>Tap to chat</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No friends yet</Text>
        }
      />
    </View>
  );
};

export default MessagesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  card: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f1e6ff",
    marginBottom: 12,
  },
  name: { fontSize: 16, fontWeight: "700" },
  sub: { fontSize: 12, color: "#666" },
  empty: { textAlign: "center", marginTop: 40 },
});
