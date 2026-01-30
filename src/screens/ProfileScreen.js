import React, { useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { userlogoutrequest } from "../features/user/userAction";
import WelcomeScreenbackgroungpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";
import { SocketContext } from "../socket/SocketProvider";

const ProfileScreen = () => {
  const [tab, setTab] = useState("Safety");
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { socketRef } = useContext(SocketContext);

  /* ================= LOGOUT ================= */
  const handlelogoubutton = async () => {
    try {
      socketRef?.current?.emit("user_offline");
      socketRef?.current?.disconnect();

      await AsyncStorage.multiRemove(["twittoke", "user_id"]);

      dispatch(userlogoutrequest());

      navigation.reset({
        index: 0,
        routes: [{ name: "Phone" }],
      });
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.headerRow}>
          <Icon
            name="arrow-back"
            size={26}
            color="#000"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerText}>Profile</Text>
        </View>

        {/* PROFILE IMAGE */}
        <View style={styles.avatarContainer}>
          <Image
            source={require("../assets/boy1.jpg")}
            style={styles.avatar}
          />
        </View>

        {/* NAME */}
        <Text style={styles.username}>Shoshanna</Text>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>80%</Text>
            <Text style={styles.statLabel}>Reach</Text>
          </View>

          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>70</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>

          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>1k</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {/* TABS */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "Safety" && styles.activeTab]}
            onPress={() => setTab("Safety")}
          >
            <Text
              style={[
                styles.tabText,
                tab === "Safety" && styles.activeTabText,
              ]}
            >
              Safety
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, tab === "Plans" && styles.activeTab]}
            onPress={() => {
              setTab("Plans");
              navigation.navigate("PlanScreen");
            }}
          >
            <Text
              style={[
                styles.tabText,
                tab === "Plans" && styles.activeTabText,
              ]}
            >
              Plans
            </Text>
          </TouchableOpacity>
        </View>

        {/* OPTIONS */}
        <View style={styles.listBox}>

          <TouchableOpacity style={styles.listItem}>
            <Icon name="settings-outline" size={24} color="#666" />
            <Text style={styles.listText}>Settings</Text>
            <Icon name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.listItem}>
            <Icon name="help-circle-outline" size={24} color="#666" />
            <Text style={styles.listText}>Support</Text>
            <Icon name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.listItem}>
            <Icon name="document-text-outline" size={24} color="#666" />
            <Text style={styles.listText}>Privacy Policy</Text>
            <Icon name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          {/* ✅ FIXED ABOUT ROW */}
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => navigation.navigate("AboutScreen")}
          >
            <Icon name="information-circle-outline" size={24} color="#666" />
            <Text style={styles.listText}>About</Text>
            <Icon name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handlelogoubutton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default ProfileScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
    flex: 1,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerText: {
    color: "#111",
    fontSize: 22,
    fontWeight: "600",
    marginLeft: 10,
  },

  avatarContainer: {
    alignItems: "center",
    marginTop: 25,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#ff4dff",
  },

  username: {
    marginTop: 10,
    color: "#111",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 25,
  },

  statBlock: {
    alignItems: "center",
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "700",
  },

  statLabel: {
    fontSize: 14,
  },

  tabsContainer: {
    backgroundColor: "#3b2047",
    borderRadius: 35,
    padding: 6,
    flexDirection: "row",
    marginBottom: 25,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#ff4dff",
  },

  tabText: {
    color: "#000",
    fontSize: 16,
  },

  activeTabText: {
    fontWeight: "700",
  },

  listBox: {
    marginTop: 10,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 0.3,
    borderBottomColor: "#ccc",
  },

  listText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
  },

  logoutBtn: {
    marginTop: 40,
    borderWidth: 1,
    borderColor: "#ff4dff",
    paddingVertical: 12,
    borderRadius: 12,
  },

  logoutText: {
    color: "#ff4dff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
