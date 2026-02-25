import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  Dimensions,
  StyleSheet,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSelector } from "react-redux";
import WelcomeScreenbackgroungpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
const { width, height } = Dimensions.get("window");
const wp = (val) => (width * val) / 100;
const hp = (val) => (height * val) / 100;

const coinsData = [
  { id: "1", coins: 2999, price: 2999, popular: true },
  { id: "2", coins: 4999, price: 3999 },
  { id: "3", coins: 9999, price: 6999 },
  { id: "4", coins: 19999, price: 12999 },
  { id: "5", coins: 29999, price: 19999 },
  { id: "6", coins: 49999, price: 29999 },
];

export default function BuyCoinsScreen() {
  const { userdata } = useSelector((state) => state.user);
  const navigation = useNavigation();

  const coinBalance = userdata?.user?.coin_balance ?? 0;
  const profilePhotoURL = userdata?.images?.profile_image;

  const imageUrl = profilePhotoURL
    ? { uri: profilePhotoURL }
    : require("../assets/boy2.jpg");

  const renderItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.9} style={styles.cardWrapper}>
      <LinearGradient
        colors={["#C026D3", "#7E22CE"]}
        style={styles.card}
      >
        {item.popular && (
          <Image
            source={require("../assets/mostpopular.png")}
            style={styles.stamp}
          />
        )}

        <Image
          source={require("../assets/multicoins.png")}
          style={styles.coinImage}
          resizeMode="contain"
        />

        <View style={styles.priceBadge}>
          <Image
            source={require("../assets/coin1.png")}
            style={styles.badgeCoinIcon}
          />
          <Text style={styles.badgeText}>{item.coins}</Text>
        </View>

        <View style={styles.bottomStrip}>
          <Text style={styles.bottomPrice}>{item.price}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <WelcomeScreenbackgroungpage>
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={coinsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: wp(2),
          paddingBottom: hp(6),
        }}
        ListHeaderComponent={
          <>
            {/* ===== TOP HEADER ===== */}
            <View style={styles.topRow}>
              <View style={styles.coinContainer}>
                
                <View style={styles.orangeBadge}>
                  <Text style={styles.badgeNumber}><Image
                  source={require("../assets/coin1.png")}
                  style={styles.headerCoin}
                />
                    {coinBalance}
                  </Text>
                </View>
              </View>

              <View style={styles.rightSection}>
                <View style={styles.purpleCircle}>
  <Icon 
    name="camera-outline" 
    size={wp(5)} 
    color="#fefbfe" 
  />
</View>

<View style={styles.purpleCircle}>
  <Icon 
    name="history" 
    size={wp(5)} 
    color="#f5f0f6" 
  />
</View>

                <Image
                  source={imageUrl}
                  style={styles.profileImage}
                />
              </View>
            </View>

            {/* TITLE */}
            <Text style={styles.lokalText}>Lokal frnd</Text>
            <Text style={styles.buyCoinsText}>Buy Coins</Text>

            {/* OFFERS */}
            <Text style={styles.offerText}>Offers</Text>

            <LinearGradient
              colors={["#D946EF", "#7E22CE"]}
              style={styles.sliderBox}
            />

           <View style={styles.dotContainer}>
  <View style={styles.activeDot} />
  <View style={styles.inactiveDot} />
  <View style={styles.inactiveDot} />
</View>

            {/* BLACK FRIDAY */}
            <Image
              source={require("../assets/blackfriday.png")}
              style={styles.blackBanner}
              resizeMode="cover"
            />
          </>
        }
      />
      {/* ===== FLOATING BOTTOM BAR ===== */}
<View style={styles.bottomWrapper}>
  <View style={styles.bottomContainer}>

    {/* HOME (Active) */}
    <TouchableOpacity
  activeOpacity={0.8}
  onPress={() => navigation.navigate("Home")}
>
  <LinearGradient
    colors={["#C026D3", "#7E22CE"]}
    style={styles.activeIcon}
  >
    <Text style={{ color: "#fff", fontSize: wp(5) }}>🏠</Text>
  </LinearGradient>
</TouchableOpacity>
    <View style={styles.divider} />

    {/* HEART */}
    <Text style={styles.inactiveIcon}>💜</Text>

    <View style={styles.divider} />

    {/* BELL */}
    <Text style={styles.inactiveIcon}>🔔</Text>

    <View style={styles.divider} />

    {/* CHAT */}
    <Text style={styles.inactiveIcon}>💬</Text>

  </View>
