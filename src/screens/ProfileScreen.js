import React, { useContext ,useCallback} from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../socket/SocketProvider";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { socketRef } = useContext(SocketContext);

  // 🔥 REDUX USER DATA
  const { userdata } = useSelector((state) => state.user);
useFocusEffect(
  useCallback(() => {
    dispatch({ type: "USER_DATA_REQUEST" });
  }, [])
);

  return (
    <SafeAreaView style={styles.safe}>
      {/* ================= TOP PURPLE SECTION ================= */}
      <View style={styles.topBg}>
        {/* HEART BACKGROUND (NO TOUCH) */}
        <Image
          pointerEvents="none"
          source={require("../assets/leftheart.png")}
          style={styles.leftHeart}
        />
        <Image
          pointerEvents="none"
          source={require("../assets/rightheart.png")}
          style={styles.rightHeart}
        />

        {/* HEADER */}
        <View style={styles.header}>
          <Icon
            name="arrow-back"
            size={22}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* AVATAR */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            <Image
              source={require("../assets/boy1.jpg")}
              style={styles.avatar}
            />
          </View>
        </View>

        {/* NAME + EDIT */}
        <View style={styles.nameRow}>
          <TouchableOpacity
            style={styles.editCircle}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("EditProfileScreen")}
          >
            <Icon name="pencil" size={14} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.username}>
            {userdata?.name || userdata?.user?.name || "User"}
          </Text>
        </View>

        {/* WHITE CURVE (NO TOUCH) */}
        <Svg
          pointerEvents="none"
          width={width}
          height={140}
          style={{ position: "absolute", bottom: -1 }}
        >
          <Path
            d={`
              M0 80
              C ${width * 0.25} 10, ${width * 0.75} 150, ${width} 80
              L ${width} 140
              L 0 140
              Z
            `}
            fill="#FFFFFF"
          />
        </Svg>
      </View>

      {/* ================= WHITE CONTENT ================= */}
      <View style={styles.content}>
        <View style={styles.listBox}>
          <Item
            icon="star-outline"
            color="#F6A623"
            title="Favorites"
            sub="you sent them a flashnote!"
          />

          <Item
            icon="person-outline"
            color="#FF5A5A"
            title="Invite Friends"
            sub="Invite your friends and earn Flashnotes!"
          />

          <Item
            icon="settings-outline"
            color="#999"
            title="App Settings"
            sub="Manage your notifications, connected accounts.."
            onPress={() => navigation.navigate("SettingScreen")}
          />

          <Item
            icon="help-circle-outline"
            color="#2ECC71"
            title="Need Help?"
            sub="FAQ, tutorial and contact"
            onPress={() => navigation.navigate("HelpCenterScreen")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

/* ================= LIST ITEM ================= */
const Item = ({ icon, color, title, sub, onPress }) => (
  <TouchableOpacity
    style={styles.item}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Icon name={icon} size={22} color={color} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemSub}>{sub}</Text>
    </View>
    <Icon name="chevron-forward" size={18} color="#aaa" />
  </TouchableOpacity>
);

export default ProfileScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /* TOP PURPLE */
  topBg: {
    height: 300,
    backgroundColor: "#F5E1FF",
  },

  leftHeart: {
    position: "absolute",
    left: -30,
    top: 40,
    width: 150,
    height: 150,
    resizeMode: "contain",
  },

  rightHeart: {
    position: "absolute",
    right: -40,
    top: 30,
    width: 170,
    height: 170,
    resizeMode: "contain",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
  },

  avatarWrap: {
    alignItems: "center",
    marginTop: 5,
  },

  avatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: "#C44DFF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  editCircle: {
    backgroundColor: "#C44DFF",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  username: {
    fontSize: 20,
    fontWeight: "700",
  },

  /* WHITE CONTENT */
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 20,
  },

  listBox: {
    backgroundColor: "#FFFFFF",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },

  itemTitle: {
    fontSize: 14,
    fontWeight: "500",
  },

  itemSub: {
    fontSize: 11,
    color: "#777",
    marginTop: 2,
  },
});
