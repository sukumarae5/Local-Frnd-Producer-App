import React, { useEffect, useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../socket/SocketProvider";
import { userDatarequest } from "../features/user/userAction";
import { femaleSearchRequest } from "../features/calls/callAction";

import StoriesScreen from "./StoriesScreen";
import OffersSectionScreen from "./OffersSectionScreen";
import ActiveDostSectionScreen from "./ActiveDostSectionScreen";
import LikeMindedSectionScreen from "../screens/LikeMindedSectionScreen";
import GoOnlineCard from "../components/GoOnlineCard";

const ReciverHomeScreen = ({ navigation }) => {

  const dispatch = useDispatch();
  const { connected } = useContext(SocketContext);

  const incoming = useSelector(
    (state) => state?.friends?.incoming || []
  );

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(userDatarequest());
  }, []);

  const handleGoOnline = (type) => {
    if (!connected) return;

    setShowModal(false);

    dispatch(femaleSearchRequest({ call_type: type }));

    navigation.navigate("CallStatusScreen", {
      call_type: type,
      role: "female",
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ===== HEADER ===== */}
        <LinearGradient
          colors={["#F6D8FF", "#FDE2F3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >

          <View style={styles.topRow}>

            <View style={styles.coinBox}>
              <Icon name="logo-bitcoin" size={14} color="#FFB800" />
              <Text style={styles.coinText}>2999</Text>
            </View>

            <View style={styles.headerRightIcons}>

              <TouchableOpacity style={styles.roundIcon}>
                <Icon name="gift-outline" size={18} color="#A855F7" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.roundIcon}
                onPress={() => navigation.navigate("FriendRequestsScreen")}
              >
                <Icon name="notifications-outline" size={18} color="#A855F7" />

                {incoming.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{incoming.length}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.roundIcon}
                onPress={() => navigation.navigate("MessagesScreen")}
              >
                <Icon name="chatbubble-ellipses-outline" size={18} color="#A855F7" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.avatarBox}>
                <Icon name="person" size={16} color="#A855F7" />
              </TouchableOpacity>

            </View>
          </View>

          <View style={styles.searchBox}>
            <Icon name="search" size={16} color="#C084FC" />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#C084FC"
              style={styles.searchInput}
            />
          </View>

        </LinearGradient>

        {/* ===== STORIES ===== */}
        <StoriesScreen />

        {/* ===== OFFERS ===== */}
        <OffersSectionScreen />

        {/* ===== LIKE MINDED ===== */}
        <LikeMindedSectionScreen />

        {/* ===== ACTIVE DOST ===== */}
        <ActiveDostSectionScreen />

        {/* ===== GO ONLINE CARD ===== */}
        {/* ===== GO ONLINE CARD ===== */}
<View style={styles.goOnlineWrap}>
  <GoOnlineCard navigation={navigation} />
</View>

      </ScrollView>

      {/* ===== CALL TYPE MODAL ===== */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>Go Online</Text>

            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => handleGoOnline("AUDIO")}
            >
              <Icon name="call-outline" size={22} color="#fff" />
              <Text style={styles.callText}>Audio Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.callBtn, styles.videoBtn]}
              onPress={() => handleGoOnline("VIDEO")}
            >
              <Icon name="videocam-outline" size={22} color="#fff" />
              <Text style={styles.callText}>Video Call</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>

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
    backgroundColor: "#ffffff",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  coinBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },

  coinText: {
    color: "#FFB800",
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 13,
  },

  headerRightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  roundIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF3B3B",
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  searchBox: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },

  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 14,
    color: "#A855F7",
  },

  goOnlineWrap: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    marginTop: 10,
  },

  outerPill: {
    width: "100%",
    height: 110,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    elevation: 5,
  },

  innerPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  innerText: {
    marginLeft: 10,
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1,
  },

  heart1: { position: "absolute", left: 18, top: 12 },
  heart2: { position: "absolute", left: 120, top: 8 },
  heart3: { position: "absolute", right: 70, top: 10 },
  heart4: { position: "absolute", right: 30, bottom: 10 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    backgroundColor: "#1a0033",
    padding: 25,
    borderRadius: 20,
    width: "80%",
    alignItems: "center",
  },

  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },

  callBtn: {
    flexDirection: "row",
    backgroundColor: "#ff00ff",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 14,
    width: "100%",
    justifyContent: "center",
  },

  videoBtn: {
    backgroundColor: "#ff005c",
  },

  callText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },

  closeText: {
    color: "#aaa",
    marginTop: 10,
  },
});
