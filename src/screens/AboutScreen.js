import React from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useSelector } from "react-redux";

const { width } = Dimensions.get("window");

const AboutScreen = () => {
  const data = useSelector((state) => state.otherUsers.profile);

  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, color: "#555" }}>Loading profile...</Text>
      </View>
    );
  }

  const profile = data?.profile || data;

  const {
    user = {},
    images = {},
    lifestyles = [],
    interests = [],
    location = {},
  } = profile;

  const avatarSource = images?.profile_image
    ? { uri: images.profile_image }
    : require("../assets/boy1.jpg");

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* IMAGE HEADER */}
        <View style={{ height: 400 }}>
          <ImageBackground source={avatarSource} style={styles.bgImage}>

            {/* WHITE HEART BUTTON */}
            <TouchableOpacity style={styles.heartBtn}>
              <View style={styles.heartCircle}>
                <Text style={{ fontSize: 20 }}>🤍</Text>
              </View>
            </TouchableOpacity>

            {/* USER DATA PANEL */}
            <View style={styles.frostPanel}>
              <Text style={styles.nameText}>{user?.name || "Unknown User"}</Text>
              <Text style={styles.distanceText}>📍 6 KM away from you</Text>

              <TouchableOpacity style={styles.followBtn}>
                <Text style={styles.followBtnText}>➕ Follow</Text>
              </TouchableOpacity>
            </View>

            {/* CURVE */}
            <Svg width={width} height={100} style={{ position: "absolute", bottom: -1 }}>
              <Path
                d={`M0 40 C ${width * 0.35} 120, ${width * 0.65} -30, ${width} 40 L ${width} 100 L 0 100 Z`}
                fill="#fff"
              />
            </Svg>
          </ImageBackground>
        </View>

        {/* CONTENT */}
        <View style={styles.contentBox}>

          {/* ABOUT */}
          <Text style={styles.heading}>About</Text>
          <View style={styles.tagWrap}>
            <Tag text={user?.gender || "None"} icon="👤" />
            <Tag text={user?.age ? `${user.age} Years` : "None"} icon="🎂" />
            <Tag
              text={
                location?.city || location?.country
                  ? `${location.city || ""}, ${location.country || ""}`
                  : "None"
              }
              icon="📍"
            />
            <Tag text={"English"} icon="🗣" />
            <Tag text={"None"} icon="📏" />
          </View>

          <Text style={styles.bioText}>
            {user?.bio || "None"}
          </Text>

          {/* LIFESTYLE */}
          <Text style={styles.heading}>Life Style</Text>
          <View style={styles.tagWrap}>
            {lifestyles.length > 0
              ? lifestyles.map((item, index) => (
                  <Tag key={index} text={item?.name || "None"} icon="🥗" />
                ))
              : <Tag text="None" icon="🥗" />
            }
          </View>

          {/* INTERESTS */}
          <Text style={styles.heading}>Interested</Text>
          <View style={styles.tagWrap}>
            {interests.length > 0
              ? interests.map((item, index) => (
                  <Tag key={index} text={item?.name || "None"} icon="⭐" />
                ))
              : <Tag text="None" icon="⭐" />
            }
          </View>

          {/* GALLERY */}
          <Text style={styles.heading}>Gallery</Text>
          {images?.gallery?.length > 0 ? (
            <View style={styles.galleryGrid}>
              {images.gallery.map((img, idx) => (
                <Image key={idx} source={{ uri: img }} style={styles.galleryItem} />
              ))}
            </View>
          ) : (
            <Text style={{ color: "#777", marginTop: 6 }}>No images available</Text>
          )}

        </View>
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomCircle}>
          <Text style={{ fontSize: 20, color: "#fff" }}>✖</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.helloBtn}>
          <Text style={styles.helloText}>💬 SAY HELLO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AboutScreen;

/* COMPONENTS */
const Tag = ({ text, icon }) => (
  <View style={styles.tagBox}>
    <Text style={{ fontSize: 12 }}>
      {icon} {text}
    </Text>
  </View>
);

/* STYLES */
const styles = StyleSheet.create({
  bgImage: { width: "100%", height: "100%" },

  heartBtn: {
    position: "absolute",
    top: 230,
    right: 20,
    zIndex: 5,
  },

  heartCircle: {
    backgroundColor: "#e04af1e4",
    borderRadius: 40,
    padding: 10,
    elevation: 8,
  },

  frostPanel: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  nameText: { fontSize: 18, fontWeight: "700", color: "#333" },
  distanceText: { fontSize: 13, color: "#7e7e7e", marginTop: 3 },

  followBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#007aff",
    borderRadius: 16,
    alignSelf: "flex-start",
  },

  followBtnText: { color: "#fff", fontWeight: "600", fontSize: 12 },

  contentBox: {
    padding: 20,
    backgroundColor: "#fff",
    marginTop: -20,
  },

  heading: { fontSize: 16, fontWeight: "700", marginTop: 10, marginBottom: 5 },

  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },

  tagBox: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: "#FCE8EF",
  },

  bioText: { color: "#555", lineHeight: 18, marginBottom: 15 },

  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  galleryItem: {
    width: (width / 2) - 25,
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },

  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },

  bottomCircle: {
    width: 44,
    height: 44,
    backgroundColor: "#7e00ff",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  helloBtn: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: "#7e00ff",
    paddingVertical: 12,
    borderRadius: 28,
    alignItems: "center",
  },

  helloText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
