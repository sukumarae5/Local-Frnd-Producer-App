import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { userlogoutrequest } from "../features/user/userAction";
import { SocketContext } from "../socket/SocketProvider";
import WelcomeScreenbackgroungpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";

const SettingScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { socketRef } = useContext(SocketContext);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  /* ================= LOGOUT ================= */
  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    socketRef?.current?.disconnect();
    await AsyncStorage.multiRemove(["twittoke", "user_id"]);
    dispatch(userlogoutrequest());
    navigation.reset({
      index: 0,
      routes: [{ name: "Phone" }],
    });
  };

  return (
    <WelcomeScreenbackgroungpage>
      <SafeAreaView style={styles.safe}>
        {/* ---------- HEADER ---------- */}
        <View style={styles.header}>
          <Icon
            name="arrow-back"
            size={22}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Setting</Text>
        </View>

        {/* ---------- SETTINGS LIST ---------- */}
        <View style={styles.listBox}>
          <Item icon="person-outline" title="Personal Information" />
          <Item icon="shield-checkmark-outline" title="Privacy & Permission" />
          <Item icon="notifications-outline" title="Notification" />
          <Item icon="lock-closed-outline" title="Security" />
          <Item icon="server-outline" title="Data & Storage" />
          <Item icon="chatbox-ellipses-outline" title="Feedback" />
          <Item icon="language-outline" title="Language" />
          <Item icon="information-circle-outline" title="About lokal frnd" />
        </View>

        {/* ---------- LOG OUT ---------- */}
        <TouchableOpacity
          style={styles.logoutItem}
          onPress={() => setShowLogoutModal(true)}
        >
          <View style={styles.logoutIcon}>
            <Icon name="log-out-outline" size={20} color="#fff" />
          </View>
          <Text style={styles.logoutText}>Log Out</Text>
          <Icon name="chevron-forward" size={18} color="#aaa" />
        </TouchableOpacity>

        {/* ---------- LOGOUT MODAL ---------- */}
        <Modal
          transparent
          visible={showLogoutModal}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalIcon}>
                <Icon name="person-outline" size={24} color="#fff" />
              </View>

              <Text style={styles.modalTitle}>Logout?</Text>
              <Text style={styles.modalSub}>
                Are you sure you want to logout?
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={styles.cancelText}>CANCEL</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleConfirmLogout}
                >
                  <Text style={styles.confirmText}>CONFIRM</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </WelcomeScreenbackgroungpage>
  );
};

/* ---------- REUSABLE ITEM ---------- */
const Item = ({ icon, title }) => (
  <TouchableOpacity style={styles.item}>
    <View style={styles.iconCircle}>
      <Icon name={icon} size={18} color="#fff" />
    </View>
    <Text style={styles.itemText}>{title}</Text>
    <Icon name="chevron-forward" size={18} color="#aaa" />
  </TouchableOpacity>
);

export default SettingScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  /* HEADER */
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

  /* LIST */
  listBox: {
    marginTop: 20,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },

  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#C44DFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  itemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },

  /* LOGOUT ROW */
  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    marginTop: 100,
  },

  logoutIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#C44DFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  logoutText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },

  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#C44DFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  modalSub: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
  },

  modalButtons: {
    flexDirection: "row",
    width: "100%",
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F4E6FF",
    marginRight: 10,
    alignItems: "center",
  },

  cancelText: {
    color: "#C44DFF",
    fontWeight: "600",
  },

  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#C44DFF",
    alignItems: "center",
  },

  confirmText: {
    color: "#fff",
    fontWeight: "600",
  },
});
