import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";

const { width, height } = Dimensions.get("window");
const AVATAR_SIZE = 70;
const GAP = 15;

const TrainersCallPage = () => {
  const avatars = [
    { name: "Lovely", img: require("../assets/boy1.jpg"), type: "video" },
    { name: "Sana", img: require("../assets/girl1.jpg"), type: "video" },
    { name: "Raya", img: require("../assets/boy2.jpg"), type: "video" },
    { name: "Sharks", img: require("../assets/boy3.jpg"), type: "video" },
    { name: "Sanji", img: require("../assets/girl2.jpg"), type: "video" },
    { name: "Priya", img: require("../assets/girl3.jpg"), type: "highlight" },
    { name: "Ramu", img: require("../assets/boy4.jpg"), type: "video" },
    { name: "Nami", img: require("../assets/girl5.jpg"), type: "video" },
    { name: "Asta", img: require("../assets/boy5.jpg"), type: "audio" },
    { name: "Rubbi", img: require("../assets/boy1.jpg"), type: "video" },
    { name: "Zoe", img: require("../assets/girl4.jpg"), type: "video" },
  ];

  const generatePositions = () => {
    const positions = [];
    const maxCols = Math.floor(width / (AVATAR_SIZE + GAP));
    const maxRows = Math.floor((height * 0.5) / (AVATAR_SIZE + GAP));

    for (let i = 0; i < avatars.length; i++) {
      const col = i % maxCols;
      const row = Math.floor(i / maxCols) % maxRows;
      positions.push({
        x: col * (AVATAR_SIZE + GAP) + GAP / 2,
        y: row * (AVATAR_SIZE + GAP) + GAP / 2,
      });
    }
    return positions;
  };

  const initialPositions = generatePositions();
  const animatedPositions = useRef(
    avatars.map(
      (_, i) =>
        new Animated.ValueXY({ x: initialPositions[i].x, y: initialPositions[i].y })
    )
  ).current;

  useEffect(() => {
    const animateAll = () => {
      const animations = animatedPositions.map((pos) =>
        Animated.timing(pos, {
          toValue: {
            x: Math.random() * (width - AVATAR_SIZE - GAP),
            y: Math.random() * (height * 0.5 - AVATAR_SIZE - GAP),
          },
          duration: 4000 + Math.random() * 2000,
          useNativeDriver: false,
        })
      );

      Animated.parallel(animations).start(() => animateAll());
    };

    animateAll();
  }, [animatedPositions]);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={["#4B0082", "#2E004D"]} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Personal Training</Text>
          <View style={styles.coinsBox}>
            <Icon name="wallet-outline" size={18} color="#FFC300" />
            <Text style={styles.coinText}>100</Text>
            <Image source={require("../assets/boy1.jpg")} style={styles.userIcon} />
          </View>
        </View>

        {/* FILTERS */}
        <View style={styles.filters}>
          <TouchableOpacity style={styles.filterBtn}>
            <Icon name="location" size={14} color="#FF3ED8" />
            <Text style={styles.filterText}>Near Me</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Icon name="shuffle" size={14} color="#FF3ED8" />
            <Text style={styles.filterText}>Random</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Icon name="people" size={14} color="#FF3ED8" />
            <Text style={styles.filterText}>Followed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Icon name="globe-outline" size={14} color="#FF3ED8" />
            <Text style={styles.filterText}>Language</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* MAP */}
      <View style={styles.mapContainer}>
        <Image source={require("../assets/map.jpg")} style={styles.map} />
        {avatars.map((item, index) => (
          <Animated.View
            key={index}
            style={[styles.avatarWrapper, animatedPositions[index].getLayout()]}
          >
            <View
              style={[
                styles.avatarCircle,
                item.type === "highlight" && styles.highlightBorder,
              ]}
            >
              <Image source={item.img} style={styles.avatarImg} />
            </View>
            <View style={styles.nameTag}>
              <Text style={styles.nameText}>{item.name}</Text>
              {item.type === "video" && <Feather name="video" size={12} color="#fff" />}
              {item.type === "audio" && <Feather name="phone" size={12} color="#fff" />}
            </View>
          </Animated.View>
        ))}
      </View>

      {/* CALL BUTTONS */}
      <View style={styles.callButtons}>
        <TouchableOpacity style={styles.callBox}>
          <Text style={styles.callTitle}>Random video Calls</Text>
          <Feather name="video" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.callBox}>
          <Text style={styles.callTitle}>Random Audio Calls</Text>
          <Feather name="phone" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Icon name="home-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="chatbubble-ellipses-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.centerBtn}>
          <LinearGradient colors={["#FF22E9", "#B100D1"]} style={styles.centerIcon}>
            <Icon name="flash" size={32} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="notifications-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="person-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TrainersCallPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#130018" },
  header: { paddingTop: 50, paddingHorizontal: 15, paddingBottom: 15 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#fff", fontSize: 20, fontWeight: "600" },
  coinsBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#3A003F", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  coinText: { color: "#fff", marginLeft: 5, marginRight: 10 },
  userIcon: { width: 28, height: 28, borderRadius: 50 },
  filters: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  filterBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#3A003F", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, marginRight: 8 },
  filterText: { color: "#fff", fontSize: 12, marginLeft: 5 },
  mapContainer: { flex: 1 },
  map: { width: "100%", height: "100%", position: "absolute", opacity: 0.28 },
  avatarWrapper: { position: "absolute", alignItems: "center" },
  avatarCircle: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, borderWidth: 3, borderColor: "#FF46D9", overflow: "hidden" },
  highlightBorder: { borderColor: "#00A6FF", borderWidth: 4 },
  avatarImg: { width: "100%", height: "100%" },
  nameTag: { backgroundColor: "#FF00E6", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 15, flexDirection: "row", alignItems: "center", marginTop: 5 },
  nameText: { color: "#fff", fontSize: 12, marginRight: 4 },
  callButtons: { position: "absolute", bottom: 90, width: "100%", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20 },
  callBox: { backgroundColor: "#A100D7", width: width * 0.42, height: 90, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  callTitle: { color: "#fff", fontSize: 14, marginBottom: 5 },
  bottomNav: { height: 70, flexDirection: "row", backgroundColor: "#20002C", alignItems: "center", justifyContent: "space-around" },
  centerBtn: { width: 70, height: 70, borderRadius: 40, marginTop: -35, justifyContent: "center", alignItems: "center" },
  centerIcon: { width: 60, height: 60, borderRadius: 35, justifyContent: "center", alignItems: "center" },
});
