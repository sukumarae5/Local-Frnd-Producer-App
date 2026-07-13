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

const MaleOffersScreen = () => {
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

  const handleScroll = e => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
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
            decelerationRate="fast"
            snapToInterval={width}
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
              const buttonBg = btn.button_color || '#FF6A00';

              const features = item.features || [];

              return (
                <View key={item.id || index} style={styles.slide}>
                  <ImageBackground
                    source={{ uri: item.background_image }}
                    style={styles.card}
                    imageStyle={styles.cardImage}
                    resizeMode="cover"
                  >
                    <View style={styles.leftContent}>
                      <View style={styles.brandRow}>
                        <View style={styles.logoBox}>
                          <Ionicons
                            name="heart"
                            size={moderateScale(15)}
                            color="#FF2D7A"
                          />
                        </View>
                        <AppText numberOfLines={1} style={styles.brandText}>
                          {brand || 'LokalFrnd'}
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

                      {features.length > 0 && (
                        <View style={styles.pillsRow}>
                          {features.map((f, i) => (
                            <LinearGradient
                              key={f.id || i}
                              colors={[
                                colors.gradientPurpleStart,
                                colors.gradientPurpleEnd,
                              ]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              useAngle
                              angle={75.05}
                              style={styles.pill}
                            >
                              <Ionicons
                                name={f.icon || 'star'}
                                size={moderateScale(12)}
                                color="#fff"
                              />

                              <AppText
                                numberOfLines={1}
                                style={styles.pillText}
                              >
                                {f.title}
                              </AppText>
                            </LinearGradient>
                          ))}
                        </View>
                      )}

                      <TouchableOpacity
                        activeOpacity={0.9}
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
                          size={moderateScale(17)}
                          color={buttonBg}
                        />
                      </TouchableOpacity>
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

export default MaleOffersScreen;

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

    // Screen-level proportion — legitimate use of window dimensions.
    card: {
      width: width * 0.96,
      height: height * 0.18,
      borderRadius: radius.lg,
      overflow: 'hidden',
    },

    cardImage: {
      borderRadius: radius.lg,
      height: height * 0.18,
    },

    // Overlay content positioned relative to the CARD — percentages intentional.
    leftContent: {
      position: 'absolute',
      left: '5%',
      top: '10%',
      width: '55%',
      zIndex: 10,
      elevation: 10,
    },

    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
      width: '100%',
    },

    logoBox: {
      width: moderateScale(24),
      height: moderateScale(24),
      borderRadius: moderateScale(6),
      backgroundColor: 'rgba(255,255,255,0.18)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.xxs,
    },

    // Text-on-photo — kept fixed white/yellow for legibility over the image,
    // same reasoning as OffersSectionScreen and StoryViewer.
    brandText: {
      color: '#fff',
      fontSize: moderateScale(13),
      fontWeight: '900',
      flex: 1,
    },

    title1: {
      color: '#FFFFFF',
      fontSize: moderateScale(18),
      fontWeight: '900',
      lineHeight: moderateScale(22),
    },

    title2: {
      color: '#FFD500',
      fontSize: moderateScale(18),
      fontWeight: '900',
      lineHeight: moderateScale(22),
      marginBottom: spacing.xxs,
    },

    subtitle: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: moderateScale(10),
      fontWeight: '600',
      lineHeight: moderateScale(13),
      marginBottom: spacing.xs,
    },

    pillsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xxs,
      marginBottom: spacing.sm,
    },

    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.lg,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      gap: spacing.xxs,
    },

    pillText: {
      color: '#fff',
      fontSize: moderateScale(8),
      fontWeight: '700',
    },

    button: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.xl,
      height: moderateScale(38),
      borderRadius: radius.pill,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xxs,
      marginTop: spacing.xxs,
    },

    buttonText: {
      fontSize: moderateScale(14),
      fontWeight: '800',
    },

    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.md,
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
