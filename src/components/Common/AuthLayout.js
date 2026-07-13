import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme';

const GradientHeart = ({ size, style, rotate = '0deg' }) => (
  <MaskedView
    style={[{ width: size, height: size }, style]}
    maskElement={
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Icon
          name="heart"
          size={size}
          color="#000"
        />
      </View>
    }>
    <LinearGradient
      colors={[
        'rgba(255,255,255,0.65)',
        'rgba(168,85,247,0.25)',
      ]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{
        flex: 1,
        transform: [{ rotate }],
      }}
    />
  </MaskedView>
);

const AuthLayout = ({
  children,
  showBack = false,
  onBack,
}) => {
  const { theme } = useAppTheme();
  const { spacing, radius, colors } = theme;

  const insets = useSafeAreaInsets();

  const { width, height } =
    useWindowDimensions();

  const styles = useMemo(
    () =>
      createStyles(
        theme,
        width,
        height,
      ),
    [theme, width, height],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>

          {showBack && (
            <TouchableOpacity
              onPress={onBack}
              hitSlop={theme.hitSlop}
              style={[
                styles.backButton,
                {
                  top:
                    insets.top +
                    spacing.sm,
                },
              ]}>
              <Icon
                name="chevron-back"
                size={26}
                color="#000"
              />
            </TouchableOpacity>
          )}

          <LinearGradient
            colors={[
              '#F3D1FF',
              '#E9C9FF',
              '#F8D4F4',
            ]}
            style={styles.gradient}>

            <GradientHeart
              size={styles.leftHeart.width}
              rotate="-18deg"
              style={styles.leftHeart}
            />

            <GradientHeart
              size={styles.rightHeart.width}
              rotate="18deg"
              style={styles.rightHeart}
            />
          </LinearGradient>

          {/* Curve */}
          <Svg
            width={width}
            height={styles.curve.height}
            style={styles.curve}>
            <Path
              d={`
                M0 ${styles.curveHeight}
                C ${width * 0.22} 20,
                  ${width * 0.78} ${
                styles.curveHeight + 70
              },
                  ${width} 70
                L ${width} ${
                styles.curve.height
              }
                L 0 ${
                styles.curve.height
              }
                Z
              `}
              fill={colors.background}
            />
          </Svg>

          {/* Logo */}
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../components/BackgroundPages/main_log1.png')}
              style={styles.logo}
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AuthLayout;

const createStyles = (
  theme,
  width,
  height,
) => {
  const {
    spacing,
    radius,
    colors,
  } = theme;

  const logoSize = Math.min(
    width * 0.28,
    120,
  );

  const leftHeart = Math.min(
    width * 0.42,
    170,
  );

  const rightHeart = Math.min(
    width * 0.62,
    260,
  );

  const headerHeight = height * 0.34;

  const curveHeight = 120;

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#F3D1FF',
    },

    container: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    header: {
      width: '100%',
      height: headerHeight,
      overflow: 'hidden',
    },

    gradient: {
      flex: 1,
    },

    backButton: {
      position: 'absolute',
      left: spacing.lg,
      zIndex: 100,
      backgroundColor:
        'rgba(255,255,255,0.9)',
      padding: spacing.sm,
      borderRadius:
        radius.pill,
    },

    leftHeart: {
      width: leftHeart,
      height: leftHeart,
      position: 'absolute',
      left: -leftHeart * 0.25,
      bottom: 20,
    },

    rightHeart: {
      width: rightHeart,
      height: rightHeart,
      position: 'absolute',
      right: -rightHeart * 0.22,
      top: 30,
    },

    logoWrapper: {
      position: 'absolute',
      width: '100%',
      alignItems: 'center',
      top: headerHeight * 0.12,
    },

    logo: {
      width: logoSize,
      height: logoSize,
      resizeMode: 'contain',
    },

    curve: {
      position: 'absolute',
      bottom: -1,
      height: 140,
    },

    curveHeight,

    content: {
      flex: 1,
      paddingHorizontal:
        spacing.xl,

      // IMPORTANT:
      // removes the small separator look
      marginTop: -1,
      backgroundColor:
        colors.background,
    },
  });
};