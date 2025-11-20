import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const BackgroundPagesOne = ({ children }) => (
  <LinearGradient
    colors={[
      '#11020fff', '#170417ff', '#150215ff', '#130614ff',
      '#120812ff', '#1b051bff', '#1b021bff', '#1b071dff',
      '#440a44ff', '#4a0f4aff'
    ]}
    locations={[0, 0.12, 0.24, 0.36, 0.48, 0.60, 0.70, 0.77, 0.90, 1]}
    start={{ x: 0.5, y: 0 }}
    end={{ x: 0.5, y: 1 }}
    style={styles.gradient}
  >
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

export default BackgroundPagesOne;
