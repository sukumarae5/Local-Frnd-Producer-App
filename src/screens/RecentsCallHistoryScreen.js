// import React, { useEffect, useMemo } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import LinearGradient from "react-native-linear-gradient";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import Feather from "react-native-vector-icons/Feather";
// import { useDispatch, useSelector } from "react-redux";

// import { RECENT_CALL_REQUEST } from "../features/calls/callType";
// import { startCallRequest } from "../features/calls/callAction";

// import {
//   friendRequest,
//   friendAcceptRequest,
//   friendUnfriendRequest,
//   friendStatusRequest,
//   friendPendingRequest,
// } from "../features/friend/friendAction";

// const RecentsCallHistoryScreen = () => {
//   const dispatch = useDispatch();

//   const { list: calls, loading } = useSelector((s) => s.calls);
//   const { userdata } = useSelector((s) => s.user);
//   const { friendStatus, incoming } = useSelector((s) => s.friends);

//   /* ================= INIT ================= */
//   useEffect(() => {
//     dispatch({ type: RECENT_CALL_REQUEST });
//     dispatch(friendPendingRequest());
//   }, []);

//   /* ================= LOAD STATUS (DEDUPED) ================= */
//   const uniqueUserIds = useMemo(() => {
//     return [...new Set(calls.map(c => c.other_user_id))];
//   }, [calls]);

//   useEffect(() => {
//     uniqueUserIds.forEach(id => {
//       dispatch(friendStatusRequest(id));
//     });
//   }, [uniqueUserIds]);

//   /* ================= ACTIONS ================= */
//   const callAgain = (userId, type) => {
//     dispatch(
//       startCallRequest({
//         call_type: type,
//         gender: userdata?.user?.gender,
//         target_user_id: userId,
//       })
//     );
//   };

//   const handleAddFriend = (userId) => {
//     dispatch(friendRequest(userId));
//   };

//   const handleAccept = (requestId) => {
//     dispatch(friendAcceptRequest(requestId));
//   };

//   const handleUnfriend = (userId) => {
//     Alert.alert("Unfriend", "Remove this friend?", [
//       { text: "Cancel" },
//       {
//         text: "Unfriend",
//         style: "destructive",
//         onPress: () => dispatch(friendUnfriendRequest(userId)),
//       },
//     ]);
//   };

//   /* ================= FRIEND BUTTON ================= */
//   const renderFriendButton = (userId) => {
//     const status = friendStatus[userId]?.state;

//     if (status === "FRIEND") {
//       return (
//         <TouchableOpacity onPress={() => handleUnfriend(userId)}>
//           <Ionicons name="person-remove-outline" size={22} color="#ff3b30" />
//         </TouchableOpacity>
//       );
//     }

//     if (status === "PENDING_SENT") {
//       return <Text style={styles.pending}>Pending</Text>;
//     }

//     if (status === "PENDING_RECEIVED") {
//       const req = incoming.find(r => r.sender_id === userId);
//       if (!req) return <Text style={styles.pending}>...</Text>;

//       return (
//         <TouchableOpacity onPress={() => handleAccept(req.request_id)}>
//           <Ionicons name="checkmark-circle" size={22} color="#00ffcc" />
//         </TouchableOpacity>
//       );
//     }

//     return (
//       <TouchableOpacity onPress={() => handleAddFriend(userId)}>
//         <Ionicons name="person-add-outline" size={22} color="#00ffcc" />
//       </TouchableOpacity>
//     );
//   };

//   /* ================= RENDER ITEM ================= */
//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <View>
//         <Text style={styles.user}>User #{item.other_user_id}</Text>
//         <Text style={styles.meta}>
//           {item.type} • {item.duration_seconds}s
//         </Text>
//       </View>

//       <View style={styles.actions}>
//         <TouchableOpacity onPress={() => callAgain(item.other_user_id, item.type)}>
//           <Feather name="phone-call" size={20} color="#00ffcc" />
//         </TouchableOpacity>

//         {renderFriendButton(item.other_user_id)}
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <LinearGradient colors={["#3b0066", "#1b0030"]} style={styles.header}>
//         <Text style={styles.title}>Recent Calls</Text>
//       </LinearGradient>

//       <FlatList
//         data={calls}
//         keyExtractor={(i) => String(i.other_user_id)}
//         renderItem={renderItem}
//         ListEmptyComponent={
//           <Text style={styles.empty}>
//             {loading ? "Loading…" : "No calls yet"}
//           </Text>
//         }
//       />
//     </View>
//   );
// };

// export default RecentsCallHistoryScreen;

// /* ================= STYLES ================= */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#120018" },
//   header: { paddingTop: 50, paddingBottom: 15, alignItems: "center" },
//   title: { color: "#fff", fontSize: 22, fontWeight: "700" },

//   card: {
//     backgroundColor: "#2a003f",
//     margin: 15,
//     padding: 15,
//     borderRadius: 14,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   user: { color: "#fff", fontSize: 16, fontWeight: "600" },
//   meta: { color: "#bbb", fontSize: 13, marginTop: 4 },

//   actions: { flexDirection: "row", gap: 18 },
//   pending: { color: "#aaa", fontSize: 13 },

//   empty: { textAlign: "center", color: "#888", marginTop: 50 },
// });


import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const RecentsCallHistoryScreen = () => {
  return (
    <View>
      <Text>RecentsCallHistoryScreen</Text>
    </View>
  )
}

export default RecentsCallHistoryScreen

const styles = StyleSheet.create({})