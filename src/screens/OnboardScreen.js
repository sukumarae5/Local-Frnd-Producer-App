import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreenbackgroundgpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaskedView from '@react-native-masked-view/masked-view';

const rotatingItems = [
  { id: 1, src: require('../assets/boy1.jpg'), type: 'image', size: 40, angle: 0 },
  { id: 2, name: 'call', type: 'icon', size: 26, angle: 60 },
  { id: 3, src: require('../assets/boy3.jpg'), type: 'image', size: 40, angle: 150 },
  { id: 4, src: require('../assets/man.png'), type: 'image', size: 40, angle: 240 },
  { id: 5, name: 'location', type: 'icon', size: 26, angle: 300 },
];

const RADIUS = 120;

const OnboardScreen = ({ navigation }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

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

  const reverseRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

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

  return (
    <WelcomeScreenbackgroundgpage>
      <View style={styles.container}>
        <Image
          source={require('../components/BackgroundPages/main_log1.png')}
          style={styles.logo}
        />

        <View style={styles.centerWrapper}>
          <View style={styles.orbitContainer}>
            <View style={styles.dottedCircle} />

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
                            backgroundColor: '#fff',
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
            style={rippleStyle1}
          />

          <AnimatedGradient
            colors={['#D51BF9', '#8C37F8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={rippleStyle2}
          />

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

        <View style={styles.textContainer}>
          <Text style={styles.title}>It’s easy to find a local_frnd</Text>
          <Text style={styles.subtitle}>nearby & around you</Text>
        </View>

        <View style={styles.bottomWrapper}>
          <View style={styles.paginationWrapper}>
            <LinearGradient
              colors={['#D51BF9', '#8C37F8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.dotActive}
            />

            <LinearGradient
              colors={['#D51BF9', '#8C37F8']}
              style={[styles.dot, { opacity: 0.6 }]}
            />

            <LinearGradient
              colors={['#D51BF9', '#8C37F8']}
              style={[styles.dot, { opacity: 0.6 }]}
            />
          </View>

          <View style={styles.nextButtonWrapper}>
            <MaskedView
              maskElement={
                <Text style={[styles.nextText, { backgroundColor: 'transparent' }]}>
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
                    style={[styles.nextText, { opacity: 0 }]}
                    onPress={() => navigation.navigate('WelcomeScreen02')}
                  >
                    Next
                  </Text>
                </LinearGradient>
              </View>
            </MaskedView>
          </View>
        </View>
      </View>
    </WelcomeScreenbackgroundgpage>
  );
};

export default OnboardScreen;

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
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextButtonWrapper: {
    position: 'absolute',
    right: 30,
  },
  nextText: {
    fontSize: 14,
    color: '#9747FF',
    fontWeight: '600',
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
    padding: 3,
  },
  innerRing: {
    flex: 1,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});