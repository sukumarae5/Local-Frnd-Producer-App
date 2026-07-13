import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  userRegisterRequest,
  userLoginRequest,
  authReset,
} from '../features/Auth/authAction';

import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  useWindowDimensions,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Icon from 'react-native-vector-icons/Ionicons';

import AuthLayout from '../components/Common/AuthLayout';
import ContinueButton from '../components/Common/ContinueButton';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const PhoneScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const { success, mode } = useSelector(state => state.auth);

  const { theme } = useAppTheme();

  const { colors, spacing } = theme;

  const { width } = useWindowDimensions();

  const styles = useMemo(() => createStyles(theme, width), [theme, width]);

  const [mobile_number, setMobile_number] = useState('');

  const phoneInputRef = useRef(null);

  const handlePhoneChange = text => {
    const value = text.replace(/[^0-9]/g, '');

    if (value.length <= 10) {
      setMobile_number(value);
    }
  };

  useEffect(() => {
    dispatch(authReset());
  }, []);

  useEffect(() => {
    if (success === null) return;

    if (success) {
      navigation.navigate('Otp', {
        mobile_number,
        mode,
      });
    } else {
      dispatch(
        userLoginRequest({
          mobile_number,
        }),
      );

      navigation.navigate('Otp', {
        mobile_number,
      });
    }
  }, [success]);

  const handleNext = () => {
    if (mobile_number.length !== 10) {
      Alert.alert(
        'Invalid Number',
        'Please enter a valid 10 digit mobile number.',
      );
      return;
    }

    dispatch(
      userRegisterRequest({
        mobile_number,
      }),
    );
  };

  return (
    <AuthLayout>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.contentWrapper}>
            {/* Title */}

            <View style={styles.headerWrapper}>
              <AppText variant="h3" style={styles.title}>
                Sign Up With
              </AppText>

              <AppText variant="subtitle" style={styles.subTitle}>
                Phone Number
              </AppText>
            </View>

            {/* Input */}

            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <MaskedView
                  style={styles.phoneMask}
                  maskElement={
                    <Icon name="call-outline" size={22} color="#000" />
                  }
                >
                  <LinearGradient
                    colors={[
                      colors.gradientPurpleStart,
                      colors.gradientPurpleEnd,
                    ]}
                    style={{
                      flex: 1,
                    }}
                  />
                </MaskedView>

                <AppText variant="subtitle" style={styles.label}>
                  Mobile Number
                </AppText>
              </View>

              <LinearGradient
                colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 1,
                }}
                style={styles.inputGradient}
              >
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={phoneInputRef}
                    style={styles.input}
                    placeholder="Enter phone number"
                    placeholderTextColor={colors.placeholder}
                    keyboardType="number-pad"
                    maxLength={10}
                    value={mobile_number}
                    onChangeText={handlePhoneChange}
                  />
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Bottom */}

          <View style={styles.bottomFixed}>
            <ContinueButton
              title="CONTINUE"
              onPress={handleNext}
              disabled={mobile_number.length !== 10}
            />

            <AppText variant="bodySmall" style={styles.helpText}>
              Need Help{' '}
              <AppText variant="bodySmall" style={styles.clickHere}>
                Click Here..
              </AppText>
            </AppText>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </AuthLayout>
  );
};

export default PhoneScreen;

const createStyles = (theme, width) => {
  const { colors, spacing, radius, fontSizes } = theme;

  const maxWidth = Math.min(width * 0.9, 420);

  return StyleSheet.create({
    flex: {
      flex: 1,
    },

    contentWrapper: {
      flex: 1,
      paddingHorizontal: spacing.xl,
    },

    headerWrapper: {
      alignSelf: 'center',
      alignItems: 'center',
      width: '100%',
      maxWidth: maxWidth,
      marginTop: spacing.md,
    },

    title: {
      color: colors.text,
      textAlign: 'center',
    },

    subTitle: {
      color: colors.textSecondary,
      marginTop: spacing.xs,
      textAlign: 'center',
    },

    inputContainer: {
      width: '100%',
      maxWidth: maxWidth,
      alignSelf: 'center',
      marginTop: spacing.xl,
    },

    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },

    phoneMask: {
      width: 22,
      height: 22,
      marginRight: spacing.xs,
    },

    label: {
      color: colors.text,
    },

    // Gradient Border
    inputGradient: {
      borderRadius: radius.md,
      padding: 1.5,
    },

    // White/Dark background inside gradient
    inputWrapper: {
      backgroundColor: colors.background,
      borderRadius: radius.md - 1,
    },

    input: {
      paddingHorizontal: spacing.md,
      paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,

      fontSize: fontSizes.lg,
      color: colors.text,
    },

    bottomFixed: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl,
      alignItems: 'center',
    },

    helpText: {
      marginTop: spacing.lg,
      color: colors.textSecondary,
      textAlign: 'center',
    },

    clickHere: {
      color: colors.linkPurple,
      fontWeight: '700',
    },
  });
};
