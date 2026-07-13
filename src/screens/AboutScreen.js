import React, { useEffect, useState } from 'react';
import {
  View,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { verticalScale, moderateScale } from 'react-native-size-matters';
import Svg, { Path } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAppTheme } from '../theme';
import { AppText } from '../components';

import {
  friendRequest,
  friendAcceptRequest,
  friendStatusRequest,
} from '../features/friend/friendAction';

import { otherUserFetchRequest } from '../features/Otherusers/otherUserActions';

const CURVE_HEIGHT = verticalScale(105);

const AboutScreen = ({ navigation, route }) => {
  const { userId: routeUserId, isMyProfile } = route.params || {};

  const { theme } = useAppTheme();
  const { colors, spacing, radius, fontSizes } = theme;
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const HEADER_HEIGHT = height * 0.5;

  const dispatch = useDispatch();
  const [localPending, setLocalPending] = useState(false);

  const { userdata } = useSelector(state => state.user);
  const profileData = useSelector(state => state.otherUsers.profile);
  const friendStatus = useSelector(state => state.friends.friendStatus);
  const incoming = useSelector(state => state.friends.incoming);

  useEffect(() => {
    if (!isMyProfile && routeUserId) {
      dispatch(otherUserFetchRequest(routeUserId));
    }
  }, [routeUserId, isMyProfile, dispatch]);

  const profile = isMyProfile
    ? userdata
    : profileData?.profile || profileData || {};

  const user = profile?.user || {};
  const images = profile?.images || {};
  const location = profile?.location || {};
  const lifestyles = profile?.lifestyles || [];
  const interests = profile?.interests || [];
  const gallery = images?.gallery || [];

  const profileUserId = user?.user_id;

  useEffect(() => {
    if (profileUserId && !isMyProfile) {
      dispatch(friendStatusRequest(profileUserId));
    }
  }, [profileUserId, isMyProfile, dispatch]);

  useEffect(() => {
    if (profileUserId) {
      setLocalPending(false);
    }
  }, [friendStatus[profileUserId]?.state, profileUserId]);

  const getAge = dob => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const name = user?.name || 'name not available';
  const username = user?.username || 'username not available';
  const gender = user?.gender || 'gender not specified';
  const age = getAge(user?.date_of_birth) || 'age not specified';
  const language = profile?.language?.native_name || 'language not specified';

  const locationText = [
    location?.city?.name || location?.city || 'city not specified',
    location?.state?.name || location?.state || 'state not specified',
    location?.country?.name || location?.country || 'country not specified',
  ]
    .filter(Boolean)
    .join(', ');

  const avatarSource = images?.display_profile_image
    ? { uri: images.display_profile_image }
    : images?.profile_image
    ? { uri: images.profile_image }
    : images?.avatar
    ? { uri: images.avatar }
    : require('../assets/boy1.jpg');

  const currentStatus = profileUserId
    ? friendStatus[profileUserId]?.state
    : null;

  const isFollowing = currentStatus === 'FRIEND';
  const isPending = currentStatus === 'PENDING_SENT' || localPending;
  const isReceived = currentStatus === 'PENDING_RECEIVED';

  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const renderFollowingText = () => {
    if (isMyProfile) {
      return (
        <View style={styles.myProfileBadge}>
          <AppText variant="caption" style={{ color: colors.secondary, fontWeight: '700' }}>
            My Profile
          </AppText>
        </View>
      );
    }

    if (!isFollowing && !isPending && !isReceived) {
      return (
        <View style={styles.followingTextOnly}>
          <AppText variant="caption" style={{ color: colors.info, fontWeight: '700' }}>
            + Follow
          </AppText>
        </View>
      );
    }

    if (isFollowing) {
      return (
        <View style={styles.followingTextOnly}>
          <AppText variant="caption" style={{ color: colors.info, fontWeight: '700' }}>
            Following
          </AppText>
        </View>
      );
    }

    if (isPending) {
      return (
        <View style={styles.followingTextOnly}>
          <AppText variant="caption" style={{ color: colors.info, fontWeight: '700' }}>
            Pending
          </AppText>
        </View>
      );
    }

    if (isReceived) {
      const req = incoming.find(r => r.sender_id === profileUserId);
      if (!req) return null;

      return (
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => {
            dispatch(friendAcceptRequest(req.request_id));
            setTimeout(() => dispatch(friendStatusRequest(profileUserId)), 300);
          }}
        >
          <AppText variant="caption" style={{ color: colors.textInverse, fontWeight: '700' }}>
            Accept
          </AppText>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderFloatingAction = () => {
    if (isMyProfile) {
      return (
        <TouchableOpacity
          style={styles.floatingActionBtn}
          onPress={() => navigation.navigate('EditProfileScreen')}
        >
          <Icon name="create-outline" size={moderateScale(20)} color={colors.textInverse} />
        </TouchableOpacity>
      );
    }

    if (!profileUserId) return null;

    if (!isFollowing && !isPending && !isReceived) {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.floatingActionBtn}
          onPress={() => {
            setLocalPending(true);
            dispatch(friendRequest(profileUserId));
          }}
        >
          <Icon name="heart" size={moderateScale(20)} color={colors.textInverse} />
        </TouchableOpacity>
      );
    }

    return null;
  };

  if (!profile || !user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <AppText variant="body">Loading...</AppText>
      </View>
    );
  }

  return (
    <View style={[styles.main, { backgroundColor: colors.background }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colors.statusBar}
      />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={[styles.headerWrap, { height: HEADER_HEIGHT }]}>
          <ImageBackground
            source={avatarSource}
            style={styles.bgImage}
            imageStyle={styles.imageStyle}
          >
            <TouchableOpacity
              style={[styles.backBtn, { top: insets.top + spacing.sm }]}
              onPress={() => navigation.goBack()}
            >
              <Icon name="chevron-back" size={moderateScale(25)} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.overlayPanel}>
              <AppText variant="h4" style={{ color: colors.textInverse, textTransform: 'lowercase' }}>
                {name}
              </AppText>

              <View style={styles.distanceRow}>
                <Icon name="location-outline" size={moderateScale(12)} color={colors.primary} />
                <AppText
                  variant="caption"
                  style={{ color: colors.textInverse, marginLeft: spacing.xxs, fontWeight: '500' }}
                >
                  {locationText}
                </AppText>
              </View>

              {renderFollowingText()}
            </View>

            {renderFloatingAction()}

            <Svg width={width} height={CURVE_HEIGHT} style={styles.curveSvg}>
              <Path
                d={`M0 72 C ${width * 0.26} 10, ${width * 0.48} 40, ${
                  width * 0.63
                } 55 C ${width * 0.82} 80, ${
                  width * 0.95
                } 40, ${width} 10 L ${width} ${CURVE_HEIGHT} L 0 ${CURVE_HEIGHT} Z`}
                fill={colors.background}
              />
            </Svg>
          </ImageBackground>
        </View>

        <SafeAreaView edges={['bottom']} style={styles.container}>
          <AppText variant="h4" style={styles.sectionTitle}>About</AppText>

          <View style={styles.tagRow}>
            <View style={styles.chip}>
              <Icon name="male-female-outline" size={moderateScale(12)} color={colors.textSecondary} />
              <AppText variant="caption" style={styles.chipText}>{gender}</AppText>
            </View>

            <View style={styles.chip}>
              <Icon name="calendar-outline" size={moderateScale(12)} color={colors.textSecondary} />
              <AppText variant="caption" style={styles.chipText}>{age} Year</AppText>
            </View>

            <View style={styles.chip}>
              <Icon name="location-outline" size={moderateScale(12)} color={colors.textSecondary} />
              <AppText variant="caption" style={styles.chipText}>{locationText}</AppText>
            </View>

            <View style={styles.chip}>
              <Icon name="language-outline" size={moderateScale(12)} color={colors.textSecondary} />
              <AppText variant="caption" style={styles.chipText}>{language}</AppText>
            </View>

            {username ? (
              <View style={styles.chip}>
                <Icon name="person-outline" size={moderateScale(12)} color={colors.textSecondary} />
                <AppText variant="caption" style={styles.chipText}>@{username}</AppText>
              </View>
            ) : null}
          </View>

          <AppText variant="bodySmall" style={styles.bioText}>
            {typeof user.bio === 'string' && user.bio.trim() ? user.bio : 'No bio available'}
          </AppText>

          <AppText variant="h4" style={styles.sectionTitle}>Life Style</AppText>

          <View style={styles.tagRow}>
            {lifestyles.length ? (
              lifestyles.map((l, i) => (
                <View key={i} style={styles.chip}>
                  <Icon name="leaf-outline" size={moderateScale(12)} color={colors.textSecondary} />
                  <AppText variant="caption" style={styles.chipText}>
                    {l?.name ||
                      `${l?.category?.name || 'Name not specified'} :${
                        l?.subcategory?.name || 'Subcategory not specified'
                      }`}
                  </AppText>
                </View>
              ))
            ) : (
              <AppText variant="bodySmall" color="textMuted" style={styles.empty}>None</AppText>
            )}
          </View>

          <AppText variant="h4" style={styles.sectionTitle}>Interested</AppText>

          <View style={styles.tagRow}>
            {interests.length ? (
              interests.map((item, index) => (
                <View key={index} style={styles.chip}>
                  <AppText variant="caption" style={styles.chipText}>
                    {item?.name || 'Interest not specified'}
                  </AppText>
                </View>
              ))
            ) : (
              <AppText variant="bodySmall" color="textMuted" style={styles.empty}>None</AppText>
            )}
          </View>

          <AppText variant="h4" style={styles.sectionTitle}>Gallery</AppText>

          <View style={styles.galleryGrid}>
            {gallery.length ? (
              gallery.map((img, i) => (
                <View key={i} style={styles.galleryItem}>
                  {img?.photo_url ? (
                    <ImageBackground source={{ uri: img.photo_url }} style={styles.galleryImage} />
                  ) : null}
                </View>
              ))
            ) : (
              <AppText variant="bodySmall" color="textMuted" style={styles.empty}>No Photos</AppText>
            )}
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
};

