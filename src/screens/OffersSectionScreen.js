import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { moderateScale } from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getOffersRequest } from '../features/Offers/offersActions';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

// Extract a content value by key from the contents array
const getContent = (contents = [], key) =>
  (contents.find(c => c.content_key === key) || {}).content_value || '';

const OffersSectionScreen = () => {
  const dispatch = useDispatch();
  const [activeIndex, setActiveIndex] = useState(0);

  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const { width, height } = useWindowDimensions();
  const styles = useMemo(
    () => createStyles(theme, width, height),
    [theme, width, height],
  );
  const { offers, loading } = useSelector(state => state.offers);

  const activeOffers = (offers || []).filter(item => Number(item.status) === 1);

  useEffect(() => {
    dispatch(getOffersRequest());
  }, [dispatch]);

  const handleScroll = event => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <AppText variant="h4" style={styles.sectionLabel}>
        Offers
      </AppText>

      {loading ? (
        <AppText variant="body" color="textSecondary" style={styles.loading}>
          Loading...
        </AppText>
      ) : (
        <>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
          >
            {activeOffers.map((item, index) => {
              const brand = getContent(item.contents, 'brand');
              const title1 = getContent(item.contents, 'title1');
              const title2 = getContent(item.contents, 'title2');
              const subtitle = getContent(item.contents, 'subtitle');

              const btn = item.button || {};
              const buttonText = btn.button_text || 'Explore';
              const buttonBg = btn.button_color || colors.secondary;

              const features = item.features || [];

              return (
                <View key={item.id || index} style={styles.slide}>
                  <ImageBackground
                    source={{ uri: item.background_image }}
                    style={styles.card}
                    imageStyle={styles.cardImage}
                    resizeMode="cover"
                  >
                    {/* LEFT CONTENT */}
                    <View style={styles.leftContent}>
                      <View style={styles.brandRow}>
                        <View style={styles.logoBox}>
                          <Ionicons
                            name="heart"
                            size={moderateScale(11)}
                            color="#fff"
                          />
                        </View>
                        <AppText numberOfLines={1} style={styles.brandText}>
                          {brand || 'LokalFrnd RJ'}
                        </AppText>
                      </View>

                      <AppText numberOfLines={2} style={styles.title1}>
                        {title1}
                      </AppText>
                      <AppText numberOfLines={2} style={styles.title2}>
                        {title2}
                      </AppText>
                      <AppText numberOfLines={2} style={styles.subtitle}>
                        {subtitle}
                      </AppText>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={[styles.button, { backgroundColor: '#fff' }]}
                      >
                        <AppText
                          numberOfLines={1}
                          style={[styles.buttonText, { color: buttonBg }]}
                        >
                          {buttonText}
                        </AppText>
                        <Ionicons
                          name="arrow-forward"
                          size={moderateScale(10)}
                          color={buttonBg}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* RIGHT FEATURE BOXES */}
                    <View style={styles.rightContent}>
                      {features.map((f, i) => (
                        <View key={f.id || i} style={styles.rightBox}>
                          <Ionicons
                            name={f.icon || 'star'}
                            size={moderateScale(10)}
                            color="#fff"
                          />
                          <AppText numberOfLines={2} style={styles.rightText}>
                            {f.title}
                          </AppText>
                        </View>
                      ))}
                    </View>
                  </ImageBackground>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.pagination}>
            {activeOffers.map((_, index) =>
              activeIndex === index ? (
                <LinearGradient
                  key={index}
                  colors={[
                    colors.gradientPurpleStart,
                    colors.gradientPurpleEnd,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  useAngle
                  angle={75.05}
                  style={styles.pageDotActive}
                />
              ) : (
                <View key={index} style={styles.pageDot} />
              ),
            )}
          </View>
        </>
      )}
    </View>
  );
};

export default OffersSectionScreen;

const createStyles = (theme, width, height) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    container: { marginTop: spacing.sm },

    sectionLabel: {
      color: colors.text,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.xs,
    },

    loading: {
      textAlign: 'center',
      marginVertical: spacing.xl,
    },

    slide: { width, alignItems: 'center' },

    // Card is a proportion of the screen — legitimate use of window dimensions,
    // since this is screen-level (not component-level) layout.
    card: {
      width: width * 0.96,
      height: height * 0.2,
      borderRadius: radius.lg,
      overflow: 'hidden',
    },

    cardImage: {
      borderRadius: radius.lg,
      height: height * 0.2,
    },

    // Overlay content is positioned relative to the CARD, not the screen —
    // percentages here are correct and intentional.
    leftContent: {
      position: 'absolute',
      left: '5.2%',
      top: '11%',
      width: '42%',
      zIndex: 10,
      elevation: 10,
    },

    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xxs,
      width: '100%',
    },

    logoBox: {
      width: moderateScale(15),
      height: moderateScale(15),
      borderRadius: moderateScale(4),
      backgroundColor: '#EC2C83', // brand accent for this promo card, intentionally fixed
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.xxs,
    },

    // Overlay text sits directly on a photo background — kept as fixed white/yellow
    // rather than theme.colors, since these need to stay legible over an image
    // regardless of light/dark app theme (same reasoning as StoryViewer).
    brandText: {
      color: '#fff',
      fontSize: moderateScale(11),
      fontWeight: '900',
      flex: 1,
    },

    title1: {
      color: '#FFFFFF',
      fontSize: moderateScale(14),
      fontWeight: '900',
      lineHeight: moderateScale(17),
    },

    title2: {
      color: '#FFD400',
      fontSize: moderateScale(14),
      fontWeight: '900',
      lineHeight: moderateScale(17),
      marginBottom: spacing.xxs,
    },

    subtitle: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: moderateScale(8),
      fontWeight: '600',
      lineHeight: moderateScale(11),
      marginBottom: spacing.xs,
    },

    button: {
      marginTop: spacing.xxs,
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      height: moderateScale(28),
      borderRadius: radius.pill,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xxs,
    },

    buttonText: {
      fontSize: moderateScale(10),
      fontWeight: '700',
    },

    rightContent: {
      position: 'absolute',
      right: '2.5%',
      top: '12%',
      width: '22%',
      zIndex: 10,
      elevation: 10,
      gap: spacing.xxs,
    },

    rightBox: {
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
      borderRadius: radius.sm,
      backgroundColor: 'rgba(0,0,0,0.15)',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xxs,
      paddingVertical: spacing.xxs,
      marginBottom: spacing.xxs,
    },

    rightText: {
      flex: 1,
      color: '#fff',
      fontSize: moderateScale(7),
      fontWeight: '800',
      lineHeight: moderateScale(9),
      marginLeft: spacing.xxs,
    },

    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.sm,
    },
    pageDot: {
      width: moderateScale(7),
      height: moderateScale(7),
      borderRadius: moderateScale(4),
      backgroundColor: colors.border,
      marginHorizontal: spacing.xxs,
    },

    pageDotActive: {
      width: moderateScale(20),
      height: moderateScale(7),
      borderRadius: moderateScale(4),
      marginHorizontal: spacing.xxs,
    },
  });
};
