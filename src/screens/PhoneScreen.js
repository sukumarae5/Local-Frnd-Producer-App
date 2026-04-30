import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  userRegisterRequest,
  userLoginRequest,
  authReset,
} from '../features/Auth/authAction';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import AuthLayout from '../components/Common/AuthLayout'; // ✅ USE THIS
import ContinueButton from '../components/Common/ContinueButton';

const PhoneScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { success, mode } = useSelector(state => state.auth);

  const [mobile_number, setMobile_number] = useState('');
  const phoneInputRef = useRef(null);

  const handlePhoneChange = text => {
    const numeric = text.replace(/[^0-9]/g, '');
    if (numeric.length <= 10) setMobile_number(numeric);
  };

  useEffect(() => {
    dispatch(authReset());
  }, []);

  useEffect(() => {
    if (success === null) return;

    if (success === true) {
      navigation.navigate('Otp', { mobile_number, mode });
    }

    if (success === false) {
      dispatch(userLoginRequest({ mobile_number }));
      navigation.navigate('Otp', { mobile_number });
    }
  }, [success]);

  const handleNext = () => {
    if (mobile_number.length !== 10) {
      Alert.alert('Invalid', 'Please enter a valid 10 digit number');
      return;
    }
    dispatch(userRegisterRequest({ mobile_number }));
  };

  return (
    <AuthLayout>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* CONTENT CENTER */}
          <View style={styles.contentWrapper}>
            <View style={styles.headerWrapper}>
              <Text style={styles.title}>Sign Up With</Text>
              <Text style={styles.subTitle}>Phone Number</Text>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Icon name="call-outline" size={18} style={styles.phoneIcon} />
                <Text style={styles.label}>Mobile Number</Text>
              </View>

              <TextInput
                ref={phoneInputRef}
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor="#bbb"
                keyboardType="number-pad"
                value={mobile_number}
                onChangeText={handlePhoneChange}
                maxLength={10}
              />
            </View>
          </View>

          {/* FIXED BUTTON */}
          <View style={styles.bottomFixed}>
            <ContinueButton
              onPress={handleNext}
              disabled={mobile_number.length !== 10}
            />

            <Text style={styles.helpText}>
              Need Help <Text style={styles.clickHere}>Click Here..</Text>
            </Text>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </AuthLayout>
  );
};

export default PhoneScreen;
const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
  },

  headerWrapper: {
    width: 165,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 10, // 👈 reduce from 20
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#161616',
  },

  subTitle: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
  },

  inputContainer: {
    width: 335,
    alignSelf: 'center',
    marginTop: 25, // 👈 reduce from 40
  },
 
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  phoneIcon: {
    marginRight: 6,
    color: '#C724C7',
  },

  label: {
    fontSize: 18,
    fontWeight: '500',
    color: '#151414',
  },

  input: {
    borderWidth: 1,
    borderColor: '#C724C7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    fontSize: 17,
    color: '#5a555a',
  },

  bottomFixed: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  nextButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  nextDisabled: {
    backgroundColor: '#444',
  },

  nextActive: {
    backgroundColor: '#bb78ee',
  },

  nextText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },

  helpText: {
    marginTop: 20,
    fontSize: 15,
    color: '#555',
  },

  clickHere: {
    color: '#B023E8',
    fontWeight: '600',
  },
});
