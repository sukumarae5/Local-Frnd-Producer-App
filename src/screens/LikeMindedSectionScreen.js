// src/components/LikeMindedSection.js
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Image, FlatList, Animated, Easing, ActivityIndicator } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { getLikeMindedRequest } from '../features/LikeMinded/likeMindedAction';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

// One-off decorative icon accents for this section only.
const likeMindedColors = {
  ringSolid: '#c20bf9',
  ringDashed: '#C084FC',
  heart: '#06f86f',
  phone: '#b671fb',
  chat: '#b671fb',
  location: '#b671fb',
  ripple: 'rgba(226,133,251,0.25)',
  pillBg: '#F3E8FF',
};

const LikeMindedSectionScreen = () => {
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { loading = false, data = [], error = null } = useSelector((state) => state.likeMinded || {});

  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dispatch(getLikeMindedRequest());
  }, [dispatch]);

  useEffect(() => {
    const createRippleAnimation = (animatedValue, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, { toValue: 1, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(animatedValue, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );

    const firstAnimation = createRippleAnimation(ripple1, 0);
    const secondAnimation = createRippleAnimation(ripple2, 800);

    firstAnimation.start();
    secondAnimation.start();

    return () => {
      firstAnimation.stop();
      secondAnimation.stop();
    };
  }, [ripple1, ripple2]);

  const rippleStyle1 = useMemo(
    () => ({
      position: 'absolute',
      width: moderateScale(86),
      height: moderateScale(86),
      borderRadius: moderateScale(48),
      backgroundColor: likeMindedColors.ripple,
      transform: [{ scale: ripple1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }],
      opacity: ripple1.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
    }),
    [ripple1]
  );

  const rippleStyle2 = useMemo(
    () => ({
      position: 'absolute',
      width: moderateScale(86),
      height: moderateScale(86),
      borderRadius: moderateScale(48),
      backgroundColor: likeMindedColors.ripple,
      transform: [{ scale: ripple2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }],
      opacity: ripple2.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
    }),
    [ripple2]
  );

  const getUserId = useCallback(
    (item, index) => String(item?.id ?? item?.user_id ?? item?.like_minded_user_id ?? item?.liked_user_id ?? item?._id ?? index),
    []
  );

  const getUserName = useCallback(
    (item) => item?.name || item?.full_name || item?.username || item?.user_name || item?.display_name || item?.first_name || 'User',
    []
  );

  const getProfileImage = useCallback(
    (item) =>
      item?.profile_image ||
      item?.profile_image_url ||
      item?.profile_photo ||
      item?.display_profile_image ||
      item?.image_url ||
      item?.image ||
      item?.avatar ||
      item?.photo ||
      item?.user_image ||
      null,
    []
  );

  const renderItem = useCallback(
    ({ item }) => {
      const name = getUserName(item);
      const profileImage = getProfileImage(item);

      return (
        <View style={styles.card}>
          <View style={styles.dottedRing}>
            <Animated.View style={rippleStyle1} />
            <Animated.View style={rippleStyle2} />

            <View style={styles.solidRing}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatar} resizeMode="cover" />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Icon name="person" size={moderateScale(32)} color={likeMindedColors.ringSolid} />
                </View>
              )}
            </View>

            <View style={styles.heartIcon}>
              <Icon name="heart" size={moderateScale(16)} color={likeMindedColors.heart} />
            </View>
            <View style={styles.phoneIcon}>
              <Icon name="call" size={moderateScale(16)} color={likeMindedColors.phone} />
            </View>
            <View style={styles.chatIcon}>
              <Icon name="chatbubble-ellipses-outline" size={moderateScale(16)} color={likeMindedColors.chat} />
            </View>
            <View style={styles.locationIcon}>
              <Icon name="location" size={moderateScale(16)} color={likeMindedColors.location} />
            </View>
          </View>

          <View style={styles.namePill}>
            <AppText variant="bodySmall" style={styles.nameText} numberOfLines={1}>{name}</AppText>
          </View>
        </View>
      );
    },
    [getProfileImage, getUserName, rippleStyle1, rippleStyle2, styles]
  );

  const keyExtractor = useCallback((item, index) => getUserId(item, index), [getUserId]);

  const renderContent = () => {
    if (loading && data.length === 0) {
      return (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color={likeMindedColors.ringSolid} />
          <AppText variant="bodySmall" color="textMuted" style={styles.loadingText}>
            Loading like-minded users...
          </AppText>
        </View>
      );
    }

    if (error && data.length === 0) {
      return (
        <View style={styles.statusContainer}>
          <AppText variant="bodySmall" color="error" style={styles.errorText}>
            {error?.message || error?.error || 'Unable to load like-minded users'}
          </AppText>
        </View>
      );
    }

    if (!loading && data.length === 0) {
      return (
        <View style={styles.statusContainer}>
          <AppText variant="bodySmall" color="textMuted" style={styles.emptyText}>No like-minded users found</AppText>
        </View>
      );
    }

    return (
      <FlatList
        data={data}
        horizontal
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
      />
    );
  };

  return (
    <View>
      <AppText variant="h4" style={styles.sectionLabel}>Like Minded</AppText>
      {renderContent()}
    </View>
  );
};

export default LikeMindedSectionScreen;

const createStyles = (theme) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    sectionLabel: { paddingTop: spacing.sm, paddingHorizontal: spacing.lg },

    listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs },

    card: { width: moderateScale(135), alignItems: 'center', marginLeft: -moderateScale(18), overflow: 'visible' },

    dottedRing: {
      width: moderateScale(86),
      height: moderateScale(86),
      borderRadius: moderateScale(48),
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: likeMindedColors.ringDashed,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'visible',
    },

    solidRing: {
      width: moderateScale(64),
      height: moderateScale(64),
      borderRadius: moderateScale(40),
      borderWidth: moderateScale(17),
      borderColor: likeMindedColors.ringSolid,
      justifyContent: 'center',
      alignItems: 'center',
    },

    avatar: { width: moderateScale(52), height: moderateScale(52), borderRadius: moderateScale(32) },

    avatarPlaceholder: {
      width: moderateScale(52),
      height: moderateScale(52),
      borderRadius: moderateScale(32),
      backgroundColor: likeMindedColors.pillBg,
      justifyContent: 'center',
      alignItems: 'center',
    },

    heartIcon: { position: 'absolute', top: -8, right: -8, width: moderateScale(22), height: moderateScale(22), borderRadius: moderateScale(15), justifyContent: 'center', alignItems: 'center' },
    phoneIcon: { position: 'absolute', top: -8, left: -8, width: moderateScale(30), height: moderateScale(30), borderRadius: moderateScale(15), justifyContent: 'center', alignItems: 'center' },
    chatIcon: { position: 'absolute', bottom: -8, left: -8, width: moderateScale(30), height: moderateScale(30), borderRadius: moderateScale(15), justifyContent: 'center', alignItems: 'center' },
    locationIcon: { position: 'absolute', bottom: -8, right: -8, width: moderateScale(30), height: moderateScale(30), borderRadius: moderateScale(15), justifyContent: 'center', alignItems: 'center' },

    namePill: {
      marginTop: spacing.sm,
      maxWidth: moderateScale(112),
      backgroundColor: likeMindedColors.pillBg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xxs,
      borderRadius: radius.xl,
    },

    nameText: { fontWeight: '600', color: colors.text, textAlign: 'center' },

    statusContainer: { minHeight: moderateScale(112), paddingHorizontal: spacing.lg, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: spacing.sm },
    errorText: { textAlign: 'center' },
    emptyText: { textAlign: 'center' },
  });
};