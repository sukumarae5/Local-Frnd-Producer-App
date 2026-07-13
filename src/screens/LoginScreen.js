import React, { useMemo } from 'react';
import { View, TouchableOpacity, StatusBar, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BackgroundPagesOne from '../components/BackgroundPages/BackgroundPagesOne';
import AnimatedLogo from '../components/SampleLogo/AnimatedLogo';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const LoginScreen = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const { height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, height), [theme, height]);

  return (
    <BackgroundPagesOne>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <AnimatedLogo style={styles.animatedLogo} />

          <View style={styles.centerContent}>
            <View style={styles.midcontent}>
              <AppText variant="h1" style={styles.title}>Get Started</AppText>

              <AppText variant="body" style={styles.subtitle}>
                By tapping <AppText variant="body" style={{ fontWeight: 'bold', color: '#fff' }}>Log In</AppText>, you agree to our
              </AppText>

              <TouchableOpacity>
                <AppText variant="body" style={styles.link}>Terms & Privacy Policy</AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Phone')}>
                <Icon name="phone" size={moderateScale(22)} color="#fff" style={styles.icon} />
                <AppText variant="subtitle" style={styles.buttonText}>Log in with Phone number</AppText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity>
              <AppText variant="bodySmall" style={styles.troubleLink}>Trouble Logging In?</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </BackgroundPagesOne>
  );
};

export default LoginScreen;

const createStyles = (theme, height) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    safeArea: { flex: 1 },

    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: Platform.OS === 'android' ? height * 0.06 : height * 0.02,
    },

    animatedLogo: {
      marginTop: -height * 0.07,
      marginBottom: spacing.sm,
    },

    midcontent: {
      marginTop: -height * 0.03,
      marginBottom: height * 0.05,
      alignItems: 'center',
    },

    centerContent: {
      width: '88%',
      alignItems: 'center',
    },

    title: {
      marginTop: -height * 0.04,
      color: '#fff',
      textAlign: 'center',
      marginBottom: spacing.sm,
    },

    subtitle: {
      color: '#fff',
      textAlign: 'center',
      marginBottom: spacing.xxs,
    },

    link: {
      color: '#fff',
      textDecorationLine: 'underline',
      fontWeight: '500',
      textAlign: 'center',
      marginBottom: spacing.xxl,
      marginTop: spacing.xxs,
    },

    buttonGroup: {
      width: '100%',
      marginBottom: spacing.xxl,
    },

    button: {
      marginTop: height * 0.03,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: colors.vividPurple,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      backgroundColor: 'rgba(0,0,0,0.30)', // sits directly on the fixed dark gradient hero — one-off, not theme-driven
    },

    icon: { marginRight: spacing.md },

    buttonText: { color: '#fff' },

    troubleLink: {
      color: '#fff',
      textDecorationLine: 'underline',
      textAlign: 'center',
      fontWeight: '500',
      marginTop: spacing.xxs,
    },
  });
};