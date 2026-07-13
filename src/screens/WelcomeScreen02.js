import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, Image, Animated, Easing, useWindowDimensions } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import WelcomeScreenbackgroundgpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const rotatingItems = [
  { id: 1, type: 'image', src: require('../assets/boy1.jpg'), size: 40, angle: 0 },
  { id: 2, type: 'icon', name: 'call', size: 26, angle: 45 },
  { id: 3, type: 'label', text: 'Audio call', icon: 'call', angle: 88, width: 95 },
  { id: 4, type: 'image', src: require('../assets/boy3.jpg'), size: 40, angle: 135 },
  { id: 5, type: 'icon', name: 'chatbubble-ellipses', size: 26, angle: 180 },
  { id: 6, type: 'icon', name: 'location', size: 26, angle: 225 },
  { id: 7, type: 'image', src: require('../assets/boy4.jpg'), size: 40, angle: 260 },
  { id: 8, type: 'label', text: 'Video Call', icon: 'videocam', angle: 320, width: 100 },
];

// Keep a value within [min, max]
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const WelcomeScreen02 = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { colors, spacing } = theme;
  const { width, height } = useWindowDimensions();

  // --- Responsive geometry -------------------------------------------------
  const shortSide = Math.min(width, height);

  // Orbit radius: ~30% of the short side, clamped for tiny phones / tablets.
  // circleScale lets you grow/shrink the WHOLE circle (dotted line + orbit
  // path) as one unit — since dottedDiameter and every item's translateX/Y
  // both derive from this same RADIUS, they can never drift apart. 1 = as
  // before; >1 = bigger circle; <1 = smaller circle.
  const circleScale = 1.15;
  const RADIUS = clamp(shortSide * 0.3, 85, 140) * circleScale;

  // Orbiting item (avatar/icon/label) size scales gently with the radius.
  const orbitItemScale = clamp(RADIUS / 120, 0.75, 1.25);

  // Dotted ring radius must exactly match the orbit path radius (RADIUS)
  // so the items sit ON the dotted line, not inside or outside it.
  const dottedDiameter = RADIUS * 2;
  // orbitContainer and centerWrapper share the same size (matches
  // OnboardScreen pattern) so the dotted circle + rotating items are
  // centered identically to the rest of the center content, while still
  // being an independent absolutely-positioned layer we can nudge on its
  // own without moving the static videocam icon.
  const orbitContainerSize = dottedDiameter + moderateScale(60) * orbitItemScale;

  // Keep orbitContainer perfectly aligned/overlapping with centerWrapper
  // (both same size, same center) so the dotted circle sits exactly where
  // centerWrapper is centered. The videocam icon is nested inside
  // orbitContainer, so it stays dead-center in the circle automatically.
  // Change this only if you intentionally want the circle+avatars nudged
  // away from centerWrapper's center (negative = up, positive = down).
  const orbitVerticalOffset = 0;

  // Moves ONLY the rotating avatars/icons/pills — NOT the dotted circle and
  // NOT the center video icon. Applied directly to the rotating Animated.View
  // (as a translateY before the rotate transform), so the whole avatar orbit
  // recenters lower/higher and keeps spinning around its new center, while
  // the dotted line and center icon stay exactly where they were.
  // Negative = up, positive = down.
  const avatarsVerticalOffset = 15;

  const styles = useMemo(
    () =>
      createStyles(theme, {
        width,
        height,
        dottedDiameter,
        orbitContainerSize,
        orbitVerticalOffset,
      }),
    [theme, width, height, dottedDiameter, orbitContainerSize, orbitVerticalOffset]
  );

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 30000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  // --- Precise on-circle centering -----------------------------------------
  // Root cause of items (esp. the "Video Call" pill) drifting off the dotted
  // line: their centering offset was a GUESSED size (moderateScale(width) *
  // orbitItemScale), not the pill's true rendered size. Guessed sizes and
  // real sizes only match by coincidence — any change to scale factors,
  // fonts, or padding breaks the guess again.
  // Fix: measure every item's real box with onLayout and center using that
  // real width/height. This makes every item mathematically locked to
  // RADIUS regardless of content size or future scale tweaks.
  const [itemSizes, setItemSizes] = useState({});

  const handleItemLayout = useCallback((id, event) => {
    const { width: w, height: h } = event.nativeEvent.layout;
    setItemSizes((prev) => {
      const existing = prev[id];
      // Avoid redundant state updates (onLayout can fire repeatedly with the
      // same value) which would otherwise cause unnecessary re-renders.
      if (existing && Math.round(existing.width) === Math.round(w) && Math.round(existing.height) === Math.round(h)) {
        return prev;
      }
      return { ...prev, [id]: { width: w, height: h } };
    });
  }, []);

  const nextfunction = async () => {
    try {
      const token = await AsyncStorage.getItem('twittoke');
      const gender = await AsyncStorage.getItem('gender');

      if (!token || !gender) {
        navigation.replace('WelcomeScreen03');
        return;
      }

      let decoded;
      try {
        decoded = jwtDecode(token);
      } catch (err) {
        await AsyncStorage.clear();
        navigation.replace('WelcomeScreen03');
        return;
      }

      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        await AsyncStorage.clear();
        navigation.replace('WelcomeScreen03');
        return;
      }

      const step = await AsyncStorage.getItem('onboarding_step');

      if (!gender) {
        navigation.replace('SelectYourCountryScreen');
        return;
      }

      if (step) {
        navigation.replace('SelectYourCountryScreen');
        return;
      }

      if (gender === 'Male') {
        navigation.replace('MaleHomeTabs');
      } else if (gender === 'Female') {
        navigation.replace('FemaleHomeTabs');
      } else {
        navigation.replace('SelectYourCountryScreen');
      }
    } catch (error) {
      navigation.replace('WelcomeScreen03');
    }
  };

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const reverseRotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });

  return (
    <WelcomeScreenbackgroundgpage>
      <View style={styles.container}>
        <Image source={require('../components/BackgroundPages/main_log1.png')} style={styles.logo} />

        <View style={styles.centerWrapper}>
          <View style={styles.orbitContainer}>
            <View style={styles.dottedCircle} />

            <Animated.View style={{ transform: [{ translateY: avatarsVerticalOffset }, { rotate }], zIndex: 2, elevation: 2 }}>
              {rotatingItems.map((item) => {
                const rad = (item.angle * Math.PI) / 180;
                const size = moderateScale(item.size || 40) * orbitItemScale;
                const labelWidth = item.width ? moderateScale(item.width) * orbitItemScale : moderateScale(90) * orbitItemScale;
                // Pills are taller than the raw icon size (icon + padding), so
                // use a dedicated height for centering them on the circle —
                // reusing `size` here would offset the pill off the line.
                const labelHeight = moderateScale(36) * orbitItemScale;

                // Fallback estimate used only until onLayout reports the real
                // size (first render / before measurement). Once measured,
                // the real width/height always wins — this is what keeps
                // every item exactly on the circle no matter how the pill's
                // actual content renders.
                const fallbackWidth = item.type === 'label' ? labelWidth : size;
                const fallbackHeight = item.type === 'label' ? labelHeight : size;
                const measured = itemSizes[item.id];
                const realWidth = measured ? measured.width : fallbackWidth;
                const realHeight = measured ? measured.height : fallbackHeight;
                const offsetX = realWidth / 2;
                const offsetY = realHeight / 2;

                return (
                  <Animated.View
                    key={item.id}
                    style={{
                      position: 'absolute',
                      zIndex: 2,
                      transform: [
                        { translateX: RADIUS * Math.cos(rad) - offsetX },
                        { translateY: RADIUS * Math.sin(rad) - offsetY },
                        { rotate: reverseRotate },
                      ],
                    }}
                  >
                    <View onLayout={(e) => handleItemLayout(item.id, e)}>
                    {item.type === 'image' ? (
                      <LinearGradient
                        colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
                        style={{
                          width: size + 6,
                          height: size + 6,
                          borderRadius: (size + 6) / 2,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Image source={item.src} style={{ width: size, height: size, borderRadius: size / 2 }} />
                      </LinearGradient>
                    ) : item.type === 'icon' ? (
                      <MaskedView style={{ width: size, height: size }} maskElement={<Ionicons name={item.name} size={size} color="black" />}>
                        <LinearGradient colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]} style={{ flex: 1 }} />
                      </MaskedView>
                    ) : item.text === 'Audio call' ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: '#fff',
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.xs,
                          borderRadius: moderateScale(16),
                          minWidth: labelWidth,
                          justifyContent: 'center',
                          elevation: 3,
                        }}
                      >
                        <Ionicons name={item.icon} size={moderateScale(14)} color={colors.gradientPurpleEnd} />
                        <MaskedView
                          maskElement={
                            <AppText variant="caption" style={{ marginLeft: spacing.xxs, fontWeight: '600' }}>{item.text}</AppText>
                          }
                        >
                          <LinearGradient colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}>
                            <AppText variant="caption" style={{ marginLeft: spacing.xxs, fontWeight: '600', opacity: 0 }}>
                              {item.text}
                            </AppText>
                          </LinearGradient>
                        </MaskedView>
                      </View>
                    ) : (
                      <LinearGradient
                        colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.xs,
                          borderRadius: moderateScale(16),
                          minWidth: labelWidth,
                          justifyContent: 'center',
                          elevation: 3,
                        }}
                      >
                        <Ionicons name={item.icon} size={moderateScale(14)} color="#fff" />
                        <AppText variant="caption" style={{ color: '#fff', marginLeft: spacing.xxs, fontWeight: '600' }}>
                          {item.text}
                        </AppText>
                      </LinearGradient>
                    )}
                    </View>
                  </Animated.View>
                );
              })}
            </Animated.View>

            {/* Centered inside orbitContainer (not centerWrapper) so it sits
                exactly in the middle of the dotted circle and moves together
                with it — no manual offset needed, alignItems/justifyContent
                on orbitContainer handles the centering. */}
            <MaskedView
              style={{
                width: moderateScale(40) * orbitItemScale,
                height: moderateScale(40) * orbitItemScale,
                zIndex: 3,
              }}
              maskElement={<Ionicons name="videocam" size={moderateScale(40) * orbitItemScale} color="black" />}
            >
              <LinearGradient colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]} style={{ flex: 1 }} />
            </MaskedView>
          </View>
        </View>

        <View style={styles.textContainer}>
          <AppText variant="h3" style={styles.title}>You can share chat, and</AppText>
          <AppText variant="h3" style={styles.title}>video call with your match</AppText>
        </View>
      </View>

      <View style={styles.bottomWrapper}>
        <AppText variant="bodySmall" style={styles.backText} onPress={() => navigation.navigate('OnboardScreen')}>
          Back
        </AppText>

        <View style={styles.paginationWrapper}>
          <LinearGradient colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]} style={[styles.dot, { opacity: 0.6 }]} />
          <LinearGradient colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]} style={styles.dotActive} />
          <LinearGradient colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]} style={[styles.dot, { opacity: 0.6 }]} />
        </View>

        <MaskedView maskElement={<AppText variant="bodySmall" style={styles.nextText}>Next</AppText>}>
          <LinearGradient colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <AppText variant="bodySmall" style={[styles.nextText, { opacity: 0 }]} onPress={nextfunction}>
              Next
            </AppText>
          </LinearGradient>
        </MaskedView>
      </View>
    </WelcomeScreenbackgroundgpage>
  );
};

