import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Modal,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";


const ReciverHomeScreen = () => {
  const [showModal, setShowModal] = useState(false);
const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      {/* 🔝 HEADER */}
      <LinearGradient colors={["#6a007a", "#3b003f"]} style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appName}>Local Friend</Text>
          <Text style={styles.tagline}>
            Start with charm, stay for connection!
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.walletBox}>
            <Icon name="wallet-outline" size={18} color="#FFD700" />
            <Text style={styles.walletText}>₹ 2</Text>
          </View>

          <Icon name="notifications-outline" size={22} color="#fff" />
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={styles.avatar}
          />
        </View>
      </LinearGradient>

      {/* 🟣 MIDDLE */}
      <View style={styles.middle}>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <LinearGradient
            colors={["#ff2fd2", "#b000ff"]}
            style={styles.onlineBtn}
          >
            <Icon name="radio" size={34} color="#fff" />
            <Text style={styles.onlineText}>GO ONLINE</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 🔻 BOTTOM TAB */}
      <View style={styles.bottomTab}>
        <Icon name="home" size={24} color="#fff" />
        <Icon name="chatbubble-ellipses-outline" size={24} color="#fff" />
       <View style={styles.centerTab}>
  <Icon name="call" size={28} color="#fff" />
</View>

        <Icon name="time-outline" size={24} color="#fff" />
        <Icon name="person-outline" size={24} color="#fff" />
      </View>

      {/* 🚨 CUSTOM ALERT MODAL */}
      <Modal transparent animationType="fade" visible={showModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {/* TOP */}
            <LinearGradient
              colors={["#ff2fd2", "#b000ff"]}
              style={styles.modalHeader}
            >
              <Icon name="call" size={28} color="#fff" />
              <Text style={styles.modalTitle}>Choose Call Type</Text>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowModal(false)}
              >
                <Icon name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>

            {/* BODY */}
          <View style={styles.modalBody}>
  {/* Audio Call → Home Screen */}
  <TouchableOpacity
    style={styles.callBtn}
    onPress={() => navigation.navigate("AudiocallScreen")}
  >
    <Icon name="call-outline" size={26} color="#fff" />
    <Text style={styles.callText}>Audio Call</Text>
  </TouchableOpacity>

  {/* Video Call → Boys Screen */}
  <TouchableOpacity
    style={styles.callBtn}
    onPress={() => navigation.navigate("VideocallCsreen")}
  >
    <Icon name="videocam-outline" size={26} color="#fff" />
    <Text style={styles.callText}>Video Call</Text>
  </TouchableOpacity>
</View>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ReciverHomeScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#2a002d",
  },

  /* HEADER */
  header: {
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerLeft: { flex: 1 },
  appName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  tagline: {
    color: "#d3a6dd",
    fontSize: 12,
    marginTop: 6,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  walletBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4c0055",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  walletText: { color: "#fff", fontWeight: "700" },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },

  /* MIDDLE */
  middle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  onlineBtn: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: "center",
    alignItems: "center",
  },
  onlineText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },

  /* BOTTOM TAB */
  bottomTab: {
    height: 72,
    backgroundColor: "#3b003f",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  centerTab: {
    backgroundColor: "#ff2fd2",
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 26,
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#2a002d",
    borderRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    padding: 16,
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 6,
  },
  closeBtn: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  modalBody: {
    padding: 20,
    gap: 16,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#4c0055",
  },
  callText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
