import React, { useMemo } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { moderateScale } from 'react-native-size-matters';
import { useAppTheme } from '../theme';
import { AppText } from './index';

const GradientIcon = ({ name, style }) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <LinearGradient colors={['#D51BF9', '#8C37F8']} style={[styles.iconWrap, style]}>
      <Icon name={name} size={moderateScale(22)} color="#fff" />
    </LinearGradient>
  );
};

const ReceiverHeader = ({ navigation, coins, avatar, unread, userdata }) => {
  const { theme } = useAppTheme();
  const { colors, spacing } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.coinWrapper} onPress={() => navigation.navigate('ReciverWalletScreen')}>
        <LinearGradient
          colors={['#FFA726', '#FF7043']}
          style={styles.coinGradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        >
          <Image source={require('../assets/ring.png')} style={styles.coinImage} />
          <AppText variant="subtitle" style={styles.coinText}>{coins}</AppText>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.rightIcons}>
        {/* <TouchableOpacity>
          <GradientIcon name="gift-outline" />
        </TouchableOpacity> */}

        <TouchableOpacity onPress={() => navigation.navigate('MessagesScreen')}>
          <GradientIcon name="chatbubbles-outline" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('NotificationScreen')}>
          <View>
            <GradientIcon name="notifications-outline" />
            {unread > 0 && (
              <View style={styles.badge}>
                <AppText variant="caption" style={styles.badgeText}>{unread}</AppText>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('AboutScreen', {
              userId: userdata?.user?.user_id,
              isMyProfile: true,
            })
          }
        >
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <GradientIcon name="person-outline" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReceiverHeader;

const createStyles = (theme) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    coinWrapper: {
      borderRadius: radius.pill,
      overflow: 'hidden',
    },
    coinGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      height: moderateScale(40),
      borderRadius: radius.pill,
    },
    coinImage: {
      width: moderateScale(22),
      height: moderateScale(22),
      resizeMode: 'contain',
    },
    coinText: {
      marginLeft: spacing.sm,
      color: '#f7efd9',
      fontWeight: '800',
      textShadowColor: '#634011',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 1,
    },
    rightIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconWrap: {
      width: moderateScale(38),
      height: moderateScale(38),
      borderRadius: moderateScale(19),
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatar: {
      width: moderateScale(38),
      height: moderateScale(38),
      borderRadius: moderateScale(19),
      borderWidth: 2,
      borderColor: '#D51BF9',
    },
    badge: {
      position: 'absolute',
      top: -moderateScale(3),
      right: -moderateScale(3),
      backgroundColor: colors.error,
      borderRadius: radius.pill,
      minWidth: moderateScale(16),
      height: moderateScale(16),
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      color: colors.textInverse,
      fontWeight: '700',
    },
  });
};