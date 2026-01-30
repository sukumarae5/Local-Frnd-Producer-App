import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";

import {
  friendRequest,
  friendAcceptRequest,
  friendStatusRequest,
} from "../features/friend/friendAction";

const { width } = Dimensions.get("window");

const AboutScreen = ({ navigation }) => {
  /* ================= HOOKS ================= */
  const dispatch = useDispatch();
  const [localPending, setLocalPending] = useState(false);

  const profileData = useSelector((s) => s.otherUsers.profile);
  const friendStatus = useSelector((s) => s.friends.friendStatus);
  const incoming = useSelector((s) => s.friends.incoming);

  const profile = profileData?.profile || profileData || {};
  const user = profile.user || null;

  const images = profile.images || {};
  const location = profile.location || {};
  const lifestyles = profile.lifestyles || [];
  const interests = profile.interests || [];

  const userId = user?.user_id;

  console.log("AboutScreen Rendered for User ID:", userId);

  /* ================= LOAD FRIEND STATUS ================= */
  useEffect(() => {
    if (userId) {
      dispatch(friendStatusRequest(userId));
    }
  }, [userId, dispatch]);

  /* ================= RESET LOCAL PENDING ================= */
  useEffect(() => {
    if (userId) {
      setLocalPending(false);
    }
  }, [friendStatus[userId]?.state]);

  const renderFollowButton = () => {
  if (!userId) return null;

  const status = friendStatus[userId]?.state;

  /* ================= FOLLOWING (FRIEND) ================= */
  if (status === "FRIEND") {
    return (
      <View style={styles.followingBtn}>
        <Text style={styles.followingText}>✓ Following</Text>
      </View>
    );
  }

  /* ================= PENDING SENT ================= */
  if (status === "PENDING_SENT" || localPending) {
    return (
      <View style={styles.pendingBtn}>
        <Text style={styles.followText}>Pending</Text>
      </View>
    );
  }

  /* ================= PENDING RECEIVED ================= */
  if (status === "PENDING_RECEIVED") {
    const req = incoming.find((r) => r.sender_id === userId);
    if (!req) return null;

    return (
      <TouchableOpacity
        style={styles.followBtn}
        onPress={() => {
          dispatch(friendAcceptRequest(req.request_id));

          // 🔄 refresh status after accept
          setTimeout(() => {
            dispatch(friendStatusRequest(userId));
          }, 300);
        }}
      >
        <Text style={styles.followText}>Accept</Text>
      </TouchableOpacity>
    );
  }

  /* ================= FOLLOW ================= */
  return (
    <TouchableOpacity
      activeOpacity={0.7}
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


  const avatarSource = images?.profile_image
    ? { uri: images.profile_image }
    : require("../assets/boy1.jpg");

  /* ================= LOADING ================= */
  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#555" }}>Loading profile…</Text>
      </View>
    );
  }

  /* ================= UI ================= */
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ height: 400 }}>
          <ImageBackground
            source={avatarSource}
            style={styles.bgImage}
            pointerEvents="box-none"
          >
            <View style={styles.frostPanel}>
              <Text style={styles.nameText}>{user.name}</Text>
              <Text style={styles.subText}>
                📍 {location.city || location.country || "Unknown"}
              </Text>

              {renderFollowButton()}
            </View>

            <Svg
              width={width}
              height={100}
              pointerEvents="none"
              style={{ position: "absolute", bottom: -1 }}
            >
              <Path
                d={`M0 40 C ${width * 0.35} 120, ${
                  width * 0.65
                } -30, ${width} 40 L ${width} 100 L 0 100 Z`}
                fill="#fff"
              />
            </Svg>
          </ImageBackground>
        </View>

        <View style={styles.content}>
          <Text style={styles.heading}>About</Text>
          <Text>{user.bio || "No bio available"}</Text>

          <Text style={styles.heading}>Lifestyle</Text>
          <View style={styles.row}>
            {lifestyles.length ? (
              lifestyles.map((l, i) => <Tag key={i} text={l.name} />)
            ) : (
              <Text style={styles.empty}>None</Text>
            )}
          </View>

          <Text style={styles.heading}>Interests</Text>
          <View style={styles.row}>
            {interests.length ? (
              interests.map((i, idx) => <Tag key={idx} text={i.name} />)
            ) : (
              <Text style={styles.empty}>None</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AboutScreen;

/* ================= TAG ================= */
const Tag = ({ text }) => (
  <View style={styles.tag}>
    <Text>{text}</Text>
  </View>
);

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  bgImage: { width: "100%", height: "100%" },

  frostPanel: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.75)",
    zIndex: 10,
  },

  nameText: { fontSize: 20, fontWeight: "700" },
  subText: { fontSize: 13, marginTop: 3 },

  followBtn: {
    marginTop: 10,
    backgroundColor: "#7e00ff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },

  followedBtn: {
    marginTop: 10,
    backgroundColor: "#00c853",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },

  pendingBtn: {
    marginTop: 10,
    backgroundColor: "#aaa",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },

  followText: { color: "#fff", fontWeight: "700" },

  content: { padding: 20 },
  heading: { fontSize: 16, fontWeight: "700", marginTop: 15 },

  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#f1e6ff",
  },
  empty: { color: "#777", marginTop: 6 },
  followingBtn: {
  marginTop: 10,
  backgroundColor: "#e6f4ff",
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 16,
  alignSelf: "flex-start",
  borderWidth: 1,
  borderColor: "#4da3ff",
},

followingText: {
  color: "#1e88e5",
  fontWeight: "700",
  fontSize: 14,
},

});
