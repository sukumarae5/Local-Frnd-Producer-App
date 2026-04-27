import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LandingScreen = ({ navigation }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const sparkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    handleNavigation();

    setTimeout(() => {
      runAnimation();
    }, 100); // small delay fixes rendering timing
  }, []);

  const runAnimation = () => {
    sparkle.setValue(0);

    Animated.sequence([
      // 🔥 Circular shine rotation
      Animated.timing(rotateAnim, {
        toValue: 100,
        duration: 3200,
        useNativeDriver: true,
      }),

      // ✨ Spark
      Animated.timing(sparkle, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      Animated.timing(sparkle, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      rotateAnim.setValue(0);
      runAnimation();
    });
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

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
    >
      {/* LEFT HEART */}
     <MaskedView
  style={styles.leftHeart}
  maskElement={
    <Ionicons name="heart" size={130} color="black" />
  }
>
        <View style={{ flex: 1, backgroundColor: '#E9C9FF' }}>
  
  <LinearGradient
    colors={[
      "rgba(139, 66, 207, 0.5)",
      "rgba(81, 34, 126, 0.15)"
    ]}
    start={{ x: 0.5, y: 0 }}   // top
    end={{ x: 0.5, y: 1 }}     // bottom
    style={{ width: 130, height: 130 }}
  />
  </View>
</MaskedView>

      {/* RIGHT HEART */}
      <MaskedView
  style={styles.rightHeart}
  maskElement={
    <Ionicons name="heart" size={250} color="black" />
  }
>
        <View style={{ flex: 1, backgroundColor: '#E9C9FF' }}>
  
  <LinearGradient
    colors={[
      "rgba(201, 18, 201, 0.5)",
      "rgba(83, 20, 143, 0.15)"
    ]}
    start={{ x: 0.5, y: 0 }}
    end={{ x: 0.5, y: 1 }}
    style={{ width: 250, height: 250 }}
  />
  </View>
</MaskedView>

      <View style={styles.container}>
        <View style={styles.logoWrapper}>
          {/* ✅ Logo */}
          <Image
            source={require('../components/BackgroundPages/main_log1.png')}
            style={styles.logo}
          />

          {/* 🔥 Curved Edge Shine */}
          <MaskedView
            style={StyleSheet.absoluteFill}
            maskElement={
              <Image
                source={require('../components/BackgroundPages/main_log1.png')}
                style={styles.logo}
              />
            }
          >
            <Animated.View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                transform: [{ rotate }],
              }}
            >
              <LinearGradient
                colors={[
                  'transparent',
                  'rgba(255,255,255,0.1)',
                  'rgba(255, 255, 255, 0.9)', // 🔥 sharp highlight
                  'rgba(255,255,255,0.1)',
                  'transparent',
                ]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.arcShine}
              />
            </Animated.View>
          </MaskedView>

          {/* ✨ Spark */}
          <Animated.View
            style={[
              styles.sparkle,
              {
                opacity: sparkle,
                transform: [
                  {
                    scale: sparkle.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1.3],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.sparkCore} />
            <View style={styles.sparkLineHorizontal} />
            <View style={styles.sparkLineVertical} />
          </Animated.View>
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
    zIndex: 1,
  },

  logoWrapper: {
    width: 500,
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  arcShine: {
    width: 50, // 🔥 thin curved highlight
    height: 500,
    borderRadius: 250,
  },

  leftHeart: {
    position: 'absolute',
    top: 150, // move partially outside
    left: -40,
    resizeMode: 'contain',
    opacity: 0.3, // 🔥 very light
  },

  rightHeart: {
    position: 'absolute',
    top: 45, // move partially outside
    right: -100,

    resizeMode: 'contain',
    opacity: 0.3,
  },
  sparkle: {
    position: 'absolute',
    bottom: 110,
    right: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sparkCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#fff',
    shadowOpacity: 1,
    shadowRadius: 8,
  },

  sparkLineHorizontal: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: '#FFFFFF',
  },

  sparkLineVertical: {
    position: 'absolute',
    height: 20,
    width: 2,
    backgroundColor: '#FFFFFF',
  },
});
