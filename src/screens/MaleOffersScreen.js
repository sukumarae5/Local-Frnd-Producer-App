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

const MaleOffersScreen = () => {
  const dispatch = useDispatch();
  const [activeIndex, setActiveIndex] = useState(0);

  const { offers, loading } = useSelector(state => state.offers);

  const activeOffers = (offers || []).filter(
    item => Number(item.status) === 1,
  );

  useEffect(() => {
    dispatch(getOffersRequest());
  }, [dispatch]);

  const handleScroll = e => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
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
            decelerationRate="fast"
            snapToInterval={width}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
          >
            {activeOffers.map((item, index) => {
              const brand    = getContent(item.contents, "brand");
              const title1   = getContent(item.contents, "title1");
              const title2   = getContent(item.contents, "title2");
              const subtitle = getContent(item.contents, "subtitle");

              const btn        = item.button || {};
              const buttonText = btn.button_text || "Explore";
              const buttonBg   = btn.button_color || "#FF6A00";
              const buttonTxt  = btn.text_color   || "#FFFFFF";

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
                          <Ionicons name="heart" size={wp(3)} color="#FF2D7A" />
                        </View>
                        <Text numberOfLines={1} style={styles.brandText}>
                          {brand || "LokalFrnd"}
                        </Text>
                      </View>

                      {/* Title line 1 – white */}
                      <Text numberOfLines={2} style={styles.title1}>
                        {title1}
                      </Text>

                      {/* Title line 2 – accent yellow */}
                      <Text numberOfLines={2} style={styles.title2}>
                        {title2}
                      </Text>

                      {/* Subtitle */}
                      <Text numberOfLines={2} style={styles.subtitle}>
                        {subtitle}
                      </Text>

                      {/* Feature pills row (bottom of left column) */}
                      {features.length > 0 && (
                        <View style={styles.pillsRow}>
                          {features.map((f, i) => (
                            <View key={f.id || i} style={styles.pill}>
                              <Ionicons
                                name={f.icon || "star"}
                                size={wp(2.4)}
                                color="#fff"
                              />
                              <Text numberOfLines={1} style={styles.pillText}>
                                {f.title}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* CTA Button */}
                      <TouchableOpacity
                        activeOpacity={0.9}
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
                          size={wp(3.5)}
                          color={buttonBg}
                        />
                      </TouchableOpacity>
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

export default MaleOffersScreen;

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
    height: hp(18),
    borderRadius: wp(4),
    overflow: "hidden",
  },

  cardImage: {
    borderRadius: wp(4),
    height: hp(18),
  },

  // ── LEFT ──
  leftContent: {
    position: "absolute",
    left: wp(5),
    top: hp(2),
    width: "55%",
    zIndex: 10,
    elevation: 10,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.5),
    width: "100%",
  },

  logoBox: {
    width: wp(5),
    height: wp(5),
    borderRadius: wp(1.2),
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(1),
  },

  brandText: {
    color: "#fff",
    fontSize: wp(3.2),
    fontWeight: "900",
    flex: 1,
  },

  title1: {
    color: "#FFFFFF",
    fontSize: wp(4.5),
    fontWeight: "900",
    lineHeight: wp(5.4),
  },

  title2: {
    color: "#FFD500",
    fontSize: wp(4.5),
    fontWeight: "900",
    lineHeight: wp(5.4),
    marginBottom: hp(0.4),
  },

  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: wp(2.4),
    fontWeight: "600",
    lineHeight: wp(3.2),
    marginBottom: hp(0.6),
  },

  // Feature pills (for COIN banner style — inline row)
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(1),
    marginBottom: hp(0.8),
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: wp(4),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.35),
    gap: wp(0.8),
  },

  pillText: {
    color: "#fff",
    fontSize: wp(2),
    fontWeight: "700",
  },

  button: {
    alignSelf: "flex-start",
    paddingHorizontal: wp(5),
    height: hp(4.2),
    borderRadius: wp(8),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(1),
    marginTop: hp(0.4),
  },

  buttonText: {
    fontSize: wp(3.4),
    fontWeight: "800",
  },

  // ── PAGINATION ──
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(1.8),
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