import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";

import {
  friendRequest,
  friendAcceptRequest,
  friendStatusRequest
} from "../features/friend/friendAction";

const EndCallConfirmModal = ({
  visible,
  onCancel,
  onConfirm,
  otherUser
}) => {

  /* ---------------- redux ---------------- */

  const dispatch = useDispatch();

  const friendStatus = useSelector(s => s.friends.friendStatus);
  const incoming = useSelector(s => s.friends.incoming);

  /* ---------------- state ---------------- */

  const [rating, setRating] = useState(0);
  const [localPending, setLocalPending] = useState(false);

  const userId = otherUser?.user_id;

  /* ---------------- animation refs ---------------- */

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(1)).current;

  /* ---------------- effects ---------------- */

  useEffect(() => {
    if (userId && visible) {
      dispatch(friendStatusRequest(userId));
      setRating(0);
      setLocalPending(false);
    }
  }, [userId, visible, dispatch]);

  useEffect(() => {
    if (!visible) return;

    rotateAnim.setValue(0);
    scaleAnim.setValue(1);

    const anim = Animated.loop(
      Animated.parallel([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.06,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ])
    );

    anim.start();

    return () => {
      anim.stop();
    };

  }, [visible, rotateAnim, scaleAnim]);

  /* ---------------- ui helpers ---------------- */

  const renderFollowButton = () => {
    if (!userId) return null;

    const status = friendStatus[userId]?.state;

    if (status === "FRIEND") {
      return (
        <View style={styles.followingBtn}>
          <Text style={styles.followingText}>✓ Following</Text>
        </View>
      );
    }

    if (status === "PENDING_SENT" || localPending) {
      return (
        <View style={styles.pendingBtn}>
          <Text style={styles.followText}>Pending</Text>
        </View>
      );
    }

    if (status === "PENDING_RECEIVED") {
      const req = incoming.find(r => r.sender_id === userId);
      if (!req) return null;

      return (
        <TouchableOpacity
          style={styles.followBtn}
          onPress={() => {
            dispatch(friendAcceptRequest(req.request_id));

            setTimeout(() => {
              dispatch(friendStatusRequest(userId));
            }, 300);
          }}
        >
          <Text style={styles.followText}>Accept</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.followBtn}
        onPress={() => {
          setLocalPending(true);
          dispatch(friendRequest(userId));
        }}
      >
        <Text style={styles.followText}>➕ Follow</Text>
      </TouchableOpacity>
    );
  };

  /* ---------------- render ---------------- */

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>

          {/* animated avatar ring */}

          <Animated.View
            style={[
              styles.avatarOuter,
              {
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"]
                    })
                  },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <View style={styles.avatarRing}>
              <Image
                source={{ uri: otherUser?.avatar }}
                style={styles.avatar}
              />
            </View>
          </Animated.View>

          <Text style={styles.name}>
            {otherUser?.name}
          </Text>

          {/* rating */}

          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <TouchableOpacity
                key={i}
                onPress={() => setRating(i)}
              >
                <Ionicons
                  name={i <= rating ? "star" : "star-outline"}
                  size={24}
                  color="#ffb300"
                />
              </TouchableOpacity>
            ))}
          </View>

          {renderFollowButton()}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                onConfirm(rating);
              }}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default EndCallConfirmModal;

/* ---------------- styles ---------------- */

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center"
  },

  card: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    alignItems: "center"
  },

  avatarOuter: {
    width: 112,
    height: 112,
    borderRadius: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  avatarRing: {
    width: 102,
    height: 102,
    borderRadius: 51,
    borderWidth: 3,
    borderColor: "#c77dff",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#c77dff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 12,
  },

  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#ddd",
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8
  },

  ratingRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12
  },

  actions: {
    flexDirection: "row",
    gap: 14,
    marginTop: 16
  },

  cancelBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#eee"
  },

  confirmBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#ff5b77"
  },

  cancelText: { fontWeight: "700", color: "#333" },
  confirmText: { fontWeight: "700", color: "#fff" },

  followBtn: {
    marginTop: 6,
    backgroundColor: "#7e00ff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16
  },

  followText: { color: "#fff", fontWeight: "700" },

  pendingBtn: {
    marginTop: 6,
    backgroundColor: "#aaa",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16
  },

  followingBtn: {
    marginTop: 6,
    backgroundColor: "#e6f4ff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#4da3ff"
  },

  followingText: {
    color: "#1e88e5",
    fontWeight: "700"
  }
});
