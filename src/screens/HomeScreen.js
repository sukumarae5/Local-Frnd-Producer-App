import React, { useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { userDatarequest } from "../features/user/userAction";
import { SocketContext } from "../socket/SocketProvider";

const { width, height } = Dimensions.get("window");

/* ================= RESPONSIVE HELPERS ================= */
const wp = (v) => (width * v) / 100;
const hp = (v) => (height * v) / 100;
const iconSize = (v) => wp(v);

/* ================= DUMMY ACTIVE PALS ================= */
const activePals = [
  { id: 1, name: "Aadhya", img: require("../assets/girl1.jpg") },
  { id: 2, name: "Yuvaan", img: require("../assets/boy1.jpg") },
  { id: 3, name: "Luna", img: require("../assets/girl2.jpg") },
  { id: 4, name: "Hannah", img: require("../assets/girl3.jpg") },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
const socketRef=useContext(SocketContext)
const socket= socketRef?.current;

  const { userdata } = useSelector((state) => state.user);

  const profilePhotoURL = userdata?.primary_image?.photo_url;

  const imageUrl = profilePhotoURL
    ? { uri: profilePhotoURL }
    : require("../assets/boy2.jpg");

  /* ================= LOAD USER ================= */
  useEffect(() => {
    dispatch(userDatarequest());
  }, []);

  /* ================= SOCKET (GLOBAL) ================= */
 useEffect(() => {
    if (!socket) return;

    const onPresence = (data) => {
      console.log("👤 Presence:", data.user_id, data.status);
    };

    socket.on("presence_update", onPresence);

    return () => {
      socket.off("presence_update", onPresence);
    };
  }, [socket]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0A001A" }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>Local Friend</Text>
            <Text style={styles.subText}>
              Start with charm, stay for connection!
            </Text>
          </View>

          <View style={styles.rightHeader}>
            <TouchableOpacity style={{ marginRight: wp(3) }}>
              <Icon name="bell-outline" size={iconSize(6)} color="#fff" />
            </TouchableOpacity>

            {/* COINS */}
            <View style={styles.coinBox}>
              <Icon
                name="currency-eth"
                size={iconSize(5)}
                color="#FFD700"
              />
              <Text style={styles.coinText}>
                {userdata?.user?.coin_balance ?? 0}
              </Text>
            </View>

            {/* PROFILE PIC */}
            <TouchableOpacity
              onPress={() => navigation.navigate("UplodePhotoScreen")}
            >
              <Image source={imageUrl} style={styles.profilePic} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= OFFER ================= */}
        <View style={styles.offerCard}>
          <Text style={styles.offerTag}>Special offer for 1 day</Text>
          <Text style={styles.offerTitle}>
            Buy 100 coins, get 20 extra absolutely free!
          </Text>
          <TouchableOpacity style={styles.claimBtn}>
            <Text style={styles.claimText}>Claim Now</Text>
          </TouchableOpacity>
        </View>

        {/* ================= ACTIVE PALS ================= */}
        <Text style={styles.sectionTitle}>Active Pals</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {activePals.map((user) => (
            <View key={user.id} style={styles.palCard}>
              <Image source={user.img} style={styles.avatar} />
              <Text style={styles.palName}>{user.name}</Text>

              <View style={styles.palActionsRow}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Icon name="phone" size={iconSize(4)} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn}>
                  <Icon name="video" size={iconSize(4)} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn}>
                  <Icon
                    name="message-text"
                    size={iconSize(4)}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* ================= START CONNECTING ================= */}
        <Text style={styles.sectionTitle}>Start connecting</Text>

        <View style={styles.connectRow}>
          <TouchableOpacity
            style={styles.connectBox}
            onPress={() => navigation.navigate("TrainersCallpage")}
          >
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

        <View style={{ height: hp(15) }} />
      </ScrollView>

      {/* ================= BOTTOM NAV ================= */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home-outline" size={iconSize(7)} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Icon name="message-outline" size={iconSize(7)} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.centerBtn}
          onPress={() => navigation.navigate("TrainersCallpage")}
        >
          <Icon name="phone" size={iconSize(8)} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Icon
            name="clock-time-eight-outline"
            size={iconSize(7)}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("ProfileScreen")}
        >
          <Icon
            name="account-circle-outline"
            size={iconSize(7.5)}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { paddingHorizontal: wp(5), paddingTop: hp(5) },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  appTitle: {
    color: "#fff",
    fontSize: wp(6),
    fontWeight: "900",
  },

  subText: {
    color: "#c7b7ff",
    fontSize: wp(3),
    marginTop: 3,
    fontWeight: "600",
  },

  rightHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  coinBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#32004E",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.7),
    borderRadius: wp(6),
    marginRight: wp(2),
  },

  coinText: {
    color: "#FFD700",
    fontSize: wp(4),
    marginLeft: 5,
    fontWeight: "bold",
  },

  profilePic: {
    width: wp(13),
    height: wp(13),
    borderRadius: wp(7),
    borderWidth: 2,
    borderColor: "#ff00ff",
  },

  offerCard: {
    marginTop: hp(2),
    backgroundColor: "#1a0033",
    borderRadius: wp(5),
    padding: wp(5),
    borderWidth: 1,
    borderColor: "#5b009e",
  },

  offerTag: {
    color: "#ff47ff",
    fontWeight: "800",
    fontSize: wp(4),
    marginBottom: 8,
  },

  offerTitle: {
    color: "#fff",
    fontSize: wp(4.2),
    fontWeight: "700",
    marginBottom: 12,
  },

  claimBtn: {
    backgroundColor: "#ff00ff",
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
    alignItems: "center",
  },

  claimText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: wp(4),
  },

  sectionTitle: {
    color: "#fff",
    fontSize: wp(5),
    fontWeight: "800",
    marginTop: hp(3),
    marginBottom: hp(1.5),
  },

  palCard: {
    backgroundColor: "#1a0033",
    borderRadius: wp(4),
    padding: wp(3),
    marginRight: wp(4),
    borderWidth: 1,
    borderColor: "#5b009e",
    alignItems: "center",
  },

  avatar: {
    width: wp(27),
    height: wp(30),
    borderRadius: wp(3),
    resizeMode: "cover",
  },

  palName: {
    color: "#fff",
    fontWeight: "700",
    marginTop: hp(1),
    fontSize: wp(3.8),
  },

  palActionsRow: {
    flexDirection: "row",
    marginTop: hp(1.3),
  },

  actionBtn: {
    backgroundColor: "#32004E",
    padding: wp(2),
    borderRadius: wp(3),
    marginHorizontal: wp(0.7),
  },

  connectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  connectBox: {
    width: "30%",
    backgroundColor: "#1a0033",
    borderRadius: wp(5),
    paddingVertical: hp(3),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#5b009e",
  },

  connectBoxActive: {
    width: "30%",
    backgroundColor: "#5b009e",
    borderRadius: wp(5),
    paddingVertical: hp(3),
    alignItems: "center",
  },

  connectText: {
    color: "#fff",
    marginTop: hp(1),
    fontSize: wp(3.5),
    fontWeight: "700",
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: hp(10),
    backgroundColor: "#120020",
    borderTopLeftRadius: wp(7),
    borderTopRightRadius: wp(7),
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: hp(1.5),
  },

  navItem: { padding: wp(2) },

  centerBtn: {
    width: wp(18),
    height: wp(18),
    backgroundColor: "#ff00ff",
    borderRadius: wp(10),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(3),
    elevation: 15,
  },
});
