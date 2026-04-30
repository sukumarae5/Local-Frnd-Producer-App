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

const LOGO_SIZE = 500;

const LandingScreen = ({ navigation }) => {
  const shineAnim = useRef(new Animated.Value(-LOGO_SIZE)).current;

  useEffect(() => {
    startShineEffect();
     handleNavigation();
  }, []);

  const startShineEffect = () => {
    Animated.loop(
      Animated.timing(shineAnim, {
        toValue: LOGO_SIZE,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  };

  const handleNavigation = async () => {
    let nextScreen = 'OnboardScreen';

    try {
      const token = await AsyncStorage.getItem('twittoke');
      const gender = await AsyncStorage.getItem('gender');

      if (token && token !== 'null' && token !== '' && gender) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp > currentTime) {
            nextScreen =
              gender === 'Male' ? 'MaleHomeTabs' : 'ReceiverBottomTabs';
          } else {
            await AsyncStorage.clear();
          }
        } catch (e) {
          await AsyncStorage.clear();
        }
      }
    } catch (error) {
      console.log('Auth Error:', error);
    }

    setTimeout(() => {
      navigation.replace(nextScreen);
    }, 2500);
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
        <View style={styles.logoBox}>
          {/* Original logo - colors unchanged */}
          <Image
            source={require('../components/BackgroundPages/main_log1.png')}
            style={styles.logo}
          />

          {/* Silver light effect clipped only inside logo */}
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
                  transform: [
                    { translateX: shineAnim },
                    { rotate: '18deg' },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={[
                  'transparent',
                  'rgba(255,255,255,0.15)',
                  'rgba(230,230,230,0.85)',
                  'rgba(255,255,255,0.25)',
                  'transparent',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shine}
              />
            </Animated.View>
          </MaskedView>
        </View>
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
    width: 120,
    height: LOGO_SIZE * 1.4,
    position: 'absolute',
    top: -100,
  },

  shine: {
    flex: 1,
  },

  leftHeart: {
    position: 'absolute',
    top: 140,
    width: 80,
    height: 140,
    resizeMode: 'contain',
    opacity: 0.6,
  },

  rightHeart: {
    position: 'absolute',
    top: 30,
    left: 160,
    width: 290,
    height: 230,
    resizeMode: 'contain',
    opacity: 0.6,
  },
});