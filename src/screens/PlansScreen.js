import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSelector, useDispatch } from "react-redux";
import WelcomeScreenbackgroungpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { getCoinsRequest } from "../features/conis/coinActions";
import OffersSectionScreen from "./OffersSectionScreen";
import coinImg from "../assets/coin1.png";
import { createOrderRequest } from "../features/purchase/purchaseActions";

const { width, height } = Dimensions.get("window");
const wp = val => (width * val) / 100;
const hp = val => (height * val) / 100;
const isSmallDevice = width < 360;

export default function PlanScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { userdata } = useSelector(state => state.user);
  const coins = useSelector(state => state.coins?.coins || []);
  const unread = useSelector(state => state.notification?.unread || 0);

  const profilePhotoURL = userdata?.images?.profile_image;

  const imageUrl = profilePhotoURL
    ? { uri: profilePhotoURL }
    : require("../assets/boy2.jpg");

  useEffect(() => {
    dispatch(getCoinsRequest());
  }, [dispatch]);

  const handleClaim = (item) => {
  // 🔥 1. Call create order
  dispatch(createOrderRequest(item.id));

  // 🔥 2. Navigate to processing screen
  navigation.navigate("ProcessingScreen", {
    package: item
  });
};

  const renderItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.9} style={styles.cardWrapper}>
      <LinearGradient
        colors={["#7C3AED", "#D946EF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.newCard}
      >
        <Text style={styles.newTitle}>
          Unlock {item?.discount_percent ?? 0}% Savings
        </Text>

        <Image
          source={require("../assets/multicoin.png")}
          style={styles.newCoin}
        />

        <Text style={styles.newPrice}>
          Only <Text style={styles.rupee}>₹</Text>
          {item?.price_after_discount ?? 0}
        </Text>

        <TouchableOpacity style={styles.claimBtn} activeOpacity={0.8} onPress={() => handleClaim(item)}>
          <Text style={styles.claimText}>Claim {item?.coins ?? 0}</Text>
          <Image
            source={require("../assets/normalmulticoin.png")}
            style={styles.btnCoin}
          />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <WelcomeScreenbackgroungpage>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />

        <View style={styles.container}>
          <View style={styles.fixedHeader}>
            <View style={styles.headerContainer}>
              <View style={styles.headerRow}>
                <View style={styles.leftHeader}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate("Plans")}
                  >
                    <LinearGradient
                      colors={["#FFA726", "#FF7043"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.coinBox}
                    >
                      <Image source={coinImg} style={styles.coinImage} />
                      <Text
                        style={styles.coinText}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {userdata?.user?.coin_balance ?? 0}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <View style={styles.rightHeader}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigation.navigate("Messages")}
                    activeOpacity={0.8}
                  >
                    <View style={styles.iconCircle}>
                      <Icon
                        name="shopping-outline"
                        size={isSmallDevice ? wp(4.2) : wp(4.7)}
                        color="#fff"
                      />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigation.navigate("RecentsCallHistoryScreen")}
                    activeOpacity={0.8}
                  >
                    <View style={styles.iconCircle}>
                      <Icon
                        name="history"
                        size={isSmallDevice ? wp(4.2) : wp(4.7)}
                        color="#fff"
                      />
                    </View>

                    {unread > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {unread > 99 ? "99+" : unread}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate("Profile")}
                    activeOpacity={0.8}
                  >
                    <Image source={imageUrl} style={styles.profilePic} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.lokalText}>Lokal frnd</Text>
              <Text style={styles.buyCoinsText}>Buy Coins</Text>
            </View>
          </View>

          <FlatList
            data={coins}
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              item?.id ? item.id.toString() : index.toString()
            }
            numColumns={3}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={
              <View>
                <OffersSectionScreen />
                <Image
                  source={require("../assets/blackfriday.png")}
                  style={styles.blackBanner}
                  resizeMode="cover"
                />
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </WelcomeScreenbackgroungpage>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  fixedHeader: {
    zIndex: 100,
    elevation: 20,
  },

  headerContainer: {
    paddingHorizontal: wp(4),
    paddingTop:
      Platform.OS === "android"
        ? (StatusBar.currentHeight || 0) + hp(1.2)
        : hp(1.2),
    paddingBottom: hp(1.2),
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  leftHeader: {
    width: "42%",
    justifyContent: "center",
    alignItems: "flex-start",
  },

  rightHeader: {
    width: "58%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  coinBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: isSmallDevice ? wp(3) : wp(3.5),
    height: isSmallDevice ? hp(4.9) : hp(5.2),
    borderRadius: wp(8),
    minWidth: isSmallDevice ? wp(22) : wp(24),
    maxWidth: isSmallDevice ? wp(30) : wp(32),
    elevation: 4,
  },

  coinImage: {
    width: isSmallDevice ? wp(5.8) : wp(6.5),
    height: isSmallDevice ? wp(5.8) : wp(6.5),
    resizeMode: "contain",
  },

  coinText: {
    marginLeft: wp(2),
    fontSize: isSmallDevice ? wp(3.2) : wp(3.6),
    fontWeight: "800",
    color: "#fff",
    maxWidth: wp(14),
  },

  iconButton: {
    marginLeft: isSmallDevice ? wp(1.5) : wp(2),
    position: "relative",
  },

  profileButton: {
    marginLeft: isSmallDevice ? wp(1.5) : wp(2),
  },

  iconCircle: {
    width: isSmallDevice ? wp(8.3) : wp(9.5),
    height: isSmallDevice ? wp(8.3) : wp(9.5),
    borderRadius: isSmallDevice ? wp(4.15) : wp(4.75),
    backgroundColor: "#ce17fc",
    justifyContent: "center",
    alignItems: "center",
  },

  profilePic: {
    width: isSmallDevice ? wp(8.3) : wp(9.5),
    height: isSmallDevice ? wp(8.3) : wp(9.5),
    borderRadius: isSmallDevice ? wp(4.15) : wp(4.75),
    borderWidth: 2,
    borderColor: "#A35DFE",
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ff0044",
    minWidth: isSmallDevice ? wp(4.6) : wp(5),
    height: isSmallDevice ? wp(4.6) : wp(5),
    borderRadius: wp(2.5),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(0.6),
  },

  badgeText: {
    color: "#fff",
    fontSize: isSmallDevice ? wp(1.9) : wp(2.2),
    fontWeight: "700",
  },

  lokalText: {
    textAlign: "center",
    color: "#9333EA",
    fontSize: wp(4),
    marginTop: hp(1.2),
  },

  buyCoinsText: {
    textAlign: "center",
    color: "#A21CAF",
    fontSize: wp(6.5),
    fontWeight: "800",
    marginTop: hp(0.4),
    marginBottom: hp(1.2),
  },

  listContainer: {
    paddingHorizontal: wp(2),
    paddingBottom: hp(12),
  },

  columnWrapper: {
    justifyContent: "space-between",
  },

  blackBanner: {
    width: "100%",
    height: hp(18),
    marginTop: hp(2),
    marginBottom: hp(1.5),
  },

  cardWrapper: {
    width: wp(30),
    marginBottom: hp(1.5),
  },

  newCard: {
    borderRadius: wp(6),
    paddingVertical: hp(2),
    paddingHorizontal: wp(2),
    height: hp(26),
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },

  newTitle: {
    color: "#fff",
    fontSize: wp(3.8),
    fontWeight: "800",
    textAlign: "center",
  },

  newCoin: {
    width: wp(20),
    height: wp(20),
    resizeMode: "contain",
  },

  newPrice: {
    color: "#fff",
    fontSize: wp(3.5),
    fontWeight: "800",
  },

  rupee: {
    color: "#FACC15",
    fontWeight: "900",
  },

  claimBtn: {
    backgroundColor: "#481162",
    borderRadius: wp(10),
    paddingVertical: hp(1),
    paddingHorizontal: wp(5),
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1),
  },

  claimText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: wp(2.5),
  },

  btnCoin: {
    width: wp(4),
    height: wp(4),
    marginLeft: wp(0.2),
  },
});