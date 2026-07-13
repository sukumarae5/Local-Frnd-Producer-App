import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import { userOtpRequest, userResendOtpRequest } from '../features/Auth/authAction';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthLayout from '../components/Common/AuthLayout';
import ContinueButton from '../components/Common/ContinueButton';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const OTP_LENGTH = 6;

const OtpScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { Otp } = useSelector((state) => state.auth);
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const mobile_number = route?.params?.mobile_number;
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const mode = route?.params?.mode;
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (!mobile_number) {
      Alert.alert('Error', 'Mobile number missing');
      navigation.goBack();
    }
  }, []);

  const handleChange = (text, idx) => {
    const char = text ? text.slice(-1) : '';
    const newOtp = [...otp];
    newOtp[idx] = char;
    setOtp(newOtp);

    if (char && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus?.();
    }
  };

  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus?.();
    }
  };

  const handleOtpSubmit = () => {
    if (!mobile_number) {
      Alert.alert('Error', 'Mobile number missing');
      return;
    }

    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) {
      Alert.alert('Error', 'Please enter 6 digit OTP');
      return;
    }

    dispatch(userOtpRequest({ mobile_number, otp: otpString }));
  };

  useEffect(() => {
    if (!Otp) return;

    if (Otp.success === false) {
      Alert.alert('Invalid OTP', Otp.message || 'Try again');
      return;
    }

    if (!Otp.success) return;

    const handleSuccess = async () => {
      try {
        await AsyncStorage.setItem('twittoke', Otp.token ?? '');
        await AsyncStorage.setItem('user_id', String(Otp.user?.user_id ?? ''));

        const gender = Otp.user?.gender ?? '';
        await AsyncStorage.setItem('gender', gender);

        if (!gender) {
          await AsyncStorage.setItem('onboarding_step', 'start');
        } else {
          await AsyncStorage.removeItem('onboarding_step');
        }

        const savedToken = await AsyncStorage.getItem('twittoke');

        if (!savedToken) {
          Alert.alert('Error', 'Login failed. Please try again.');
          return;
        }

        const normalizedGender = gender?.toLowerCase();
        let routeName = '';

        if (mode === 'login') {
          if (normalizedGender === 'male') {
            routeName = 'MaleHomeTabs';
          } else if (normalizedGender === 'female') {
            routeName = 'ReceiverBottomTabs';
          } else {
            routeName = 'SelectYourCountryScreen';
          }
        } else {
          routeName = 'SelectYourCountryScreen';
        }

        navigation.reset({
          index: 0,
          routes: [{ name: routeName }],
        });
      } catch (err) {
        console.error('❌ OTP FLOW ERROR:', err);
        Alert.alert('Error', 'Something went wrong');
      }
    };

    handleSuccess();
  }, [Otp]);

  const handleResend = () => {
    if (!canResend) return;

    dispatch(userResendOtpRequest({ mobile_number }));

    setTimer(120);
    setCanResend(false);
  };

  return (
    <AuthLayout>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.bottomSection}>
            <AppText variant="h3" style={styles.title}>Verification OTP</AppText>
            <AppText variant="bodySmall" style={styles.subtitle}>OTP sent on your mobile Number</AppText>

            <View style={styles.otpWrapper}>
              <View style={styles.otpContainer}>
                {otp.map((v, idx) => (
                  <View key={idx} style={styles.otpBox}>
                    <TextInput
                      ref={(el) => (inputRefs.current[idx] = el)}
                      style={styles.otpInput}
                      maxLength={1}
                      keyboardType="numeric"
                      value={v}
                      onChangeText={(t) => handleChange(t, idx)}
                      onKeyPress={(e) => handleKeyPress(e, idx)}
                    />

                    <LinearGradient
                      colors={v ? [colors.gradientPurpleStart, colors.gradientPurpleEnd] : ['#E3D8FF', colors.gradientPurpleEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.underline}
                    />
                  </View>
                ))}
              </View>
            </View>

            {!canResend ? (
              <AppText variant="caption" style={styles.resendText}>
                Resend in {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
              </AppText>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <MaskedView maskElement={<AppText variant="caption" style={styles.resendText}>Resend OTP</AppText>}>
                  <LinearGradient colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <AppText variant="caption" style={[styles.resendText, { opacity: 0 }]}>Resend OTP</AppText>
                  </LinearGradient>
                </MaskedView>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        <View style={styles.bottomFixed}>
          <ContinueButton onPress={handleOtpSubmit} />
        </View>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
};

export default OtpScreen;

const createStyles = (theme) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    flex: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingBottom: moderateScale(120) },

    bottomSection: {
      flex: 1,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
    },

    title: { color: '#161616', textAlign: 'center', marginTop: spacing.xs },

    subtitle: { color: '#777', textAlign: 'center', marginTop: spacing.xxs, marginBottom: spacing.md },

    otpWrapper: { marginTop: spacing.sm },
    otpContainer: { flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: spacing.lg },

    otpBox: { alignItems: 'center' },

    otpInput: {
      width: moderateScale(40),
      height: moderateScale(45),
      textAlign: 'center',
      fontSize: theme.fontSizes.xl,
      color: '#000',
    },

    underline: {
      height: 2,
      width: moderateScale(30),
      marginTop: spacing.xxs,
      borderRadius: radius.xs,
    },

    resendText: {
      textAlign: 'center',
      marginTop: spacing.sm,
      color: colors.actionPurple,
    },

    bottomFixed: {
      position: 'absolute',
      bottom: moderateScale(30),
      left: 0,
      right: 0,
      alignItems: 'center',
    },
  });
};