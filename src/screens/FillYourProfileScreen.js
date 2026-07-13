import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useDispatch, useSelector } from 'react-redux';
import WelcomeScreenbackgroundgpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import { languageApiFetchRequest } from '../features/language/languageAction';
import { fetchCitiesRequest } from '../features/Countries/locationActions';
import { newUserDataRequest } from '../features/user/userAction';
import ContinueButton from '../components/Common/ContinueButton';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const FillYourProfileScreen = ({ navigation, route }) => {
  const country_id = route?.params?.country_id ?? null;
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const { height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, height), [theme, height]);

  const { languages } = useSelector(state => state.language);
  const { states, cities } = useSelector(state => state.location);
  const apiResponse = useSelector(state => state.user.userDataResponse);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [date, setDate] = useState(new Date());
  const [dob, setDob] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const [language, setLanguage] = useState(null);
  const [stateValue, setStateValue] = useState(null);
  const [cityValue, setCityValue] = useState(null);

  const [showLanguageDrop, setShowLanguageDrop] = useState(false);
  const [showStateDrop, setShowStateDrop] = useState(false);
  const [showCityDrop, setShowCityDrop] = useState(false);

  const [showMandatoryMsg, setShowMandatoryMsg] = useState(true);
  const [isResponseHandled, setIsResponseHandled] = useState(false);

  useEffect(() => {
    dispatch(languageApiFetchRequest());
  }, [dispatch]);

  const isFormValid =
    name.trim() !== '' &&
    username.trim() !== '' &&
    dob.trim() !== '' &&
    language !== null &&
    stateValue !== null &&
    cityValue !== null;

  useEffect(() => {
    setShowMandatoryMsg(!isFormValid);
  }, [isFormValid]);

  const calculateAge = dobString => {
    const [day, month, year] = dobString.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleSubmit = () => {
    if (!isFormValid) return;

    const age = calculateAge(dob);

    if (age < 18) {
      Alert.alert(
        'Age Restriction ❌',
        'You must be at least 18 years old to continue.',
      );
      return;
    }

    if (!country_id) {
      Alert.alert('Error', 'Country ID missing.');
      return;
    }

    dispatch(
      newUserDataRequest({
        name,
        username,
        date_of_birth: dob,
        language_id: language.id,
        state_id: stateValue.id,
        city_id: cityValue.id,
        country_id,
      }),
    );
  };

  useEffect(() => {
    if (!apiResponse || isResponseHandled) return;

    setIsResponseHandled(true);

    Alert.alert(
      apiResponse?.success ? 'Success ✅' : 'Error ❌',
      apiResponse?.message || 'Something went wrong',
      [
        {
          text: 'OK',
          onPress: () => {
            if (apiResponse?.success) {
              navigation.navigate('LifeStyleScreen');
            }
          },
        },
      ],
    );
  }, [apiResponse]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () =>
      setIsResponseHandled(false),
    );
    return unsubscribe;
  }, [navigation]);

  return (
    <WelcomeScreenbackgroundgpage>
      <View style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <SafeAreaView style={styles.container} edges={[]}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                hitSlop={theme.hitSlop}
              >
                <Icon
                  name="chevron-back"
                  size={moderateScale(24)}
                  color={colors.icon}
                />
              </TouchableOpacity>
              <AppText variant="h3" style={styles.headerTitle}>
                Fill Your Profile
              </AppText>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: height * 0.1 }}
            >
              {showMandatoryMsg && (
                <AppText
                  variant="bodySmall"
                  color="error"
                  style={styles.mandatoryText}
                >
                  * All fields are mandatory
                </AppText>
              )}

              <AppText variant="subtitle" style={styles.label}>
                Full Name
              </AppText>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'name' && styles.inputActive,
                ]}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Full Name"
                placeholderTextColor={colors.placeholder}
                value={name}
                onChangeText={setName}
              />

              <AppText variant="subtitle" style={styles.label}>
                Username
              </AppText>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'username' && styles.inputActive,
                ]}
                onFocus={() => setFocusedInput('username')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Username"
                placeholderTextColor={colors.placeholder}
                value={username}
                onChangeText={setUsername}
              />

              <AppText variant="subtitle" style={styles.label}>
                Date of Birth
              </AppText>
              <TouchableOpacity
                style={[
                  styles.inputIconBox,
                  focusedInput === 'dob' && styles.inputActive,
                ]}
                onPress={() => {
                  setFocusedInput('dob');
                  setShowDatePicker(true);
                }}
              >
                <AppText variant="body" style={styles.dobText}>
                  {dob || 'DD/MM/YYYY'}
                </AppText>
                <Icon
                  name="calendar-outline"
                  size={moderateScale(20)}
                  color={colors.iconMuted}
                />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'android' ? 'default' : 'spinner'}
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (!selectedDate) return;

                    setDate(selectedDate);

                    const day = selectedDate
                      .getDate()
                      .toString()
                      .padStart(2, '0');
                    const month = (selectedDate.getMonth() + 1)
                      .toString()
                      .padStart(2, '0');
                    const year = selectedDate.getFullYear();

                    setDob(`${day}-${month}-${year}`);
                  }}
                />
              )}

              <AppText variant="h4" style={styles.sectionTitle}>
                General Information
              </AppText>

              <AppText variant="subtitle" style={styles.label}>
                Language
              </AppText>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => {
                  setShowLanguageDrop(!showLanguageDrop);
                  setShowStateDrop(false);
                  setShowCityDrop(false);
                }}
              >
                <AppText variant="body" style={styles.dropdownText}>
                  {language?.native_name || 'Select Language'}
                </AppText>
                <Icon
                  name="chevron-down"
                  size={moderateScale(20)}
                  color={colors.iconMuted}
                />
              </TouchableOpacity>

              {showLanguageDrop && (
                <ScrollView
                  style={styles.dropdownList}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                >
                  {(languages || []).map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setLanguage(item);
                        setShowLanguageDrop(false);
                      }}
                    >
                      <AppText variant="body" style={styles.dropdownItemText}>
                        {item.name_en}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <AppText variant="subtitle" style={styles.label}>
                State
              </AppText>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => {
                  setShowStateDrop(!showStateDrop);
                  setShowLanguageDrop(false);
                  setShowCityDrop(false);
                }}
              >
                <AppText variant="body" style={styles.dropdownText}>
                  {stateValue?.name || 'Select State'}
                </AppText>
                <Icon
                  name="chevron-down"
                  size={moderateScale(20)}
                  color={colors.iconMuted}
                />
              </TouchableOpacity>

              {showStateDrop && (
                <ScrollView
                  style={styles.dropdownList}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                >
                  {(states || []).map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setStateValue(item);
                        dispatch(fetchCitiesRequest(item.id));
                        setCityValue(null);
                        setShowStateDrop(false);
                      }}
                    >
                      <AppText variant="body" style={styles.dropdownItemText}>
                        {item.name}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <AppText variant="subtitle" style={styles.label}>
                City
              </AppText>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => {
                  setShowCityDrop(!showCityDrop);
                  setShowStateDrop(false);
                  setShowLanguageDrop(false);
                }}
              >
                <AppText variant="body" style={styles.dropdownText}>
                  {cityValue?.name || 'Select City'}
                </AppText>
                <Icon
                  name="chevron-down"
                  size={moderateScale(20)}
                  color={colors.iconMuted}
                />
              </TouchableOpacity>

              {showCityDrop && (
                <ScrollView
                  style={styles.dropdownList}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                >
                  {(cities || []).map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setCityValue(item);
                        setShowCityDrop(false);
                      }}
                    >
                      <AppText variant="body" style={styles.dropdownItemText}>
                        {item.name}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>

        <View style={styles.bottomFixed}>
          <ContinueButton disabled={!isFormValid} onPress={handleSubmit} />
        </View>
      </View>
    </WelcomeScreenbackgroundgpage>
  );
};

