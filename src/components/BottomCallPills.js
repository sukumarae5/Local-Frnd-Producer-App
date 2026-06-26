import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LinearGradient from "react-native-linear-gradient";

const BottomCallPills = ({
  callingRandom,
  callingRandomVideo,
  onRandomAudio,
  onRandomVideo,
  coinBalance = 0,
  navigation, // ✅ pass navigation from parent
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [attemptedCallType, setAttemptedCallType] = useState(null);

  const AUDIO_RATE = 10;  // matches your billingService RATES.AUDIO
  const VIDEO_RATE = 60;  // matches your billingService RATES.VIDEO

  const hasAudioCoins = coinBalance >= AUDIO_RATE;
  const hasVideoCoins = coinBalance >= VIDEO_RATE;

  const handleAudioPress = () => {
    if (!hasAudioCoins) {
      setAttemptedCallType('AUDIO');
      setModalVisible(true);
      return;
    }
    onRandomAudio();
  };

  const handleVideoPress = () => {
    if (!hasVideoCoins) {
      setAttemptedCallType('VIDEO');
      setModalVisible(true);
      return;
    }
    onRandomVideo();
  };

  const handleBuyCoins = () => {
    setModalVisible(false);
    navigation?.navigate('PlanScreen');
  };

  return (
    <>
      <View style={styles.bottomWhiteArea}>
        {/* Audio pill */}
        <TouchableOpacity
          style={styles.bottomPill}
          onPress={handleAudioPress}
          activeOpacity={0.8}
        >
          <MaterialIcons name="call" size={16} color="#fff" />
          <View style={styles.pillTextWrap}>
            <Text style={styles.pillTitle}>
              {callingRandom ? 'Connecting...' : 'Random'}
            </Text>
            <Text style={styles.pillSub}>audio call</Text>
          </View>
        </TouchableOpacity>

        {/* Video pill */}
        <TouchableOpacity
          style={styles.bottomPill}
          onPress={handleVideoPress}
          activeOpacity={0.8}
        >
          <MaterialIcons name="videocam" size={16} color="#fff" />
          <View style={styles.pillTextWrap}>
            <Text style={styles.pillTitle}>
              {callingRandomVideo ? 'Connecting...' : 'Random'}
            </Text>
            <Text style={styles.pillSub}>video call</Text>
          </View>
        </TouchableOpacity>

        {/* Locked pill */}
        <View style={[styles.bottomPill, styles.lockedPill]}>
          <MaterialIcons name="lock" size={16} color="#fff" />
          <View style={styles.pillTextWrap}>
            <Text style={styles.pillTitle}>Random</Text>
            <Text style={styles.pillSub}>local calls</Text>
          </View>
        </View>
      </View>

      {/* ── No Coins Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalBox} onPress={() => {}}>

            {/* Icon */}
            <View style={styles.iconCircle}>
              <MaterialIcons name="monetization-on" size={36} color="#A020F0" />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Not Enough Coins</Text>

            {/* Message */}
            <Text style={styles.modalMsg}>
              {attemptedCallType === 'VIDEO'
                ? `Video calls need ${VIDEO_RATE} coins per minute.\nYou have ${coinBalance} coins.`
                : `Audio calls need ${AUDIO_RATE} coins per minute.\nYou have ${coinBalance} coins.`}
            </Text>

            {/* Buy button */}
            <TouchableOpacity
              onPress={handleBuyCoins}
              activeOpacity={0.85}
              style={styles.buyBtnWrapper}
            >
              <LinearGradient
                colors={['#D51BF9', '#8C37F8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buyBtn}
              >
                <MaterialIcons name="shopping-cart" size={18} color="#fff" />
                <Text style={styles.buyBtnText}>Buy Coins</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>Maybe Later</Text>
            </TouchableOpacity>

          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default BottomCallPills;

const styles = StyleSheet.create({
  bottomWhiteArea: {
    backgroundColor: "transparent",
    padding: 14,
    flexDirection: "row",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  bottomPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#9B2CF3",
  },
  lockedPill: {
    backgroundColor: "#C07BFF",
  },
  pillTextWrap: {
    marginLeft: 6,
    alignItems: "flex-start",
  },
  pillTitle: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 13,
  },
  pillSub: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 12,
  },

  // ── Modal ──
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "82%",
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    elevation: 10,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F3E6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 10,
  },
  modalMsg: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  buyBtnWrapper: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  buyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  buyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  cancelBtn: {
    paddingVertical: 8,
  },
  cancelText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "600",
  },
});