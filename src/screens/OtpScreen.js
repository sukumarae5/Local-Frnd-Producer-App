import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Path } from 'react-native-svg';
import {
  userLoginRequest,
  userOtpRequest,
  userResendOtpRequest,
} from '../features/Auth/authAction';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthLayout from '../components/Common/AuthLayout';
import ContinueButton from '../components/Common/ContinueButton';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

const { width, height } = Dimensions.get('window');
const OTP_LENGTH = 6;

const OtpScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { Otp } = useSelector(state => state.auth);

  console.log('📩 OTP STATE:', Otp);

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
      setTimer(prev => prev - 1);
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
        console.log('✅ OTP VERIFIED SUCCESSFULLY');

        // 1️⃣ Save auth data
        await AsyncStorage.setItem('twittoke', Otp.token ?? '');
        await AsyncStorage.setItem('user_id', String(Otp.user?.user_id ?? ''));
        await AsyncStorage.setItem('gender', Otp.user?.gender ?? '');

        // 2️⃣ Confirm token is really stored
        const savedToken = await AsyncStorage.getItem('twittoke');
        console.log('🔑 TOKEN IN STORAGE:', savedToken);

        if (!savedToken) {
          console.log('❌ TOKEN NOT SAVED — STOPPING SOCKET CONNECT');
          Alert.alert('Error', 'Login failed. Please try again.');
          return;
        }

        // 3️⃣ Connect socket AFTER login (VERY IMPORTANT)
        console.log('🔌 Connecting socket after login...');

        // 4️⃣ Navigate to correct home screen
        if (mode === 'login') {
          navigation.reset({
            index: 0,
            routes: [
              {
                name:
                  Otp.user.gender === 'Male'
                    ? 'MaleHomeTabs'
                    : 'ReceiverBottomTabs',
              },
            ],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'SelectYourCountryScreen' }],
          });
        }
      } catch (err) {
        console.error('❌ OTP FLOW ERROR:', err);
        Alert.alert('Error', 'Something went wrong');
      }
    };

    handleSuccess();
  }, [Otp]);
  const handleResend = () => {
    if (!canResend) return;

    dispatch(userResendOtpRequest({ mobile_number })); // or resend action

    setTimer(120);
    setCanResend(false);
  };

  return (
    <AuthLayout>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.bottomSection}>
            <Text style={styles.title}>Verification OTP</Text>
            <Text style={styles.subtitle}>OTP sent on your mobile Number</Text>

            {/* OTP */}
            <View style={styles.otpWrapper}>
              <View style={styles.otpContainer}>
                {otp.map((v, idx) => (
                  <View key={idx} style={styles.otpBox}>
                    <TextInput
                      ref={el => (inputRefs.current[idx] = el)}
                      style={styles.otpInput}
                      maxLength={1}
                      keyboardType="numeric"
                      value={v}
                      onChangeText={t => handleChange(t, idx)}
                      onKeyPress={e => handleKeyPress(e, idx)}
                    />

                    {/* 🔥 Gradient Underline */}
                    <LinearGradient
                      colors={
                        v
                          ? ['#D51BF9', '#8C37F8'] // ✅ active strong gradient
                          : ['#E3D8FF', '#8C37F8'] // ✅ default light
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.underline}
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* RESEND */}
            {!canResend ? (
              <Text style={styles.resendText}>
                Resend in {Math.floor(timer / 60)}:
                {String(timer % 60).padStart(2, '0')}
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <TouchableOpacity onPress={handleResend}>
                  <MaskedView
                    maskElement={
                      <Text style={styles.resendText}>Resend OTP</Text>
                    }
                  >
                    <LinearGradient
                      colors={['#D51BF9', '#8C37F8']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={[styles.resendText, { opacity: 0 }]}>
                        Resend OTP
                      </Text>
                    </LinearGradient>
                  </MaskedView>
                </TouchableOpacity>
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

const styles = StyleSheet.create({
  bottomSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#161616',
    textAlign: 'center',
    marginTop: 10,
  },

  subtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 15, // ✅ controls spacing
  },

  otpWrapper: {
    marginTop: 10, // ✅ NO flex
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },

  otpBox: {
    alignItems: 'center',
  },

  otpInput: {
    width: 40,
    height: 45,
    textAlign: 'center',
    fontSize: 20,
    color: '#000',
  },

  underline: {
    height: 2,
    width: 30,
    marginTop: 5,
    borderRadius: 2,
  },

  otpInputActive: {
    borderColor: '#B023E8',
  },

  resendText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#B023E8',
    fontSize: 13,
  },
  bottomFixed: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
