import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;

const GradientIcon = ({ name }) => (
  <LinearGradient
    colors={["#D51BF9", "#8C37F8"]}
    style={styles.iconWrap}
  >
    <Icon name={name} size={20} color="#fff" />
  </LinearGradient>
);

const ReceiverHeader = ({
  navigation,
  coins,
  avatar,
  unread,
  coinImg,
}) => {
  return (
    <View style={styles.topBar}>
      {/* COINS */}
      <TouchableOpacity
        style={styles.coinWrapper}
        onPress={() => navigation.navigate("ReciverWalletScreen")}
      >
        <LinearGradient
          colors={["#D51BF9", "#8C37F8"]}
          style={styles.coinGradient}
        >
          <Image source={coinImg} style={styles.coinImage} />
          <Text style={styles.coinText}>{coins}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* RIGHT ICONS */}
      <View style={styles.rightIcons}>
        <TouchableOpacity>
          <GradientIcon name="gift-outline" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("NotificationScreen")}
        >
          <View>
            <GradientIcon name="notifications-outline" />
            {unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unread}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("MessagesScreen")}
        >
          <GradientIcon name="chatbubble-ellipses-outline" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("UplodePhotoScreen")}
        >
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <GradientIcon name="person-outline" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReceiverHeader;

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(16),
    marginTop: scale(20),
    marginBottom: scale(10),
  },

  coinWrapper: {
    borderRadius: 30,
    overflow: "hidden",
  },

  coinGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(14),
    paddingVertical: scale(6),
    borderRadius: 30,
  },

  coinImage: {
    width: scale(20),
    height: scale(20),
    marginRight: 6,
  },

  coinText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: scale(14),
  },

  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },

  iconWrap: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    justifyContent: "center",
    alignItems: "center",
  },

  avatar: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    borderWidth: 2,
    borderColor: "#D51BF9",
  },

  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: "#FF3B3B",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});