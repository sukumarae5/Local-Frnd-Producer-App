import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");
const wp = (v) => (width * v) / 100;
const hp = (v) => (height * v) / 100;

const offers = [
  { id: 1, text: "Buy 100 Coins, Get 20 Free!" },
  { id: 2, text: "Buy 200 Coins, Get 50 Free!" },
  { id: 3, text: "Buy 500 Coins, Get 150 Free!" },
];

const OffersSectionScreen = () => {
  return (
    <View>
      <Text style={styles.sectionLabel}>Offers</Text>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: hp(1) }}
      >
        {offers.map((o) => (
          <View key={o.id} style={styles.offerCard}>
            <Text style={styles.offerText}>{o.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {offers.map((_, idx) => (
          <View
            key={idx}
            style={[styles.dot, idx === 0 && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
};

export default OffersSectionScreen;

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: wp(5),
    fontWeight: "700",
    color: "#111",
    marginTop: hp(3),
    marginBottom: hp(1),
  },

  offerCard: {
    width: width - wp(10),
    height: hp(15),
    backgroundColor: "#F0EAFF",
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(4),
    borderWidth: 1,
    borderColor: "#E0D6FF",
  },

  offerText: {
    color: "#4C1D95",
    fontSize: wp(4.2),
    fontWeight: "700",
    textAlign: "center",
  },

  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: hp(1),
  },

  dot: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
    backgroundColor: "#D4D4D4",
    marginHorizontal: wp(1),
  },

  dotActive: {
    backgroundColor: "#8B5CF6",
  },
});
