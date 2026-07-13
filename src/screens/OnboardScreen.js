import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Image, Animated, Easing, useWindowDimensions } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import WelcomeScreenbackgroundgpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaskedView from '@react-native-masked-view/masked-view';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const rotatingItems = [
  { id: 1, src: require('../assets/boy1.jpg'), type: 'image', size: 40, angle: 0 },
  { id: 2, name: 'call', type: 'icon', size: 26, angle: 60 },
  { id: 3, src: require('../assets/boy3.jpg'), type: 'image', size: 40, angle: 150 },
  { id: 4, src: require('../assets/man.png'), type: 'image', size: 40, angle: 240 },
  { id: 5, name: 'location', type: 'icon', size: 26, angle: 300 },
];

// Keep a value within [min, max]
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Create once at module scope. Calling Animated.createAnimatedComponent()
// inside the component body would create a new component type on every
// render, forcing remounts and causing hook-order warnings.
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

const OnboardScreen = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { colors, spacing } = theme;
  const { width, height } = useWindowDimensions();

  // --- Responsive geometry -------------------------------------------------
  const shortSide = Math.min(width, height);

  // Orbit radius: ~30% of the short side, clamped for tiny phones / tablets.
  const RADIUS = clamp(shortSide * 0.3, 85, 140);

  // Orbiting avatar/icon size scales gently with the radius.
  const orbitItemScale = clamp(RADIUS / 120, 0.75, 1.25);

  // Dotted ring radius must exactly match the orbit path radius (RADIUS)
  // so the items sit ON the dotted line, not inside or outside it.
  const dottedDiameter = RADIUS * 2;
  // Container box just needs extra room so items (which extend past the
  // dotted line by half their own size) aren't clipped. This is purely
  // for sizing the wrapping View and does not affect item/circle alignment.
  const orbitContainerSize = dottedDiameter + moderateScale(60) * orbitItemScale;
  const mainAvatarWrapperSize = clamp(RADIUS * 1.05, 110, 150);

  const styles = useMemo(
    () =>
      createStyles(theme, {
        width,
        height,
        dottedDiameter,
        orbitContainerSize,
        mainAvatarWrapperSize,
      }),
    [theme, width, height, dottedDiameter, orbitContainerSize, mainAvatarWrapperSize]
  );

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 30000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  useEffect(() => {
    const animateRipple = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    };

    animateRipple(ripple1, 0);
    animateRipple(ripple2, 500);
  }, []);

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const reverseRotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });

  const rippleSize = mainAvatarWrapperSize + moderateScale(10);

  const rippleStyle1 = {
    position: 'absolute',
    width: rippleSize,
    height: rippleSize,
    borderRadius: rippleSize / 2,
    transform: [{ scale: ripple1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
    opacity: ripple1.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] }),
  };

  const rippleStyle2 = {
    position: 'absolute',
    width: rippleSize,
    height: rippleSize,
    borderRadius: rippleSize / 2,
    transform: [{ scale: ripple2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
    opacity: ripple2.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
  };

  return (
    <WelcomeScreenbackgroundgpage>
      <View style={styles.container}>
        <Image source={require('../components/BackgroundPages/main_log1.png')} style={styles.logo} />

        <View style={styles.centerWrapper}>
          <View style={styles.orbitContainer}>
            <View style={styles.dottedCircle} />

            <Animated.View style={{ transform: [{ rotate }], zIndex: 2, elevation: 2 }}>
              {rotatingItems.map((item) => {
                const rad = (item.angle * Math.PI) / 180;
                const baseSize = item.type === 'icon' ? moderateScale(30) : moderateScale(item.size);
                const actualSize = baseSize * orbitItemScale;
                const offset = actualSize / 2;

                return (
                  <Animated.View
                    key={item.id}
                    style={{
                      position: 'absolute',
                      zIndex: 2,
                      transform: [
                        { translateX: RADIUS * Math.cos(rad) - offset },
                        { translateY: RADIUS * Math.sin(rad) - offset },
                      ],
                    }}
                  >
                    {item.type === 'image' ? (
                      <LinearGradient
                        colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          width: actualSize + 6,
                          height: actualSize + 6,
                          borderRadius: (actualSize + 6) / 2,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <View
                          style={{
                            width: actualSize,
                            height: actualSize,
                            borderRadius: actualSize / 2,
                            overflow: 'hidden',
                            backgroundColor: '#fff',
                          }}
                        >
                          <Animated.View style={{ flex: 1, transform: [{ rotate: reverseRotate }] }}>
                            <Image source={item.src} style={{ width: '100%', height: '100%' }} />
                          </Animated.View>
                        </View>
                      </LinearGradient>
                    ) : (
                      <Animated.View
                        style={{
                          width: actualSize,
                          height: actualSize,
                          justifyContent: 'center',
                          alignItems: 'center',
                          transform: [{ rotate: reverseRotate }],
                        }}
                      >
                        <Ionicons name={item.name} size={actualSize} color={colors.purple} />
                      </Animated.View>
                    )}
                  </Animated.View>
                );
              })}
            </Animated.View>
          </View>

          <AnimatedGradient
            colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={rippleStyle1}
          />

          <AnimatedGradient
            colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={rippleStyle2}
          />

          <View style={styles.gradientWrapper}>
            <LinearGradient
              colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBorder}
            >
              <View style={styles.innerRing}>
                <Image source={require('../assets/girl1.jpg')} style={styles.mainAvatar} />
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.textContainer}>
          <AppText variant="h3" style={styles.title}>It's easy to find a local_frnd</AppText>
          <AppText variant="h4" style={styles.subtitle}>nearby & around you</AppText>
        </View>
      </View>

      <View style={styles.bottomWrapper}>
        <View style={styles.paginationWrapper}>
          <LinearGradient
            colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dotActive}
          />
          <LinearGradient colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]} style={[styles.dot, { opacity: 0.6 }]} />
          <LinearGradient colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]} style={[styles.dot, { opacity: 0.6 }]} />
        </View>

        <View style={styles.nextButtonWrapper}>
          <MaskedView
            maskElement={
              <AppText variant="subtitle" style={[styles.nextText, { backgroundColor: 'transparent' }]}>
                Next
              </AppText>
            }
          >
            <LinearGradient
              colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <AppText
                variant="subtitle"
                style={[styles.nextText, { opacity: 0 }]}
                onPress={() => navigation.navigate('WelcomeScreen02')}
              >
                Next
              </AppText>
            </LinearGradient>
          </MaskedView>
        </View>
      </View>
    </WelcomeScreenbackgroundgpage>
  );
};

