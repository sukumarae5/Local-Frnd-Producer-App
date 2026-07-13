import React, { useState, useEffect, useMemo } from 'react';
import { View, Image, Pressable, Alert, StyleSheet, useWindowDimensions } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { newUserDataRequest } from '../features/user/userAction';
import { useravatarapifetchrequest } from '../features/Avatars/avatarsAction';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import ContinueButton from '../components/Common/ContinueButton';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const GenderScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, width, height), [theme, width, height]);

  const CARD_SIZE = width * 0.32;

  const [selectedGender, setSelectedGender] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResponseHandled, setIsResponseHandled] = useState(false);

  const { success, message } = useSelector((state) => state.user);

  const handleContinue = () => {
    if (!selectedGender) return;

    setIsSubmitting(true);

    dispatch(newUserDataRequest({ gender: selectedGender }));
    dispatch(useravatarapifetchrequest(selectedGender));
  };

  useEffect(() => {
    if (!message || isResponseHandled) return;

    setIsSubmitting(false);
    setIsResponseHandled(true);

    const alertMessage = typeof message === 'string' ? message : message?.message || 'Something went wrong';

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

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setIsResponseHandled(false);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <WelcomeScreenbackgroungpage>
        <View style={styles.logoWrapper}>
          <Image source={require('../components/BackgroundPages/main_log1.png')} style={styles.logo} />
        </View>

        <AppText variant="h2" style={styles.title}>Select your gender</AppText>

        <View style={styles.cardRow}>
          <Pressable onPress={() => setSelectedGender('Male')}>
            <View
              style={[
                styles.card,
                { width: CARD_SIZE, height: CARD_SIZE, borderRadius: width * 0.08 },
                selectedGender === 'Male' && styles.selectedCard,
              ]}
            >
              <Image source={require('../assets/boy1.jpg')} style={styles.avatar} />
            </View>
            <AppText variant="subtitle" style={styles.label}>Male</AppText>
          </Pressable>

          <Pressable onPress={() => setSelectedGender('Female')}>
            <View
              style={[
                styles.card,
                { width: CARD_SIZE, height: CARD_SIZE, borderRadius: width * 0.08 },
                selectedGender === 'Female' && styles.selectedCard,
              ]}
            >
              <Image source={require('../assets/girl1.jpg')} style={styles.avatar} />
            </View>
            <AppText variant="subtitle" style={styles.label}>Female</AppText>
          </Pressable>
        </View>

        <View style={styles.bottomFixed}>
          <ContinueButton disabled={!selectedGender} loading={isSubmitting} onPress={handleContinue} />
        </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default GenderScreen;

const createStyles = (theme, width, height) => {
  const { colors, spacing } = theme;

  return StyleSheet.create({
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
      marginBottom: spacing.md,
    },

    title: {
      textAlign: 'center',
      marginBottom: spacing.xxxl,
    },

    cardRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: spacing.xs,
    },

    card: {
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
    },

    selectedCard: {
      borderWidth: 3,
      borderColor: '#db0afc', // kept as fixed brand accent, matches avatar selection border elsewhere
      transform: [{ scale: 1.05 }],
    },

    avatar: {
      width: '95%',
      height: '95%',
      resizeMode: 'contain',
      borderRadius: width * 0.04,
    },

    label: {
      textAlign: 'center',
      marginTop: spacing.md,
    },

    bottomFixed: {
      position: 'absolute',
      bottom: height * 0.03,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
  });
};