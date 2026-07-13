import React, { useMemo } from 'react';
import { View, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme';

const WelcomeScreenbackgroungpage = ({ children }) => {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors, width, height), [colors, width, height]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.wrapper}>
        <Image source={require('./Bg.png')} style={styles.topBg} pointerEvents="none" />

        <View style={styles.content}>{children}</View>

        <Image source={require('./Bg1.png')} style={styles.bottomBg} pointerEvents="none" />
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreenbackgroungpage;

const createStyles = (colors, width, height) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    wrapper: {
      flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: colors.background,
    },
    topBg: {
      position: 'absolute',
      top: -80,
      left: -100,
      width: width * 1.8,
      height: height * 0.6,
      resizeMode: 'contain',
      opacity: 0.85,
      zIndex: -1,
    },
    content: {
      flex: 1,
      width: '100%',
    },
    bottomBg: {
      position: 'absolute',
      bottom: -40,
      left: -10,
      width: width * 0.9,
      height: height * 0.45,
      resizeMode: 'contain',
      zIndex: -1,
    },
  });