export default AboutScreen;

const createStyles = (theme) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    main: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    headerWrap: { width: '100%', backgroundColor: colors.background, position: 'relative' },
    bgImage: { width: '100%', height: '100%' },
    imageStyle: { resizeMode: 'cover' },

    backBtn: {
      position: 'absolute',
      left: spacing.lg,
      zIndex: 50,
      width: moderateScale(36),
      height: moderateScale(36),
      borderRadius: moderateScale(18),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.88)',
    },

    overlayPanel: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: CURVE_HEIGHT - verticalScale(30),
      backgroundColor: colors.overlay,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingLeft: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
      zIndex: 8,
    },

    distanceRow: { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center' },

    followingTextOnly: {
      marginTop: spacing.sm,
      alignSelf: 'flex-start',
      backgroundColor: `${colors.info}1A`,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs + 2,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.info,
    },

    acceptBtn: {
      marginTop: spacing.sm,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs + 2,
      borderRadius: radius.pill,
      alignSelf: 'flex-start',
      justifyContent: 'center',
      alignItems: 'center',
    },

    myProfileBadge: {
      marginTop: spacing.sm,
      alignSelf: 'flex-start',
      backgroundColor: `${colors.secondary}1A`,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs + 2,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.secondary,
    },

    floatingActionBtn: {
      position: 'absolute',
      right: spacing.huge + spacing.sm,
      bottom: CURVE_HEIGHT + spacing.lg,
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(20),
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.textInverse,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 40,
      ...theme.shadows.lg,
    },

    curveSvg: { position: 'absolute', bottom: 0, left: 0, zIndex: 40 },

    container: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      marginTop: -verticalScale(40),
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      zIndex: 40,
    },

    sectionTitle: { marginTop: spacing.md, marginBottom: spacing.md, marginLeft: 2 },

    tagRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },

    chip: {
      minHeight: moderateScale(28),
      borderRadius: radius.md,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xxs + 3,
      backgroundColor: `${colors.primary}14`,
      marginRight: spacing.sm,
      marginBottom: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      maxWidth: '90%',
    },

    chipText: { color: colors.textSecondary, marginLeft: spacing.xxs, fontWeight: '500' },

    bioText: { marginTop: spacing.xxs, color: colors.textSecondary, lineHeight: 22 },

    galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

    galleryItem: {
      width: '48%',
      height: verticalScale(125),
      borderRadius: radius.lg,
      marginBottom: spacing.md,
      overflow: 'hidden',
      backgroundColor: colors.surface,
    },

    galleryImage: { width: '100%', height: '100%' },

    empty: { marginBottom: spacing.sm },
  });
};