export default WelcomeScreen02;

const createStyles = (theme, layout) => {
  const { colors, spacing } = theme;
  const { width, height, dottedDiameter, orbitContainerSize, orbitVerticalOffset } = layout;

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
      transform: [{ translateY: orbitVerticalOffset }],
    },

    dottedCircle: {
      width: dottedDiameter,
      height: dottedDiameter,
      borderRadius: dottedDiameter / 2,
      borderWidth: 2,
      borderColor: colors.orbitDotted,
      borderStyle: 'dotted',
      position: 'absolute',
      opacity: 0.8,
      zIndex: 1,
    },

    textContainer: {
      marginTop: clamp(height * 0.08, 40, 100),
      alignItems: 'center',
      paddingHorizontal: clamp(width * 0.08, 20, 48),
    },

    title: { color: '#111', textAlign: 'center' },

    bottomWrapper: {
      width: '100%',
      position: 'absolute',
      bottom: clamp(height * 0.045, 24, 44),
      paddingHorizontal: clamp(width * 0.08, 24, 48),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    backText: { color: '#999', fontWeight: '600' },
    nextText: { color: colors.linkPurple, fontWeight: '600' },
    paginationWrapper: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: moderateScale(6), height: moderateScale(6), marginHorizontal: spacing.xxs, borderRadius: moderateScale(3) },
    dotActive: { width: moderateScale(18), height: moderateScale(6), borderRadius: moderateScale(3) },
  });
};