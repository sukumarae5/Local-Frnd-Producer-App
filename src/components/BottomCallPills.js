import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { moderateScale } from 'react-native-size-matters';
import { useAppTheme } from '../theme';
import { AppText } from './index';

const BottomCallPills = ({
  callingRandom,
  callingRandomVideo,
  onRandomAudio,
  onRandomVideo,
  coinBalance = 0,
  navigation,
}) => {
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [modalVisible, setModalVisible] = useState(false);
  const [attemptedCallType, setAttemptedCallType] = useState(null);

  const AUDIO_RATE = 10;
  const VIDEO_RATE = 60;

  const hasAudioCoins = coinBalance >= AUDIO_RATE;
  const hasVideoCoins = coinBalance >= VIDEO_RATE;

  const handleAudioPress = () => {
    if (!hasAudioCoins) {
      setAttemptedCallType('AUDIO');
      setModalVisible(true);
      return;
    }
    onRandomAudio();
  };

  const handleVideoPress = () => {
    if (!hasVideoCoins) {
      setAttemptedCallType('VIDEO');
      setModalVisible(true);
      return;
    }
    onRandomVideo();
  };

  const handleBuyCoins = () => {
    setModalVisible(false);
    navigation?.navigate('PlanScreen');
  };

  return (
    <>
      <View style={styles.bottomWhiteArea}>
        <TouchableOpacity
          onPress={handleAudioPress}
          activeOpacity={0.8}
          style={styles.pillWrapper}
        >
          <LinearGradient
            colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            useAngle
            angle={75.05}
            style={styles.bottomPill}
          >
            <MaterialIcons
              name="call"
              size={moderateScale(16)}
              color={colors.textInverse}
            />

            <View style={styles.pillTextWrap}>
              <AppText variant="caption" style={styles.pillTitle}>
                {callingRandom ? 'Connecting...' : 'Random'}
              </AppText>

              <AppText variant="overline" style={styles.pillSub}>
                audio call
              </AppText>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleVideoPress}
          activeOpacity={0.8}
          style={styles.pillWrapper}
        >
          <LinearGradient
            colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            useAngle
            angle={75.05}
            style={styles.bottomPill}
          >
            <MaterialIcons
              name="videocam"
              size={moderateScale(16)}
              color={colors.textInverse}
            />

            <View style={styles.pillTextWrap}>
              <AppText variant="caption" style={styles.pillTitle}>
                {callingRandomVideo ? 'Connecting...' : 'Random'}
              </AppText>

              <AppText variant="overline" style={styles.pillSub}>
                video call
              </AppText>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.pillWrapper}>
          <LinearGradient
            colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            useAngle
            angle={75.05}
            style={styles.bottomPill}
          >
            <MaterialIcons
              name="lock"
              size={moderateScale(16)}
              color={colors.textInverse}
            />

            <View style={styles.pillTextWrap}>
              <AppText variant="caption" style={styles.pillTitle}>
                Random
              </AppText>

              <AppText variant="overline" style={styles.pillSub}>
                local calls
              </AppText>
            </View>
          </LinearGradient>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <View style={styles.iconCircle}>
              <MaterialIcons
                name="monetization-on"
                size={moderateScale(36)}
                color={colors.secondary}
              />
            </View>

            <AppText variant="h4" style={styles.modalTitle}>
              Not Enough Coins
            </AppText>

            <AppText
              variant="bodySmall"
              color="textMuted"
              style={styles.modalMsg}
            >
              {attemptedCallType === 'VIDEO'
                ? `Video calls need ${VIDEO_RATE} coins per minute.\nYou have ${coinBalance} coins.`
                : `Audio calls need ${AUDIO_RATE} coins per minute.\nYou have ${coinBalance} coins.`}
            </AppText>

            <TouchableOpacity
              onPress={handleBuyCoins}
              activeOpacity={0.85}
              style={styles.buyBtnWrapper}
            >
              <LinearGradient
                colors={['#D51BF9', '#8C37F8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buyBtn}
              >
                <MaterialIcons
                  name="shopping-cart"
                  size={moderateScale(18)}
                  color={colors.textInverse}
                />
                <AppText variant="button" style={styles.buyBtnText}>
                  Buy Coins
                </AppText>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelBtn}
            >
              <AppText variant="bodySmall" color="textMuted">
                Maybe Later
              </AppText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default BottomCallPills;

const createStyles = theme => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    bottomWhiteArea: {
      backgroundColor: 'transparent',
      padding: spacing.md,
      flexDirection: 'row',
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
    },
    pillWrapper: {
      flex: 1,
      marginHorizontal: spacing.xxs,
    },

    bottomPill: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
    },

    pillTextWrap: {
      marginLeft: spacing.xs,
      alignItems: 'flex-start',
    },
    pillTitle: {
      color: colors.textInverse,
      fontWeight: '800',
    },
    pillSub: {
      color: colors.textInverse,
      fontWeight: '600',
    },

    backdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalBox: {
      width: '82%',
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      paddingVertical: spacing.xxl,
      paddingHorizontal: spacing.xl,
      alignItems: 'center',
      elevation: 10,
    },
    iconCircle: {
      width: moderateScale(72),
      height: moderateScale(72),
      borderRadius: moderateScale(36),
      backgroundColor: `${colors.secondary}1F`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    modalTitle: {
      marginBottom: spacing.xs,
    },
    modalMsg: {
      textAlign: 'center',
      lineHeight: moderateScale(22),
      marginBottom: spacing.xxl,
    },
    buyBtnWrapper: {
      width: '100%',
      borderRadius: radius.md,
      overflow: 'hidden',
      marginBottom: spacing.sm,
    },
    buyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      gap: spacing.xs,
    },
    buyBtnText: {
      color: colors.textInverse,
    },
    cancelBtn: {
      paddingVertical: spacing.xs,
    },
  });
};
