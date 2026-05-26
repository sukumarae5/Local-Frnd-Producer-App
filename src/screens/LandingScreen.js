import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  Animated,
  Easing,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { InteractionManager } from 'react-native';

const LOGO_SIZE = 500;
const SPLASH_TIME = 2500;

const LandingScreen = ({ navigation }) => {
  const shineAnim = useRef(new Animated.Value(-LOGO_SIZE)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const loopRef = useRef(null);

  useEffect(() => {
    startIntroAnimation();
    startShineEffect();
    // handleNavigation();

    return () => {
      loopRef.current?.stop();
    };
  }, []);

  const startIntroAnimation = () => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start(() => {
      handleNavigation(); // ✅ call AFTER animation finishes
    });
  };

  const startShineEffect = () => {
    shineAnim.setValue(-LOGO_SIZE);

    loopRef.current = Animated.loop(
      Animated.timing(shineAnim, {
        toValue: LOGO_SIZE,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { resetBeforeIteration: true },
    );

    loopRef.current.start();
  };

  const handleNavigation = async () => {
    let nextScreen = 'OnboardScreen';

    try {
      const token = await AsyncStorage.getItem('twittoke');
      const gender = await AsyncStorage.getItem('gender');

      if (token && token !== 'null' && token !== '') {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp && decoded.exp > currentTime) {
            if (!gender) {
              nextScreen = 'OnboardScreen';
            } else if (gender.toLowerCase() === 'male') {
              nextScreen = 'MaleHomeTabs';
            } else if (gender.toLowerCase() === 'female') {
              nextScreen = 'ReceiverBottomTabs';
            }
          } else {
            await AsyncStorage.clear();
          }
        } catch (e) {
          await AsyncStorage.clear();
        }
      }
    } catch (error) {}

    // ✅ ADD DELAY HERE
    await new Promise(resolve => setTimeout(resolve, SPLASH_TIME));

    // ✅ SMOOTH NAVIGATION
    InteractionManager.runAfterInteractions(() => {
      navigation.replace(nextScreen);
    });
  };

  return (
    <ImageBackground
      source={require('../components/BackgroundPages/backgroundimage.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <Image
        source={require('../assets/leftheart.png')}
        style={styles.leftHeart}
      />

      <Image
        source={require('../assets/rightheart.png')}
        style={styles.rightHeart}
      />

      <View style={styles.container}>
        <Animated.View
          style={[
            styles.logoBox,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../components/BackgroundPages/main_log1.png')}
            style={styles.logo}
          />

          <MaskedView
            style={styles.maskLayer}
            maskElement={
              <Image
                source={require('../components/BackgroundPages/main_log1.png')}
                style={styles.logo}
              />
            }
          >
            <Animated.View
              style={[
                styles.shineWrapper,
                {
                  transform: [{ translateX: shineAnim }, { rotate: '18deg' }],
                },
              ]}
            >
              <LinearGradient
                colors={[
                  'transparent',
                  'rgba(255,255,255,0.05)',
                  'rgba(255,255,255,0.95)',
                  'rgba(255,255,255,0.25)',
                  'transparent',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shine}
              />
            </Animated.View>
          </MaskedView>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

export default LandingScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoBox: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    resizeMode: 'contain',
  },

  maskLayer: {
    position: 'absolute',
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    top: 0,
    left: 0,
  },

  shineWrapper: {
    width: 140,
    height: LOGO_SIZE * 1.5,
    position: 'absolute',
    top: -120,
  },

  shine: {
    flex: 1,
  },

  leftHeart: {
    position: 'absolute',
    top: 150,
    left: -40,
    resizeMode: 'contain',
    opacity: 0.3,
  },

  rightHeart: {
    position: 'absolute',
    top: 45,
    right: -100,
    resizeMode: 'contain',
    opacity: 0.3,
  },
});
