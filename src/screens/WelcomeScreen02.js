import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import WelcomeScreenbackgroundgpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import { Easing } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

const rotatingItems = [
  {
    id: 1,
    type: 'image',
    src: require('../assets/boy1.jpg'),
    size: 40,
    angle: 0,
  },

  { id: 2, type: 'icon', name: 'call', size: 26, angle: 45 },

  {
    id: 3,
    type: 'label',
    text: 'Audio call',
    icon: 'call',
    angle: 88,
    width: 95,
  },

  {
    id: 4,
    type: 'image',
    src: require('../assets/boy3.jpg'),
    size: 40,
    angle: 135,
  },

  { id: 5, type: 'icon', name: 'chatbubble-ellipses', size: 26, angle: 180 },

  { id: 6, type: 'icon', name: 'location', size: 26, angle: 225 },

  // ✅ IMAGE BETWEEN LOCATION & VIDEO
  {
    id: 7,
    type: 'image',
    src: require('../assets/boy4.jpg'),
    size: 40,
    angle: 260,
  },

  // ✅ VIDEO CALL AFTER IMAGE
  {
    id: 8,
    type: 'label',
    text: 'Video Call',
    icon: 'videocam',
    angle: 320,
    width: 100,
  },
];
const RADIUS = 120;

const WelcomeScreen02 = ({ navigation }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  /* 🔄 ROTATION ANIMATION */
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

  const nextfunction = async () => {
    try {
      const token = await AsyncStorage.getItem('twittoke');
      const gender = await AsyncStorage.getItem('gender');

      console.log('🔑 TOKEN FROM STORAGE:', token);
      console.log('⚧ GENDER FROM STORAGE:', gender);

      if (!token || !gender) {
        console.log('❌ No token or gender, going to WelcomeScreen03');
        navigation.replace('WelcomeScreen03');
        return;
      }

      let decoded;
      try {
        decoded = jwtDecode(token);
      } catch (err) {
        console.log('❌ Invalid token, clearing storage');
        await AsyncStorage.clear();
        navigation.replace('WelcomeScreen03');
        return;
      }

      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        console.log('⏰ Token expired, clearing storage');
        await AsyncStorage.clear();
        navigation.replace('WelcomeScreen03');
        return;
      }

      console.log('🟢 Token valid, auto login now');

      if (gender === 'Male') {
        navigation.replace('MaleHomeTabs');
      } else {
        navigation.replace('ReceiverBottomTabs');
      }
    } catch (error) {
      console.log('❌ Auto login error:', error);
      navigation.replace('WelcomeScreen03');
    }
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const reverseRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });
  return (
    <WelcomeScreenbackgroundgpage>
      <View style={styles.container}>
        <Image
          source={require('../components/BackgroundPages/main_log1.png')}
          style={styles.logo}
        />

        <View style={styles.centerWrapper}>
          <View style={styles.dottedCircle} />
          <Animated.View style={{ transform: [{ rotate }] }}>
            {rotatingItems.map(item => {
              const rad = (item.angle * Math.PI) / 180;

              const size = item.size || 40;

              const offsetX =
                item.type === 'label' ? (item.width || 90) / 2 : size / 2;

              const offsetY = size / 2;

              return (
                <Animated.View
                  key={item.id}
                  style={{
                    position: 'absolute',
                    transform: [
                      { translateX: RADIUS * Math.cos(rad) - offsetX },
                      { translateY: RADIUS * Math.sin(rad) - offsetY },
                      { rotate: reverseRotate }, // keeps items straight
                    ],
                  }}
                >
                  {/* ✅ IMAGE */}
                  {item.type === 'image' ? (
                    <LinearGradient
                      colors={['#D51BF9', '#8C37F8']}
                      style={{
                        width: size + 6,
                        height: size + 6,
                        borderRadius: (size + 6) / 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Image
                        source={item.src}
                        style={{
                          width: size,
                          height: size,
                          borderRadius: size / 2,
                        }}
                      />
                    </LinearGradient>
                  ) : item.type === 'icon' ? (
                    /* ✅ ICON (gradient color) */
                    <MaskedView
                      style={{ width: size, height: size }}
                      maskElement={
                        <Ionicons name={item.name} size={size} color="black" />
                      }
                    >
                      <LinearGradient
                        colors={['#D51BF9', '#8C37F8']}
                        style={{ flex: 1 }}
                      />
                    </MaskedView>
                  ) : item.text === 'Audio call' ? (
                    // 🎤 AUDIO CALL → white box + gradient text
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#fff',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        minWidth: item.width || 90,
                        justifyContent: 'center',
                        elevation: 3,
                      }}
                    >
                      <Ionicons name={item.icon} size={14} color="#8C37F8" />

                      <MaskedView
                        maskElement={
                          <Text
                            style={{
                              marginLeft: 5,
                              fontSize: 12,
                              fontWeight: '600',
                            }}
                          >
                            {item.text}
                          </Text>
                        }
                      >
                        <LinearGradient colors={['#D51BF9', '#8C37F8']}>
                          <Text
                            style={{
                              marginLeft: 5,
                              fontSize: 12,
                              fontWeight: '600',
                              opacity: 0,
                            }}
                          >
                            {item.text}
                          </Text>
                        </LinearGradient>
                      </MaskedView>
                    </View>
                  ) : (
                    // 🎥 VIDEO CALL → gradient rectangle
                    <LinearGradient
                      colors={['#D51BF9', '#8C37F8']}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        minWidth: item.width || 100,
                        justifyContent: 'center',
                        elevation: 3,
                      }}
                    >
                      <Ionicons name={item.icon} size={14} color="#fff" />
                      <Text
                        style={{
                          color: '#fff',
                          marginLeft: 5,
                          fontSize: 12,
                          fontWeight: '600',
                        }}
                      >
                        {item.text}
                      </Text>
                    </LinearGradient>
                  )}
                </Animated.View>
              );
            })}
          </Animated.View>
          <MaskedView
            style={{ width: 40, height: 40, transform: [{ translateY: -10 }] }}
            maskElement={<Ionicons name="videocam" size={40} color="black" />}
          >
            <LinearGradient
              colors={['#D51BF9', '#8C37F8']}
              style={{ flex: 1 }}
            />
          </MaskedView>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>You can share chat, and</Text>
          <Text style={styles.title}>video call with your match</Text>
        </View>

        <View style={styles.bottomWrapper}>
          <Text
            style={styles.backText}
            onPress={() => navigation.navigate('OnboardScreen')}
          >
            Back
          </Text>

          <View style={styles.paginationWrapper}>
            {/* inactive dot */}
            <LinearGradient
              colors={['#D51BF9', '#8C37F8']}
              style={[styles.dot, { opacity: 0.6 }]} // faded
            />

            {/* active dot */}
            <LinearGradient
              colors={['#D51BF9', '#8C37F8']}
              style={styles.dotActive}
            />

            {/* inactive dot */}
            <LinearGradient
              colors={['#D51BF9', '#8C37F8']}
              style={[styles.dot, { opacity: 0.6 }]}
            />
          </View>

          {/* 🔥 NEXT BUTTON */}
          <MaskedView maskElement={<Text style={styles.nextText}>Next</Text>}>
            <LinearGradient
              colors={['#D51BF9', '#8C37F8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text
                style={[styles.nextText, { opacity: 0 }]}
                onPress={nextfunction}
              >
                Next
              </Text>
            </LinearGradient>
          </MaskedView>
        </View>
      </View>
    </WelcomeScreenbackgroundgpage>
  );
};

export default WelcomeScreen02;

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
  centerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dottedCircle: {
    marginTop: -30,
    width: 248,
    height: 248,
    borderRadius: 140,
    borderWidth: 2,
    borderColor: '#C78CFF',
    borderStyle: 'dotted',
    position: 'absolute',
    opacity: 0.8,
  },
  videoIcon: {
    width: 40,
    height: 40,
    tintColor: '#BC76FD',
    resizeMode: 'contain',
  },

  textContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
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
  backText: { fontSize: 14, color: '#999', fontWeight: '600' },
  nextText: { fontSize: 14, color: '#9747FF', fontWeight: '600' },
  paginationWrapper: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 6,
    height: 6,
    marginHorizontal: 3,
    borderRadius: 3,
  },
  dotActive: { width: 18, height: 6, borderRadius: 3 },
});
