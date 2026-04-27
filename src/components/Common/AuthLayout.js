import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const GradientHeart = ({ size, style, rotate = '0deg' }) => {
  return (
    <MaskedView
      style={[{ width: size, height: size }, style]}
      renderToHardwareTextureAndroid
      shouldRasterizeIOS
      maskElement={
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Icon name="heart" size={size} color="#fff" />
        </View>
      }
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.6)', 'rgba(168,85,247,0.25)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          width: size,
          height: size,
          transform: [{ rotate }],
        }}
      />
    </MaskedView>
  );
};

const AuthLayout = ({ children, showBack = false, onBack }) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* TOP BACKGROUND */}
        <View style={styles.topWrapper}>
          {/* ✅ BACK BUTTON */}
          {showBack && (
            <TouchableOpacity
              style={[styles.backButton, { top: insets.top + 10 }]}
              onPress={onBack}
            >
              <Icon name="chevron-back" size={26} color="#000" />
            </TouchableOpacity>
          )}

          {/* BACKGROUND */}
          <LinearGradient
            colors={['#F3D1FF', '#E9C9FF', '#F8D4F4']}
            style={{ flex: 1 }}
          >
            <GradientHeart size={150} rotate="-20deg" style={styles.leftIcon} />
            <GradientHeart size={250} rotate="20deg" style={styles.rightIcon} />
          </LinearGradient>

          {/* CURVE */}
          <Svg width={width} height={160} style={styles.curve}>
            <Path
              d={`
                M0 150
                C ${width * 0.2} 20, ${width * 0.8} 220, ${width} 90
                L ${width} 160
                L 0 160
                Z
              `}
              fill="#fff"
            />
          </Svg>

          {/* LOGO */}
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../components/BackgroundPages/main_log1.png')}
              style={styles.logo}
            />
          </View>
        </View>

        {/* CONTENT */}
        <View style={styles.content}>{children}</View>
      </View>
    </SafeAreaView>
  );
};

export default AuthLayout;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3D1FF',
  },

  container: {
    flex: 1,
    backgroundColor: '#F3D1FF',
  },

  backButton: {
    position: 'absolute',
    left: 15,
    zIndex: 999,
    elevation: 999,
    backgroundColor: '#b41313', // 👈 makes it visible
    padding: 8,
    borderRadius: 20,
  },

  topWrapper: {
    width: '100%',
    height: height * 0.35,
  },

  topPurple: {
    flex: 1,
    backgroundColor: '#F3D1FF',
    overflow: 'hidden',
  },

  leftIcon: {
    position: 'absolute',
    top: height * 0.15,
    left: -width * 0.1,
  },

  rightIcon: {
    position: 'absolute',
    top: height * 0.05,
    right: -width * 0.2,
  },

  logoWrapper: {
    position: 'absolute',

    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },

  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },

  curve: {
    position: 'absolute',
    bottom: -1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
});
