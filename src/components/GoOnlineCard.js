import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { SocketContext } from "../socket/SocketProvider";
import { femaleSearchRequest } from "../features/calls/callAction";

const GoOnlineCard = ({ navigation }) => {

  const dispatch = useDispatch();
  const { connected } = useContext(SocketContext);
  const [showModal, setShowModal] = useState(false);

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
    <>
      <TouchableOpacity activeOpacity={0.9} onPress={() => setShowModal(true)}>
        <LinearGradient
          colors={["#b14cff", "#ff4fd8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.outerPill}
        >

          <Icon name="heart" size={48} color="rgba(255,255,255,0.35)" style={styles.heart1} />
          <Icon name="heart" size={48} color="rgba(255,255,255,0.30)" style={styles.heart2} />
          <Icon name="heart" size={48} color="rgba(255,255,255,0.28)" style={styles.heart3} />
          <Icon name="heart" size={48} color="rgba(255,255,255,0.25)" style={styles.heart4} />

          <View style={styles.innerPill}>
            <Icon name="wifi-outline" size={22} color="#fff" />
            <Text style={styles.innerText}>GO ONLINE</Text>
          </View>

        </LinearGradient>
      </TouchableOpacity>

      {/* modal */}
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
    </>
  );
};

export default GoOnlineCard;

const styles = StyleSheet.create({
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