export default FillYourProfileScreen;

const createStyles = (theme, height) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1, paddingHorizontal: spacing.lg },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
      marginTop: spacing.sm,
    },
    headerTitle: { marginLeft: spacing.sm },

    input: {
      backgroundColor: colors.card,
      height: moderateScale(48),
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: '#E3D8FF',
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.sm,
      color: colors.text,
    },

    inputIconBox: {
      backgroundColor: colors.card,
      flexDirection: 'row',
      alignItems: 'center',
      height: moderateScale(48),
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: '#E3D8FF',
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.sm,
    },

    dobText: { flex: 1, color: colors.text },

    sectionTitle: { marginTop: spacing.sm },

    dropdown: {
      backgroundColor: colors.card,
      height: moderateScale(48),
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: '#E3D8FF',
      paddingHorizontal: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },

    inputActive: { borderColor: colors.gradientPurpleStart, borderWidth: 1.5 },

    label: { marginTop: spacing.md },

    dropdownText: { flex: 1, color: colors.text },
    dropdownItemText: { color: colors.text },

    dropdownList: {
      maxHeight: height * 0.25,
      backgroundColor: colors.card,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: '#E3D8FF',
      marginBottom: spacing.xs,
    },

    dropdownItem: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
    },

    mandatoryText: { textAlign: 'center', marginBottom: spacing.xs },

    bottomFixed: {
      position: 'absolute',
      bottom: spacing.md,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
  });
};
