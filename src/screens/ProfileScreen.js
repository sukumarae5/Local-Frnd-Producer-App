import React, { useContext, useCallback, useMemo } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Path } from 'react-native-svg';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { SocketContext } from '../socket/SocketProvider';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const GradientHeart = ({ size = 140, style }) => {
  return (
    <MaskedView
      style={style}
      maskElement={<Icon name="heart" size={size} color="black" />}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.5)', 'rgba(152,50,248,0.15)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ width: size, height: size }}
      />
    </MaskedView>
  );
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { socketRef } = useContext(SocketContext);
  const { theme } = useAppTheme();
  const { colors, spacing } = theme;
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, width), [theme, width]);

  const { userdata } = useSelector(state => state.user);

  useFocusEffect(
    useCallback(() => {
      dispatch({ type: 'USER_DATA_REQUEST' });
    }, []),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <View style={styles.container}>
        {/* ================= TOP HERO SECTION (fixed illustration colors) ================= */}
        <LinearGradient
          colors={['#F3D1FF', '#E9C9FF', '#F8D4F4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.topBg}
        >
          <GradientHeart size={moderateScale(140)} style={styles.leftHeart} />
          <GradientHeart size={moderateScale(220)} style={styles.rightHeart} />

          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={theme.hitSlop}
            >
              <Icon
                name="arrow-back"
                size={moderateScale(22)}
                color={colors.icon}
              />
            </TouchableOpacity>

            <AppText variant="h3" style={styles.headerTitle}>
              Profile
            </AppText>
          </View>
          <View style={styles.avatarWrap}>
            <LinearGradient
              colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
              useAngle
              angle={75.05}
              style={styles.avatarRing}
            >
              <View style={styles.avatarInner}>
                <Image
                  source={{
                    uri:
                      userdata?.images?.display_profile_image ||
                      'https://i.pravatar.cc/150?img=12',
                  }}
                  style={styles.avatar}
                />
              </View>
            </LinearGradient>
          </View>

          <View style={styles.nameRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditProfileScreen')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
                useAngle
                angle={75.05}
                style={styles.editCircle}
              >
                <Icon name="pencil" size={moderateScale(15)} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            <AppText variant="h3" style={styles.username}>
              {userdata?.name || userdata?.user?.name || 'User'}
            </AppText>
          </View>

          <Svg
            pointerEvents="none"
            width={width}
            height={moderateScale(140)}
            style={styles.curveSvg}
          >
            <Path
              d={`
              M0 80
              C ${width * 0.25} 10, ${width * 0.75} 150, ${width} 80
              L ${width} 140
              L 0 140
              Z
            `}
              fill={colors.background}
            />
          </Svg>
        </LinearGradient>

        {/* ================= CONTENT ================= */}
        <View style={styles.content}>
          <View style={styles.listBox}>
            <Item
              icon="star-outline"
              color="#F6A623"
              title="Favorites"
              sub="you sent them a flashnote!"
              styles={styles}
              iconColors={colors}
            />

            <Item
              icon="person-outline"
              color="#FF5A5A"
              title="Invite Friends"
              sub="Invite your friends and earn Flashnotes!"
              styles={styles}
              iconColors={colors}
            />

            <Item
              icon="settings-outline"
              color={colors.textMuted}
              title="App Settings"
              sub="Manage your notifications, connected accounts.."
              onPress={() => navigation.navigate('AppsettingScreen')}
              styles={styles}
              iconColors={colors}
            />

            <Item
              icon="help-circle-outline"
              color="#2ECC71"
              title="Need Help?"
              sub="FAQ, tutorial and contact"
              onPress={() => navigation.navigate('HelpCenterScreen')}
              styles={styles}
              iconColors={colors}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

/* ================= LIST ITEM ================= */
// Pure presentational component — receives styles/colors as props rather than
// calling useAppTheme() itself, avoiding redundant context reads per row.
const Item = ({ icon, color, title, sub, onPress, styles, iconColors }) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
    <Icon name={icon} size={moderateScale(22)} color={color} />

    <View style={styles.itemTextWrap}>
      <AppText variant="subtitle">{title}</AppText>
      <AppText variant="caption" color="textMuted" style={styles.itemSub}>
        {sub}
      </AppText>
    </View>

    <Icon
      name="chevron-forward"
      size={moderateScale(18)}
      color={iconColors.textMuted}
    />
  </TouchableOpacity>
);

export default ProfileScreen;

/* ================= STYLES ================= */

const createStyles = (theme, width) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },

    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Fixed decorative hero — intentionally not theme-driven, same reasoning
    // as promo card overlays: this is illustration, not surface UI.
    topBg: {
      height: moderateScale(300),
      paddingTop: spacing.sm,
      overflow: 'hidden',
    },

    leftHeart: {
      position: 'absolute',
      left: -moderateScale(50),
      top: moderateScale(90),
      width: moderateScale(150),
      height: moderateScale(150),
      resizeMode: 'contain',
    },

    rightHeart: {
      position: 'absolute',
      right: -moderateScale(20),
      top: moderateScale(20),
      width: moderateScale(170),
      height: moderateScale(170),
      resizeMode: 'contain',
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },

    headerTitle: {
      marginLeft: spacing.sm,
    },

    avatarWrap: {
      alignItems: 'center',
      marginTop: spacing.xxs,
    },

    avatarRing: {
      width: moderateScale(120),
      height: moderateScale(120),
      borderRadius: moderateScale(60),
      justifyContent: 'center',
      alignItems: 'center',
      padding: 4,
    },

    avatarInner: {
      flex: 1,
      width: '100%',
      borderRadius: moderateScale(56),
      overflow: 'hidden',
      backgroundColor: '#fff',
    },

    avatar: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.md,
    },

    editCircle: {
      width: moderateScale(34),
      height: moderateScale(34),
      borderRadius: moderateScale(17),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
    },

    username: {
      color: '#000', // sits on the fixed pastel hero, kept fixed to match
    },

    curveSvg: {
      position: 'absolute',
      bottom: -1,
    },

    content: {
      flex: 1,
      backgroundColor: colors.background,
      marginTop: -moderateScale(8),
    },

    listBox: {
      backgroundColor: colors.background,
    },

    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },

    itemTextWrap: {
      flex: 1,
      marginLeft: spacing.md,
    },

    itemSub: {
      marginTop: spacing.xxs,
    },
  });
};
