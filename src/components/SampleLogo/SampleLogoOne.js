import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

const SampleLogoOne = ({ style }) => (
  <View style={[styles.logoContainer, style]}>
    <View style={styles.logoOuter}>
      <View style={styles.logoInner}>
        <Text style={styles.logoText}>LσH</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoOuter: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#A723F2',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#250d35ff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.7,
        shadowRadius: 18,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  logoInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#A723F2',
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  },
});

export default SampleLogoOne;
