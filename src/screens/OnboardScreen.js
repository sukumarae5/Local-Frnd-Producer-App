import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreenbackgroundgpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaskedView from '@react-native-masked-view/masked-view';

/* ===== ROTATING IMAGES ===== */
const rotatingItems = [
  {
    id: 1,
    src: require('../assets/boy1.jpg'),
    type: 'image',
    size: 40,
    angle: 0,
  },
  { id: 2, name: 'call', type: 'icon', size: 26, angle: 60 },
  {
    id: 3,
    src: require('../assets/boy3.jpg'),
    type: 'image',
    size: 40,
    angle: 150,
  },
  {
    id: 4,
    src: require('../assets/man.png'),
    type: 'image',
    size: 40,
    angle: 240,
  },
  { id: 5, name: 'location', type: 'icon', size: 26, angle: 300 },
];
const RADIUS = 120;

const OnboardScreen = ({ navigation }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

  /* ===== ROTATION ===== */
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  /* ===== DOUBLE RIPPLE EFFECT ===== */
  useEffect(() => {
    const animateRipple = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    animateRipple(ripple1, 0);
    animateRipple(ripple2, 500);
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  /* ===== RIPPLE STYLES ===== */
  const rippleStyle1 = {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 85,

    transform: [
      {
        scale: ripple1.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.8],
        }),
      },
    ],
    opacity: ripple1.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 0],
    }),
  };

  const rippleStyle2 = {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 85,
    // backgroundColor: 'rgba(226, 133, 251, 0.3)',
    transform: [
      {
        scale: ripple2.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.8],
        }),
      },
    ],
    opacity: ripple2.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    }),
  };

  const reverseRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  return (
    <WelcomeScreenbackgroundgpage>
      <View style={styles.container}>
        {/* LOGO */}
        <Image
          source={require('../components/BackgroundPages/main_log1.png')}
          style={styles.logo}
        />

        {/* CENTER AREA */}
        <View style={styles.centerWrapper}>
          <View style={styles.orbitContainer}>
            {/* DOTTED ORBIT */}
            <View style={styles.dottedCircle} />

            {/* ROTATING ITEMS */}
            <Animated.View style={{ transform: [{ rotate }] }}>
              {rotatingItems.map(item => {
                const rad = (item.angle * Math.PI) / 180;
                const actualSize = item.type === 'icon' ? 30 : item.size;
                const offset = actualSize / 2;

                return (
                  <Animated.View
                    key={item.id}
                    style={{
                      position: 'absolute',
                      transform: [
                        { translateX: RADIUS * Math.cos(rad) - offset },
                        { translateY: RADIUS * Math.sin(rad) - offset },
                      ],
                    }}
                  >
                    {item.type === 'image' ? (
                      // ✅ IMAGE → with gradient border
                      <LinearGradient
                        colors={['#D51BF9', '#8C37F8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          width: item.size + 6,
                          height: item.size + 6,
                          borderRadius: (item.size + 6) / 2,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <View
                          style={{
                            width: item.size,
                            height: item.size,
                            borderRadius: item.size / 2,
                            overflow: 'hidden',
                            backgroundColor: '#fff', // 🔥 IMPORTANT (creates ring effect)
                          }}
                        >
                          <Animated.View
                            style={{
                              flex: 1,
                              transform: [{ rotate: reverseRotate }],
                            }}
                          >
                            <Image
                              source={item.src}
                              style={{
                                width: '100%',
                                height: '100%',
                              }}
                            />
                          </Animated.View>
                        </View>
                      </LinearGradient>
                    ) : (
                      // ✅ ICON → NO border, NO background
                      <Animated.View
                        style={{
                          width: actualSize,
                          height: actualSize,
                          justifyContent: 'center',
                          alignItems: 'center',
                          transform: [{ rotate: reverseRotate }],
                        }}
                      >
                        <Ionicons
                          name={item.name}
                          size={actualSize}
                          color="#A855F7"
                        />
                      </Animated.View>
                    )}
                  </Animated.View>
                );
              })}
            </Animated.View>
          </View>

          <AnimatedGradient
            colors={['#D51BF9', '#8C37F8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[rippleStyle1]}
          />

          <AnimatedGradient
            colors={['#D51BF9', '#8C37F8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[rippleStyle2]}
          />
          {/* CENTER AVATAR */}
          <View style={styles.gradientWrapper}>
            <LinearGradient
              colors={['#D51BF9', '#8C37F8']}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBorder}
            >
              <View style={styles.innerRing}>
                <Image
                  source={require('../assets/girl1.jpg')}
                  style={styles.mainAvatar}
                />
              </View>
            </LinearGradient>
          </View>
        </View>
        {/* TEXT */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>It’s easy to find a local_frnd</Text>
          <Text style={styles.subtitle}>nearby & around you</Text>
        </View>

        {/* BOTTOM PAGINATION */}
        <View style={styles.bottomWrapper}>
          <Text style={styles.backText} onPress={() => navigation.goBack()}>
            Back
          </Text>
          <View style={styles.paginationWrapper}>
            {/* ACTIVE DOT */}
            <LinearGradient
              colors={['#D51BF9', '#8C37F8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.dotActive}
            />

            {/* INACTIVE DOT */}
            <LinearGradient
              colors={['#D51BF9', '#8C37F8']}
              style={[styles.dot, { opacity: 0.6 }]} // 👈 faded look
            />

            {/* INACTIVE DOT */}
            <LinearGradient
              colors={['#D51BF9', '#8C37F8']}
              style={[styles.dot, { opacity: 0.6 }]}
            />
          </View>
          <MaskedView
            maskElement={
              <Text
                style={[styles.nextText, { backgroundColor: 'transparent' }]}
              >
                Next
              </Text>
            }
          >
                  <View style={{ flex: 1, backgroundColor: '#E9C9FF' }}>
            
            <LinearGradient
              colors={['#D51BF9', '#8C37F8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text
                style={[
                  styles.nextText,
                  { opacity: 0 }, // 🔥 hide actual text, show gradient
                ]}
                onPress={() => navigation.navigate('WelcomeScreen02')}
              >
                Next
              </Text>
            </LinearGradient>
            </View>
          </MaskedView>
        </View>
      </View>
    </WelcomeScreenbackgroundgpage>
  );
};

export default OnboardScreen;

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
  },
  logo: {
   
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 100,
  },
  centerWrapper: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orbitContainer: {
    width: RADIUS * 2 + 40,
    height: RADIUS * 2 + 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },

  dottedOrbit: {
    position: 'absolute',
    width: RADIUS * 2,
    height: RADIUS * 2,
    borderRadius: RADIUS,
    borderWidth: 2,
    borderColor: '#C78CFF',
    borderStyle: 'dotted', // ⭐ THIS creates the dotted line
    opacity: 0.8,
  },

  dottedCircle: {
    width: 248,
    height: 248,
    borderRadius: 140,
    borderWidth: 2,
    borderColor: '#C78CFF',
    borderStyle: 'dotted',
    position: 'absolute',
    opacity: 0.7,
  },

  mainAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  textContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Lexend',
    fontStyle: 'semi-bold',
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginTop: 4,
  },
  bottomWrapper: {
    width: '100%',
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  nextText: {
    fontSize: 14,
    color: '#9747FF',
    fontWeight: '600',
  },
  paginationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
  },
  gradientWrapper: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },

  gradientBorder: {
    flex: 1,
    borderRadius: 65,
    padding: 3, // 🔥 THIS creates border thickness
  },

  innerRing: {
    flex: 1, // 🔥 IMPORTANT
    borderRadius: 60,

    alignItems: 'center',
    justifyContent: 'center',
  },
});