export default OnboardScreen;

const createStyles = (theme, layout) => {
  const { colors, spacing } = theme;
  const { width, height, dottedDiameter, orbitContainerSize, mainAvatarWrapperSize } = layout;

  return StyleSheet.create({
    container: { flex: 1, alignItems: 'center', paddingTop: spacing.sm },

    logo: {
      width: clamp(width * 0.28, 80, 130),
      height: clamp(width * 0.28, 80, 130),
      resizeMode: 'contain',
      marginBottom: clamp(height * 0.1, 40, 100),
    },

    centerWrapper: {
      width: orbitContainerSize,
      height: orbitContainerSize,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },

    orbitContainer: {
      width: orbitContainerSize,
      height: orbitContainerSize,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
    },

    dottedCircle: {
      width: dottedDiameter,
      height: dottedDiameter,
      borderRadius: dottedDiameter / 2,
      borderWidth: 2,
      borderColor: colors.orbitDotted,
      borderStyle: 'dotted',
      position: 'absolute',
      opacity: 0.7,
      zIndex: 1,
    },

    mainAvatar: {
      width: mainAvatarWrapperSize * 0.7,
      height: mainAvatarWrapperSize * 0.7,
      borderRadius: (mainAvatarWrapperSize * 0.7) / 2,
    },

    textContainer: {
      marginTop: clamp(height * 0.08, 40, 100),
      alignItems: 'center',
      paddingHorizontal: clamp(width * 0.08, 20, 48),
    },

    title: { fontFamily: 'Lexend', color: '#111', textAlign: 'center' },
    subtitle: { color: '#111', marginTop: spacing.xxs, textAlign: 'center' },

    bottomWrapper: {
      width: '100%',
      position: 'absolute',
      bottom: clamp(height * 0.045, 24, 44),
      paddingHorizontal: clamp(width * 0.08, 24, 48),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },

    paginationWrapper: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },

    nextButtonWrapper: {
      position: 'absolute',
      right: clamp(width * 0.08, 24, 48),
    },

    nextText: { fontSize: moderateScale(14), color: colors.linkPurple, fontWeight: '600' },

    dot: { width: moderateScale(6), height: moderateScale(6), borderRadius: moderateScale(3) },
    dotActive: { width: moderateScale(18), height: moderateScale(6), borderRadius: moderateScale(3) },

    gradientWrapper: { width: mainAvatarWrapperSize, height: mainAvatarWrapperSize, borderRadius: mainAvatarWrapperSize / 2 },
    gradientBorder: { flex: 1, borderRadius: mainAvatarWrapperSize / 2, padding: 3 },
    innerRing: { flex: 1, borderRadius: (mainAvatarWrapperSize - 6) / 2, alignItems: 'center', justifyContent: 'center' },
  });
};