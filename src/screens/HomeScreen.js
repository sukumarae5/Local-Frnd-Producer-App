import React, { useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from "react-native";
import WelcomeScreenbackgroungpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { userDatarequest } from "../features/user/userAction";
import { SocketContext } from "../socket/SocketProvider";
import {randomUserRequest} from "../features/RandomUsers/randomuserAction"
import StoriesScreen from "./StoriesScreen";

const { width, height } = Dimensions.get("window");
const wp = (v) => (width * v) / 100;
const hp = (v) => (height * v) / 100;
const iconSize = (v) => wp(v);

const activePals = [
  { id: 1, name: "Aadhya", img: require("../assets/girl1.jpg") },
  { id: 2, name: "Yuvaan", img: require("../assets/boy1.jpg") },
  { id: 3, name: "Luna", img: require("../assets/girl2.jpg") },
  { id: 4, name: "Hannah", img: require("../assets/girl3.jpg") },
  { id: 5, name: "Aarav", img: require("../assets/boy2.jpg") },
];

const offers = [
  { id: 1, text: "Buy 100 Coins, Get 20 Free!" },
  { id: 2, text: "Buy 200 Coins, Get 50 Free!" },
  { id: 3, text: "Buy 500 Coins, Get 150 Free!" },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { socketRef } = useContext(SocketContext);
  const socket = socketRef?.current;
  const { userdata } = useSelector((state) => state.user);
  const { incoming } = useSelector((state) => state.friends);
console.log(userdata)
  const profilePhotoURL = userdata?.primary_image?.photo_url;
  const imageUrl = profilePhotoURL
    ? { uri: profilePhotoURL }
    : require("../assets/boy2.jpg");

  useEffect(() => {
    dispatch(userDatarequest());
    dispatch(randomUserRequest())
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onPresence = (data) => console.log("👤 Presence:", data);
    socket.on("presence_update", onPresence);
    return () => socket.off("presence_update", onPresence);
  }, [socket]);

  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.root}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

          {/* ========== CLEAN FIGMA HEADER ========== */}
          <View style={styles.headerRow}>

            {/* COIN BOX */}
            <View style={styles.coinBox}>
              <Icon name="currency-eth" size={iconSize(5)} color="#FFD700" />
              <Text style={styles.coinText}>{userdata?.user?.coin_balance ?? 0}</Text>
            </View>

            {/* MESSAGE ICON */}
            <TouchableOpacity
              style={{ marginHorizontal: wp(2) }}
              onPress={() => navigation.navigate("MessagesScreen")}
            >
              <Icon name="message-text-outline" size={iconSize(6)} color="#000" />
            </TouchableOpacity>

            {/* BELL + BADGE */}
            <TouchableOpacity
              style={styles.bellWrap}
              onPress={() => navigation.navigate("FriendRequestsScreen")}
            >
              <Icon name="bell-outline" size={iconSize(6)} color="#000" />
             {incoming.length > 0 && (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>{incoming.length}</Text>
  </View>
)}

            </TouchableOpacity>

            {/* PROFILE */}
            <TouchableOpacity onPress={() => navigation.navigate("UplodePhotoScreen")}>
              <Image source={imageUrl} style={styles.profilePic} />
            </TouchableOpacity>

          </View>

          {/* SEARCH */}
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={iconSize(6)} color="#999" />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#8E8E93"
              style={styles.searchInput}
            />
          </View>

                 <StoriesScreen/>


          {/* OFFERS */}
          <Text style={styles.sectionLabel}>Offers</Text>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: hp(1) }}
          >
            {offers.map((o) => (
              <View key={o.id} style={styles.offerCard}>
                <Text style={styles.offerText}>{o.text}</Text>
              </View>
            ))}
          </ScrollView>

          {/* DOTS */}
          <View style={styles.dotsRow}>
            {offers.map((_, idx) => (
              <View key={idx} style={[styles.dot, idx === 0 && styles.dotActive]} />
            ))}
          </View>

          {/* LIKE-MINDED */}
          <Text style={styles.sectionLabel}>Like Minded People</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: wp(2) }}
          >
            {activePals.map((p) => (
              <View key={p.id} style={styles.likeCard}>
                <Image source={p.img} style={styles.likeAvatar} />
                <Text style={styles.likeName}>{p.name}</Text>
              </View>
            ))}
          </ScrollView>

          {/* ACTIVE DOST */}
          <Text style={styles.sectionLabel}>Active Dost</Text>
          <Text style={styles.placeholderText}>No active dost right now...</Text>

          {/* RANDOM CALL BUTTONS */}
          <View style={styles.bottomActionRow}>
            <TouchableOpacity style={styles.connectBox} onPress={() => navigation.navigate("TrainersCallpage")}>
              <Icon name="dice-5" size={iconSize(6)} color="#fff" />
              <Text style={styles.connectText}>Random Calls</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.connectBox}>
              <Icon name="map-marker" size={iconSize(6)} color="#fff" />
              <Text style={styles.connectText}>Local Calls</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.connectBoxActive}>
              <Icon name="account-multiple" size={iconSize(6)} color="#fff" />
              <Text style={styles.connectText}>Followed Calls</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: hp(12) }} />
        </ScrollView>

      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default HomeScreen;

