import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { FETCH_COUNTRIES_REQUEST } from '../features/Countries/locationTypes';
import { fetchStatesRequest, fetchCitiesRequest } from '../features/Countries/locationActions';
import { languageApiFetchRequest } from '../features/language/languageAction';
import { newUserDataRequest } from '../features/user/userAction';
import { RESET_USER_STATE } from '../features/user/userType';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const EditUserGeneralInfoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, width), [theme, width]);

  const { userDataResponse } = useSelector((state) => state.user);

  const { locationIds = {}, language = '' } = route.params || {};

  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const [openLanguage, setOpenLanguage] = useState(false);
  const [openCountry, setOpenCountry] = useState(false);
  const [openState, setOpenState] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  const [query, setQuery] = useState('');
  const isResponseHandled = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { countries = [], states = [], cities = [], loading } = useSelector((state) => state.location);
  const { languages = [], loading: langLoading } = useSelector((state) => state.language);

  useEffect(() => {
    dispatch({ type: FETCH_COUNTRIES_REQUEST });
    dispatch(languageApiFetchRequest());
  }, []);

  useEffect(() => {
    if (languages.length && language) {
      const l = languages.find((i) => i.native_name === language);
      if (l) setSelectedLanguage(l);
    }
  }, [languages]);

  useEffect(() => {
    if (countries.length && locationIds.country_id) {
      const c = countries.find((i) => i.id === locationIds.country_id);
      if (c) {
        setSelectedCountry(c);
        dispatch(fetchStatesRequest(c.id));
      }
    }
  }, [countries]);

  useEffect(() => {
    if (states.length && locationIds.state_id) {
      const s = states.find((i) => i.id === locationIds.state_id);
      if (s) {
        setSelectedState(s);
        dispatch(fetchCitiesRequest(s.id));
      }
    }
  }, [states]);

  useEffect(() => {
    if (cities.length && locationIds.city_id) {
      const c = cities.find((i) => i.id === locationIds.city_id);
      if (c) setSelectedCity(c);
    }
  }, [cities]);

  const filteredCountries = countries.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));

  const handleDone = () => {
    const payload = {
      language_id: selectedLanguage?.id,
      country_id: selectedCountry?.id,
      state_id: selectedState?.id,
      city_id: selectedCity?.id,
    };

    setIsSubmitting(true);
    dispatch(newUserDataRequest(payload));
  };

  useEffect(() => {
    if (!userDataResponse || isResponseHandled.current) return;

    const isSuccess = userDataResponse?.success === true;
    const safeMessage =
      typeof userDataResponse?.message === 'string'
        ? userDataResponse.message
        : isSuccess
        ? 'Updated successfully!'
        : 'Something went wrong';

    setIsSubmitting(false);
    isResponseHandled.current = true;

    Alert.alert(isSuccess ? 'Success ✅' : 'Error ❌', safeMessage, [
      {
        text: 'OK',
        onPress: () => {
          dispatch({ type: RESET_USER_STATE });
          if (isSuccess) {
            navigation.navigate('EditProfileScreen');
          }
        },
      },
    ]);
  }, [userDataResponse]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      isResponseHandled.current = false;
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={theme.hitSlop}>
          <Icon name="chevron-back" size={moderateScale(26)} color={colors.icon} />
        </TouchableOpacity>
        <AppText variant="h4" style={styles.headerTitle}>General Information</AppText>
        <TouchableOpacity onPress={handleDone} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color={colors.editPurple} size="small" />
          ) : (
            <AppText variant="subtitle" style={styles.done}>DONE</AppText>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <AppText variant="bodySmall" style={styles.label}>Language</AppText>

          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setOpenLanguage(!openLanguage);
              setOpenCountry(false);
              setOpenState(false);
              setOpenCity(false);
            }}
          >
            <AppText variant="body">{selectedLanguage?.native_name || 'Select Language'}</AppText>
            <Icon name="chevron-down" color={colors.iconMuted} />
          </TouchableOpacity>

          {openLanguage && (
            <>
              {langLoading && <ActivityIndicator color={colors.editPurple} />}
              {languages.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.option}
                  onPress={() => {
                    setSelectedLanguage(item);
                    setOpenLanguage(false);
                  }}
                >
                  <AppText variant="body">{item.native_name}</AppText>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        <View style={styles.section}>
          <AppText variant="bodySmall" style={styles.label}>Country</AppText>

          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setOpenCountry(!openCountry);
              setOpenLanguage(false);
              setOpenState(false);
              setOpenCity(false);
            }}
          >
            <AppText variant="body">{selectedCountry?.name || 'Select Country'}</AppText>
            <Icon name="chevron-down" color={colors.iconMuted} />
          </TouchableOpacity>

          {openCountry && (
            <>
              <View style={styles.searchBox}>
                <Icon name="search-outline" size={moderateScale(18)} color={colors.iconMuted} />
                <TextInput
                  placeholder="Search country"
                  placeholderTextColor={colors.placeholder}
                  value={query}
                  onChangeText={setQuery}
                  style={styles.searchInput}
                />
              </View>

              {loading && <ActivityIndicator color={colors.editPurple} />}

              {filteredCountries.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.option}
                  onPress={() => {
                    setSelectedCountry(item);
                    setSelectedState(null);
                    setSelectedCity(null);
                    setOpenCountry(false);
                    dispatch(fetchStatesRequest(item.id));
                  }}
                >
                  <Image source={{ uri: item.flag_url }} style={styles.flag} />
                  <AppText variant="body">{item.name}</AppText>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        {states.length > 0 && (
          <View style={styles.section}>
            <AppText variant="bodySmall" style={styles.label}>State</AppText>

            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => {
                setOpenState(!openState);
                setOpenCity(false);
              }}
            >
              <AppText variant="body">{selectedState?.name || 'Select State'}</AppText>
              <Icon name="chevron-down" color={colors.iconMuted} />
            </TouchableOpacity>

            {openState &&
              states.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.option}
                  onPress={() => {
                    setSelectedState(item);
                    setSelectedCity(null);
                    setOpenState(false);
                    dispatch(fetchCitiesRequest(item.id));
                  }}
                >
                  <AppText variant="body">{item.name}</AppText>
                </TouchableOpacity>
              ))}
          </View>
        )}

        {cities.length > 0 && (
          <View style={styles.section}>
            <AppText variant="bodySmall" style={styles.label}>City</AppText>

            <TouchableOpacity style={styles.dropdown} onPress={() => setOpenCity(!openCity)}>
              <AppText variant="body">{selectedCity?.name || 'Select City'}</AppText>
              <Icon name="chevron-down" color={colors.iconMuted} />
            </TouchableOpacity>

            {openCity &&
              cities.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.option}
                  onPress={() => {
                    setSelectedCity(item);
                    setOpenCity(false);
                  }}
                >
                  <AppText variant="body">{item.name}</AppText>
                </TouchableOpacity>
              ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditUserGeneralInfoScreen;

const createStyles = (theme, width) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },

    headerTitle: {},
    done: { color: colors.editPurple, fontWeight: '700' },

    scrollContent: { paddingBottom: spacing.xl },

    section: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },

    label: { marginBottom: spacing.xxs, color: colors.textSecondary },

    dropdown: {
      minHeight: moderateScale(48),
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: '#E3D8FF',
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E3D8FF',
      borderRadius: radius.sm,
      paddingHorizontal: spacing.sm,
      marginTop: spacing.xs,
      minHeight: moderateScale(44),
    },

    searchInput: { flex: 1, marginLeft: spacing.xxs, color: colors.text },

    option: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
      flexDirection: 'row',
      alignItems: 'center',
    },

    flag: { width: moderateScale(24), height: moderateScale(16), marginRight: spacing.sm, resizeMode: 'cover' },
  });
};