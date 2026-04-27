import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { newUserDataRequest } from '../features/user/userAction';
import { useravatarapifetchrequest } from '../features/Avatars/avatarsAction';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import ContinueButton from '../components/Common/ContinueButton';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const CARD_SIZE = width * 0.32;

const GenderScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const [selectedGender, setSelectedGender] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResponseHandled, setIsResponseHandled] = useState(false);

  // ✅ BACKEND RESPONSE FROM USER REDUCER
  const { success, message } = useSelector(state => state.user);

  /* ---------- HANDLE CONTINUE ---------- */
  const handleContinue = () => {
    if (!selectedGender) return;

    setIsSubmitting(true);

    dispatch(newUserDataRequest({ gender: selectedGender }));
    dispatch(useravatarapifetchrequest(selectedGender));
  };

  /* ---------- HANDLE BACKEND RESPONSE ---------- */
  useEffect(() => {
    if (!message || isResponseHandled) return;

    setIsSubmitting(false);
    setIsResponseHandled(true);

    // ✅ FIX: normalize message (string only)
    const alertMessage =
      typeof message === 'string'
        ? message
        : message?.message || 'Something went wrong';

    Alert.alert(success ? 'Success ✅' : 'Error ❌', alertMessage, [
      {
        text: 'OK',
        onPress: () => {
          if (success) {
            if (selectedGender === 'Male') {
              navigation.navigate('BoysavatarScreen');
            } else if (selectedGender === 'Female') {
              navigation.navigate('GirlsavatarScreen');
            }
          }
        },
      },
    ]);
  }, [message, success, isResponseHandled, selectedGender, navigation]);

  /* ---------- RESET ALERT WHEN SCREEN OPENS AGAIN ---------- */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setIsResponseHandled(false);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoWrapper}>
          <Image
            source={require('../components/BackgroundPages/main_log1.png')}
            style={styles.logo}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Select your gender</Text>

        {/* Gender Cards */}
        <View style={styles.cardRow}>
          {/* MALE */}
          <Pressable onPress={() => setSelectedGender('Male')}>
            <View
              style={[
                styles.card,
                selectedGender === 'Male' && styles.selectedCard,
              ]}
            >
              <Image
                source={require('../assets/boy1.jpg')}
                style={styles.avatar}
              />
            </View>
            <Text style={styles.label}>Male</Text>
          </Pressable>

          {/* FEMALE */}
          <Pressable onPress={() => setSelectedGender('Female')}>
            <View
              style={[
                styles.card,
                selectedGender === 'Female' && styles.selectedCard,
              ]}
            >
              <Image
                source={require('../assets/girl1.jpg')}
                style={styles.avatar}
              />
            </View>
            <Text style={styles.label}>Female</Text>
          </Pressable>
        </View>

        {/* Continue Button */}
        <View style={styles.bottomFixed}>
          <ContinueButton
            disabled={!selectedGender}
            loading={isSubmitting}
            onPress={handleContinue}
          />
        </View>
      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default GenderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.06,
    
  },

  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: width * 0.3,
    height: width * 0.3,
    resizeMode: 'contain',
    marginBottom: height * 0.02,
  },

  title: {
    color: '#080808',
    fontSize: width * 0.07,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: height * 0.05,
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: height * 0.01,
  },

  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: width * 0.08,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },

  selectedCard: {
    borderWidth: 3,
    borderColor: '#db0afc',
    borderRadius: width * 0.08,
    transform: [{ scale: 1.05 }],
  },

  avatar: {
    width: '95%',
    height: '95%',
    resizeMode: 'contain',
    borderRadius: width * 0.04,
  },

  label: {
    color: '#121111',
    textAlign: 'center',
    marginTop: height * 0.02,
    fontSize: width * 0.045,
    fontWeight: '500',
  },

  bottomFixed: {
    position: 'absolute',
    bottom: height * 0.03, // 🔥 responsive
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