</View>
    </WelcomeScreenbackgroungpage>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingTop: hp(3),
    marginTop:hp(3)
  },
purpleCircle: {
  width: wp(9),
  height: wp(9),
  borderRadius: wp(4.5),
  backgroundColor: "#A21CAF",
  justifyContent: "center",
  alignItems: "center",
  marginRight: wp(2),
},
  coinContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerCoin: {
    width: wp(6),
    height: wp(6),
  },

  orangeBadge: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.4),
    borderRadius: wp(4),
    marginLeft: wp(2),
  },

  badgeNumber: {
    color: "#fff",
    fontWeight: "700",
    fontSize: wp(3.5),
  },

  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
dotContainer: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginTop: hp(1),
},

activeDot: {
  width: wp(2.5),
  height: wp(2.5),
  borderRadius: wp(1.25),
  backgroundColor: "#C026D3",
  marginHorizontal: wp(1),
},

inactiveDot: {
  width: wp(2.5),
  height: wp(2.5),
  borderRadius: wp(1.25),
  backgroundColor: "#E9D5FF",
  marginHorizontal: wp(1),
},
  purpleCircle: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    borderWidth: 2,
    borderColor: "#A21CAF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(2),
    backgroundColor:"#d03bf5"
  },

  profileImage: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    borderWidth: 2,
    borderColor: "#A21CAF",
  },

  lokalText: {
    textAlign: "center",
    color: "#9333EA",
    fontSize: wp(4),
    marginTop: hp(1),
  },

  buyCoinsText: {
    textAlign: "center",
    color: "#A21CAF",
    fontSize: wp(6.5),
    fontWeight: "800",
  },

  offerText: {
    marginLeft: wp(4),
    marginTop: hp(2),
    fontSize: wp(4),
  },

  sliderBox: {
    marginHorizontal: wp(4),
    marginTop: hp(1),
    height: hp(7),
    borderRadius: wp(4),
  },

  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: hp(1),
  },

  activeHeart: {
    color: "#C026D3",
    fontSize: wp(4),
    marginHorizontal: wp(1),
  },

  inactiveHeart: {
    color: "#E9D5FF",
    fontSize: wp(4),
    marginHorizontal: wp(1),
  },

  blackBanner: {
    width: "100%",
    height: hp(18),
    marginTop: hp(2),
    marginBottom: hp(2),
  },

  cardWrapper: {
    width: wp(30),
    margin: wp(1.5),
  },

  card: {
    borderRadius: wp(5),
    paddingTop: hp(2),
    alignItems: "center",
    overflow: "hidden",
  },

  stamp: {
    position: "absolute",
    top: hp(1),
    left: wp(1),
    width: wp(12),
    height: wp(12),
    resizeMode: "contain",
  },

  coinImage: {
    width: wp(20),
    height: wp(20),
    marginTop: hp(2),
  },

  priceBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(1),
    borderWidth: 2,
    borderColor: "#000",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
  },

  badgeCoinIcon: {
    width: wp(4),
    height: wp(4),
    resizeMode: "contain",
    marginRight: wp(1.5),
  },

  badgeText: {
    color: "#fff",
    fontSize: wp(3.5),
    fontWeight: "800",
  },

  bottomStrip: {
    width: "100%",
    backgroundColor: "#6B21A8",
    marginTop: hp(2),
    paddingVertical: hp(1.5),
    borderBottomLeftRadius: wp(5),
    borderBottomRightRadius: wp(5),
    alignItems: "center",
  },

  bottomPrice: {
    color: "#fff",
    fontSize: wp(4),
    fontWeight: "900",
  },
  bottomWrapper: {
  position: "absolute",
  bottom: hp(2),
  width: "100%",
  alignItems: "center",
},

bottomContainer: {
  flexDirection: "row",
  width: "85%",
  backgroundColor: "#fff",
  borderRadius: wp(10),
  paddingVertical: hp(1.5),
  justifyContent: "space-around",
  alignItems: "center",
  elevation: 15,
  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 10,
},

activeIcon: {
  width: wp(12),
  height: wp(12),
  borderRadius: wp(6),
  justifyContent: "center",
  alignItems: "center",
},

inactiveIcon: {
  fontSize: wp(5),
  color: "#C026D3",
},

divider: {
  width: 1,
  height: hp(3),
  backgroundColor: "#E5E7EB",
},
});