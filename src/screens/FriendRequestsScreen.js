import React, { useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  friendPendingRequest,
  friendAcceptRequest,
} from "../features/friend/friendAction"

const FriendRequestsScreen = () => {
  const dispatch = useDispatch();
  const { incoming } = useSelector((s) => s.friends);

  useEffect(() => {
    dispatch(friendPendingRequest());
  }, []);

  const accept = (id) => {
    dispatch(friendAcceptRequest(id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friend Requests</Text>

      <FlatList
        data={incoming}
        keyExtractor={(i) => String(i.id)}
        ListEmptyComponent={
          <Text style={styles.empty}>No requests</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>

            <TouchableOpacity
              style={styles.btn}
              onPress={() => accept(item.id)}
            >
              <Text style={styles.btnText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default FriendRequestsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#120018", padding: 16 },
  title: { color: "#fff", fontSize: 20, marginBottom: 10 },
  empty: { color: "#aaa", textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: "#2a003f",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { color: "#fff", fontSize: 16 },
  btn: {
    backgroundColor: "#7f00ff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnText: { color: "#fff" },
});
