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

// Extract a content value by key from the contents array
const getContent = (contents = [], key) =>
  (contents.find(c => c.content_key === key) || {}).content_value || "";

const OffersSectionScreen = () => {
  const dispatch = useDispatch();
  const [activeIndex, setActiveIndex] = useState(0);

  const { offers, loading } = useSelector(state => state.offers);

  const activeOffers = (offers || []).filter(
    item => Number(item.status) === 1,
  );

  useEffect(() => {
    dispatch(getOffersRequest());
  }, [dispatch]);

  const handleScroll = event => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / width,
    );
    setActiveIndex(index);
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
            {activeOffers.map((item, index) => {
              const brand    = getContent(item.contents, "brand");
              const title1   = getContent(item.contents, "title1");
              const title2   = getContent(item.contents, "title2");
              const subtitle = getContent(item.contents, "subtitle");

              const btn         = item.button || {};
              const buttonText  = btn.button_text  || "Explore";
              const buttonBg    = btn.button_color  || "#6D21B8";
              const buttonTxt   = btn.text_color    || "#FFFFFF";

              const features = item.features || [];

              return (
                <View key={item.id || index} style={styles.slide}>
                  <ImageBackground
                    source={{ uri: item.background_image }}
                    style={styles.card}
                    imageStyle={styles.cardImage}
                    resizeMode="cover"
                  >
                    {/* ── LEFT CONTENT ── */}
                    <View style={styles.leftContent}>
                      {/* Brand row */}
                      <View style={styles.brandRow}>
                        <View style={styles.logoBox}>
                          <Ionicons name="heart" size={wp(3)} color="#fff" />
                        </View>
                        <Text numberOfLines={1} style={styles.brandText}>
                          {brand || "LokalFrnd RJ"}
                        </Text>
                      </View>

                      {/* Titles */}
                      <Text numberOfLines={2} style={styles.title1}>
                        {title1}
                      </Text>
                      <Text numberOfLines={2} style={styles.title2}>
                        {title2}
                      </Text>

                      {/* Subtitle */}
                      <Text numberOfLines={2} style={styles.subtitle}>
                        {subtitle}
                      </Text>

                      {/* CTA Button */}
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={[styles.button, { backgroundColor: "#fff" }]}
                      >
                        <Text
                          numberOfLines={1}
                          style={[styles.buttonText, { color: buttonBg }]}
                        >
                          {buttonText}
                        </Text>
                        <Ionicons
                          name="arrow-forward"
                          size={wp(2.8)}
                          color={buttonBg}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* ── RIGHT FEATURE BOXES ── */}
                    <View style={styles.rightContent}>
                      {features.map((f, i) => (
                        <View key={f.id || i} style={styles.rightBox}>
                          <Ionicons
                            name={f.icon || "star"}
                            size={wp(2.6)}
                            color="#fff"
                          />
                          <Text numberOfLines={2} style={styles.rightText}>
                            {f.title}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </ImageBackground>
                </View>
              );
            })}
          </ScrollView>

          {/* Pagination dots */}
          <View style={styles.pagination}>
            {activeOffers.map((_, index) => (
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
    height: hp(20),
    borderRadius: wp(4),
    overflow: "hidden",
  },

  cardImage: {
    borderRadius: wp(4),
    height: hp(20),
  },

  // ── LEFT ──
  leftContent: {
    position: "absolute",
    left: wp(5.2),
    top: hp(2.2),
    width: "42%",
    zIndex: 10,
    elevation: 10,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.4),
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
  },

  brandText: {
    color: "#fff",
    fontSize: wp(3),
    fontWeight: "900",
    flex: 1,
  },

  title1: {
    color: "#FFFFFF",
    fontSize: wp(3.8),
    fontWeight: "900",
    lineHeight: wp(4.6),
  },

  title2: {
    color: "#FFD400",
    fontSize: wp(3.8),
    fontWeight: "900",
    lineHeight: wp(4.6),
    marginBottom: hp(0.3),
  },

  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: wp(2),
    fontWeight: "600",
    lineHeight: wp(2.7),
    marginBottom: hp(0.6),
  },

  button: {
    marginTop: hp(0.5),
    alignSelf: "flex-start",
    paddingHorizontal: wp(3),
    height: hp(3.4),
    borderRadius: wp(6),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(0.8),
  },

  buttonText: {
    fontSize: wp(2.4),
    fontWeight: "700",
  },

  // ── RIGHT ──
  rightContent: {
    position: "absolute",
    right: wp(2.5),
    top: hp(2.5),
    width: "22%",
    zIndex: 10,
    elevation: 10,
    gap: hp(0.4),
  },

  rightBox: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: wp(1.6),
    backgroundColor: "rgba(0,0,0,0.15)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(1),
    paddingVertical: hp(0.5),
    marginBottom: hp(0.4),
  },

  rightText: {
    flex: 1,
    color: "#fff",
    fontSize: wp(1.7),
    fontWeight: "800",
    lineHeight: wp(2.2),
    marginLeft: wp(0.5),
  },

  // ── PAGINATION ──
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