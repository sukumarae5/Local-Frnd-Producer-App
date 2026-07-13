import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing, Image } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

const AnimatedLogo = ({ style }) => (
  <View style={[styles.center, style]}>
    <Image source={require('../BackgroundPages/log4.png')} style={styles.logo} />
  </View>
);

export default AnimatedLogo;

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    width: moderateScale(300),
    height: moderateScale(300),
    position: 'relative',
  },
  logo: {
    width: moderateScale(110),
    height: moderateScale(110),
    resizeMode: 'contain',
  },
});