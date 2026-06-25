import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getOffersRequest } from "../features/Offers/offersActions";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width, height } = Dimensions.get("window");

const wp = v => (width * v) / 100;
const hp = v => (height * v) / 100;

const OffersSectionScreen = () => {
  const dispatch = useDispatch();
  const [activeIndex, setActiveIndex] = useState(0);

  const { offers, loading } = useSelector(state => state.offers);
 
  const activeOffers = (offers || []).filter(
  item => Number(item.status) === 1
);

  useEffect(() => {
    dispatch(getOffersRequest());
  }, [dispatch]);

  const handleScroll = event => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const getOfferData = item => {
    const desc = item.description || "";

    if (desc.toLowerCase().includes("reward")) {
      return {
        title1: "Daily Rewards for",
        title2: "Active RJs",
        subtitle: "The more you engage, the more you earn",
        button: "View Rewards",
        color: "#FFFFFF",
        accent: "#FFD400",
        buttonColor: "#E94400",
        miniIcon1: "star",
        miniIcon2: "gift",
        left1: "10+ Hours\nTalk",
        left2: "Extra Daily\nRewards",
        right: [
          ["calendar-checkmark-outline", "Daily Login Bonus"],
          ["gift-outline", "Talk More\nEarn More"],
          ["star", "Unlock Surprise\nRewards"],
        ],
      };
    }

    if (desc.toLowerCase().includes("conversation")) {
      return {
        title1: "Improve Your",
        title2: "Conversation Rating",
        subtitle: "Better ratings help you grow faster",
        button: "Learn More",
        color: "#FFFFFF",
        accent: "#16D9FF",
        buttonColor: "#123FCF",
        miniIcon1: "star",
        miniIcon2: "people",
        left1: "Better Ratings",
        left2: "More User\nConnections",
        right: [
          ["trending-up-outline", "Get More Calls"],
          ["eye-outline", "Increase\nVisibility"],
          ["people", "Build Strong\nConnections"],
        ],
      };
    }

    return {
      title1: "Become an RJ,",
      title2: "Earn Real Money",
      subtitle: "Turn your talking skills into earnings",
      button: "Apply Now",
      color: "#FFFFFF",
      accent: "#FFE600",
      buttonColor: "#6D21B8",
      miniIcon1: "mic",
      miniIcon2: "cash",
      left1: "Join as RJ",
      left2: "Start Earning",
      right: [
        ["time-outline", "Flexible\nWorking Hours"],
        ["wallet-outline", "Daily Payout\nOpportunities"],
      ],
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Offers</Text>

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        <>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
          >
            {activeOffers?.map((item, index) => {
              const data = getOfferData(item);

              return (
                <View key={item.id || index} style={styles.slide}>
                  <ImageBackground
                    source={{ uri: item.image_url }}
                    style={styles.card}
                    imageStyle={styles.cardImage}
                    resizeMode="cover"
                  >
                    <View style={styles.leftContent}>
                      <View style={styles.brandRow}>
                        <View style={styles.logoBox}>
                          <Ionicons name="heart" size={wp(3)} color="#fff" />
                        </View>

                        <Text numberOfLines={1} style={styles.brandText}>
                          {item.title || "LokalFrnd RJ"}
                        </Text>
                      </View>

                      <Text numberOfLines={1} style={[styles.bigTitle, { color: data.color }]}>
                        {data.title1}
                      </Text>

                      <Text numberOfLines={1} style={[styles.bigTitle, { color: data.accent }]}>
                        {data.title2}
                      </Text>

                      <Text numberOfLines={2} style={styles.subtitle}>
                        {data.subtitle}
                      </Text>

                      <View style={styles.miniCard}>
                        <View style={styles.roundIcon}>
                          <Ionicons name={data.miniIcon1} size={wp(2.4)} color="#fff" />
                        </View>

                        <Text numberOfLines={2} style={styles.miniText}>
                          {data.left1}
                        </Text>

                        <Ionicons name="arrow-forward" size={wp(2.2)} color="#fff" />

                        <View style={styles.roundIcon}>
                          <Ionicons name={data.miniIcon2} size={wp(2.5)} color="#fff" />
                        </View>

                        <Text numberOfLines={2} style={styles.miniText}>
                          {data.left2}
                        </Text>
                      </View>

                      <TouchableOpacity activeOpacity={0.85} style={styles.button}>
                        <Text
                          numberOfLines={1}
                          style={[styles.buttonText, { color: data.buttonColor }]}
                        >
                          {data.button}
                        </Text>

                        <Ionicons
                          name="arrow-forward"
                          size={wp(2.8)}
                          color={data.buttonColor}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.rightContent}>
                      {data.right.map((r, i) => (
                        <View key={i} style={styles.rightBox}>
                          <Ionicons name={r[0]} size={wp(2.6)} color="#fff" />
                          <Text numberOfLines={2} style={styles.rightText}>
                            {r[1]}
                          </Text>
                        </View>
                      ))}
                    </View>

                  </ImageBackground>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.pagination}>
            {activeOffers?.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.pageDot,
                  activeIndex === index && styles.pageDotActive,
                ]}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
};

export default OffersSectionScreen;

const styles = StyleSheet.create({
  container: {
    marginTop: hp(1),
  },

  sectionLabel: {
    fontSize: wp(4.4),
    fontWeight: "700",
    color: "#111",
    paddingHorizontal: wp(4),
    marginBottom: hp(0.85),
  },

  loading: {
    textAlign: "center",
    marginVertical: hp(2),
    color: "#111",
  },

  slide: {
    width,
    alignItems: "center",
  },

  card: {
    width: width * 0.96,
    height: hp(22),
    borderRadius: wp(4),
    overflow: "hidden",
  },

  cardImage: {
    borderRadius: wp(8),
     height: hp(22),
    // width: width * 0.96,
  },

  leftContent: {
    position: "absolute",
    left: wp(5.2),
    top: hp(2.2),
    width: "36%",
    zIndex: 10,
    elevation: 10,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.3),
    width: "100%",
  },

  logoBox: {
    width: wp(4),
    height: wp(4),
    borderRadius: wp(1),
    backgroundColor: "#EC2C83",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(0.8),
    marginTop:20
  },

  brandText: {
    color: "#fff",
    fontSize: wp(3),
    fontWeight: "900",
    flex: 1,
    marginTop:20
  },

  bigTitle: {
    fontSize: wp(2.9),
    fontWeight: "800",
    lineHeight: wp(3.7),
  },

  subtitle: {
    color: "#fff",
    fontSize: wp(1.75),
    fontWeight: "700",
    lineHeight: wp(2.3),
    marginTop: hp(0.25),
    marginBottom: hp(0.25),
  },

  miniCard: {
    marginTop: hp(0.45),
    height: hp(3),
    width: wp(33),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    borderRadius: wp(1.5),
    paddingHorizontal: wp(0.55),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.09)",
  },

  roundIcon: {
    width: wp(3.8),
    height: wp(3.8),
    borderRadius: wp(1.9),
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(0.35),
  },

  miniText: {
    color: "#fff",
    fontSize: wp(1.45),
    fontWeight: "800",
    lineHeight: wp(1.75),
    marginRight: wp(0.35),
    flexShrink: 1,
  },

  button: {
    marginTop: hp(0.5),
    width: wp(23.5),
    height: hp(3),
    borderRadius: wp(6),
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(1),
  },

  buttonText: {
    fontSize: wp(2.2),
    fontWeight: "700",
    marginRight: wp(0.7),
  },

  rightContent: {
    position: "absolute",
    right: wp(2),
    top: hp(2.8),
    width: "20%",
    zIndex: 10,
    elevation: 10,
  },

  rightBox: {
    minHeight: hp(3.8),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: wp(1.6),
    backgroundColor: "rgba(0,0,0,0.13)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(0.7),
    marginBottom: hp(0.25),
    marginTop:15,
  },

  rightText: {
    flex: 1,
    color: "#fff",
    fontSize: wp(1.6),
    fontWeight: "900",
    lineHeight: wp(2),
    marginLeft: wp(0.4),
  },

  

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: hp(1),
  },

  pageDot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: "#D1D5DB",
    marginHorizontal: wp(1),
  },

  pageDotActive: {
    width: wp(5),
    backgroundColor: "#8C37F8",
  },
});