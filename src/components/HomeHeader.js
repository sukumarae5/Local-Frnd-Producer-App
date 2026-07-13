import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { useAppTheme } from '../theme';
import { AppText } from './index'; // adjust path to wherever your components barrel lives

const HomeHeader = ({ navigation, userdata, unread, imageUrl, withSpacing }) => {
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.headerContainer, { paddingTop: withSpacing ? spacing.sm : 0 }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate('PlanScreen')}>
          <LinearGradient colors={['#FFA726', '#FF7043']} style={styles.coinBox}>
            <Image source={require('../assets/coin1.png')} style={styles.coinImage} />
            <AppText variant="subtitle" style={styles.coinText}>
              {userdata?.user?.coin_balance ?? 0}
            </AppText>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('MessagesScreen')}>
            <LinearGradient colors={['#D51BF9', '#8C37F8']} style={styles.iconCircle}>
              <Icon name="chatbubbles-outline" size={moderateScale(22)} color={colors.textInverse} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('NotificationScreen')}>
            <LinearGradient colors={['#D51BF9', '#8C37F8']} style={styles.iconCircle}>
              <Icon name="notifications-outline" size={moderateScale(22)} color={colors.textInverse} />
            </LinearGradient>

            {unread > 0 && (
              <View style={styles.badge}>
                <AppText variant="caption" style={styles.badgeText}>
                  {unread > 99 ? '99+' : unread}
                </AppText>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AboutScreen', {
                userId: userdata?.user?.user_id,
                isMyProfile: true,
              })
            }
          >
            <Image source={imageUrl} style={styles.profilePic} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HomeHeader;

const createStyles = (theme) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    headerContainer: {
      paddingBottom: spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    coinBox: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      height: verticalScale(40),
      borderRadius: radius.pill,
    },
    coinImage: {
      width: moderateScale(22),
      height: moderateScale(22),
      resizeMode: 'contain',
    },
    coinText: {
      marginLeft: spacing.sm,
      color: '#f7efd9', // kept as-is: intentional gold-on-gradient, not a theme surface color
      fontWeight: '800',
      textShadowColor: '#634011',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 1,
    },
    rightIcons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconCircle: {
      width: moderateScale(38),
      height: moderateScale(38),
      borderRadius: moderateScale(19),
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing.sm,
    },
    profilePic: {
      width: moderateScale(38),
      height: moderateScale(38),
      borderRadius: moderateScale(19),
      marginLeft: spacing.sm,
      borderWidth: 2,
      borderColor: colors.secondary,
    },
    badge: {
      position: 'absolute',
      top: -verticalScale(2),
      right: -moderateScale(2),
      backgroundColor: colors.error,
      borderRadius: radius.pill,
      minWidth: moderateScale(18),
      height: moderateScale(18),
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xxs,
      borderWidth: 1.5,
      borderColor: colors.textInverse,
    },
    badgeText: {
      color: colors.textInverse,
      fontWeight: '700',
    },
  });
};