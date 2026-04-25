import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getOffersRequest } from "../features/Offers/offersActions";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
const { width, height } = Dimensions.get("window");
const wp = (v) => (width * v) / 100;
const hp = (v) => (height * v) / 100;

const OffersSectionScreen = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const dispatch = useDispatch();

  const { offers, loading } = useSelector(
    (state) => state.offers
  );

  useEffect(() => {
    dispatch(getOffersRequest());
  }, []);

  const handleScroll = (event) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / width
    );
    setActiveIndex(index);
  };

  return (
    <View>
      <Text style={styles.sectionLabel}>Offers</Text>

      {loading ? (
        <Text style={{ textAlign: "center" }}>Loading...</Text>
      ) : (
        <>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            style={{ marginTop: hp(1),marginBottom: hp(1), }}
          >
            {/* {offers?.map((o, index) => (
              <View key={index} style={styles.offerCard}>
                <Text style={styles.offerText}>
                  {o.text || o.title}
                </Text>
              </View>
            ))} */}

            {offers?.map((o, index) => (
  <View
  key={index}
  style={{
    width: width, // 👈 full page width (important)
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.2),
  }}
>
  <LinearGradient
    colors={["#8C37F8", "#D51BF9"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.offerCard}
  >
    <Text style={styles.offerText}>
      {o.text || o.title}
    </Text>
  </LinearGradient>
</View>
))}
          </ScrollView>

          {/* <View style={styles.dotsRow}>
            {offers?.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  activeIndex === idx && styles.dotActive,
                ]}
              />
            ))}
          </View> */}
         <View style={styles.dotsRow}>
  {offers?.map((_, idx) => {
    const isActive = activeIndex === idx;

    return (
      <View
        key={idx}
        style={[
          styles.heartCircle,
          {
            backgroundColor: isActive ? "#8C37F8" : "#E5E5E5",
          },
        ]}
      >
        <Ionicons
          name="heart"
          size={wp(2.2)}
          color="#fff"
        />
      </View>
    );
  })}
</View>
        </>
      )}
    </View>
  );
};

export default OffersSectionScreen;

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: wp(5),
    fontWeight: "700",
    color: "#111",
    paddingTop: hp(2),
    paddingHorizontal: wp(4),
  },

 offerCard: {
  width: "100%", // 👈 actual card size
  height: hp(13.5),
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: wp(4),
  borderRadius: wp(3),
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
    width: wp(5),
  },
  heartCircle: {
  width: wp(4),
  height: wp(4),
  borderRadius: wp(2), // 👈 perfect circle
  justifyContent: "center",
  alignItems: "center",
  marginHorizontal: wp(1.5), // 👈 more spacing between dots
},

});