/* ====================== STYLES ======================== */
const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { paddingHorizontal: wp(5), paddingTop: hp(2) },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: hp(2),
    marginTop:30
  },

  coinBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5D8",
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: wp(4),
    marginRight: wp(40),
  },

  coinText: {
    marginLeft: wp(2),
    fontSize: wp(4),
    fontWeight: "700",
    color: "#000",
  },

  bellWrap: {
    marginHorizontal: wp(2),
    position: "relative",
  },

  profilePic: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    borderWidth: 2,
    borderColor: "#A35DFE",
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ff0044",
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#b678f5ff",
    borderRadius: wp(4),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    marginTop: hp(1),
    backgroundColor: "#faf8fbff",
  },

  searchInput: {
    flex: 1,
    fontSize: wp(4),
    marginLeft: wp(2),
    color: "#000",
  },

  // sectionLabel: {
  //   fontSize: wp(5),
  //   fontWeight: "700",
  //   color: "#111",
  //   marginTop: hp(3),
  //   marginBottom: hp(1),
  // },

  // storyContainer: { alignItems: "center", marginRight: wp(4) },

  // yourStoryCircle: {
  //   width: wp(18),
  //   height: wp(18),
  //   borderRadius: wp(9),
  //   backgroundColor: "#EFE7FF",
  //   justifyContent: "center",
  //   alignItems: "center",
  // },

  // storyAvatar: {
  //   width: wp(18),
  //   height: wp(18),
  //   borderRadius: wp(9),
  // },

  // storyName: {
  //   marginTop: hp(0.5),
  //   fontSize: wp(3),
  //   color: "#333",
  //   fontWeight: "500",
  // },

  offerCard: {
    width: width - wp(10),
    height: hp(15),
    backgroundColor: "#F0EAFF",
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(4),
    borderWidth: 1,
    borderColor: "#E0D6FF",
  },

  offerText: {
    color: "#4C1D95",
    fontSize: wp(4.2),
    fontWeight: "700",
    textAlign: "center",
  },

  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: hp(1),
  },

  dot: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
    backgroundColor: "#D4D4D4",
    marginHorizontal: wp(1),
  },

  dotActive: {
    backgroundColor: "#8B5CF6",
  },

  likeCard: { alignItems: "center", marginRight: wp(4) },

  likeAvatar: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    borderWidth: 2,
    borderColor: "#C4B5FD",
  },

  likeName: {
    fontSize: wp(3.2),
    color: "#222",
    marginTop: hp(0.5),
    fontWeight: "600",
  },

  placeholderText: {
    fontSize: wp(3.5),
    color: "#777",
    paddingLeft: wp(2),
    marginTop: hp(1),
  },

  bottomActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp(4),
  },

  connectBox: {
    width: "30%",
    backgroundColor: "#8B5CF6",
    borderRadius: wp(4),
    alignItems: "center",
    paddingVertical: hp(2),
  },

  connectBoxActive: {
    width: "30%",
    backgroundColor: "#7054e8",
    borderRadius: wp(4),
    alignItems: "center",
    paddingVertical: hp(2),
  },

  connectText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: wp(3),
    marginTop: hp(0.7),
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    height: hp(9),
    backgroundColor: "#FFFFFF",
  },

  navItem: {
    padding: wp(2),
    alignItems: "center",
  },
});
