import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  FETCH_LIFESTYLE_REQUEST,
  FETCH_LIFESTYLE_OPTIONS_REQUEST,
  USER_LIFESTYLE_REQUEST,
} from '../features/lifeStyle/lifestyleTypes';

import { newUserDataRequest } from '../features/user/userAction';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const LifeStyleScreen = ({ navigation }) => {
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, width, height), [theme, width, height]);

  const [about, setAbout] = useState('');
  const [selectedChoices, setSelectedChoices] = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [userId, setUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResponseHandled, setIsResponseHandled] = useState(false);

  const { loading, data = [], options = [] } = useSelector((state) => state.lifestyle);
  const apiResponse = useSelector((state) => state.user.userDataResponse);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('user_id');
        if (id) setUserId(Number(id));
      } catch (error) {
        console.log('Error loading user id:', error);
      }
    };
    loadUserId();
  }, []);

  useEffect(() => {
    dispatch({ type: FETCH_LIFESTYLE_REQUEST });
    dispatch({ type: FETCH_LIFESTYLE_OPTIONS_REQUEST });
  }, [dispatch]);

  useEffect(() => {
    if (!isSubmitting || !apiResponse || isResponseHandled) return;

    setIsSubmitting(false);
    setIsResponseHandled(true);

    Alert.alert(
      apiResponse.success ? 'Success ✅' : 'Error ❌',
      apiResponse.message || 'Something went wrong',
      [
        {
          text: 'OK',
          onPress: () => {
            if (apiResponse.success) navigation.navigate('InterestScreen');
          },
        },
      ]
    );
  }, [apiResponse, isSubmitting, isResponseHandled, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setIsResponseHandled(false);
      setIsSubmitting(false);
    });
    return unsubscribe;
  }, [navigation]);

  const normalizedCategories = useMemo(
    () => data.map((item) => ({ id: item.id ?? item.category_id, name: item.name ?? item.category_name })),
    [data]
  );

  const normalizedOptions = useMemo(
    () =>
      options.map((item) => ({
        id: item.lifestyle_id ?? item.id,
        name: item.lifestyle_name ?? item.name,
        category_id: item.category_id,
      })),
    [options]
  );

  const handleSelect = (categoryId, optionId) => {
    setSelectedChoices((prev) => ({ ...prev, [categoryId]: optionId }));
    setOpenDropdownId(null);
  };

  const getSelectedOptionName = (categoryId) => {
    const selectedId = selectedChoices[categoryId];
    if (!selectedId) return '';
    const selectedOption = normalizedOptions.find((opt) => Number(opt.id) === Number(selectedId));
    return selectedOption?.name || '';
  };

  const handleAboutFocus = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
  };

  const handleSubmit = () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    const lifestyleIds = Object.values(selectedChoices)
      .filter((value) => value !== '' && value !== null && value !== undefined)
      .map(Number);

    if (lifestyleIds.length === 0) {
      Alert.alert('Validation', 'Please select at least one lifestyle option');
      return;
    }

    setIsSubmitting(true);
    setIsResponseHandled(false);

    dispatch({
      type: USER_LIFESTYLE_REQUEST,
      payload: { user_id: userId, lifestyles: lifestyleIds },
    });

    dispatch(newUserDataRequest({ bio: about }));
  };

  return (
    <WelcomeScreenbackgroungpage>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <View style={styles.mainContainer}>
          <ScrollView
            ref={scrollRef}
            style={styles.scrollView}
            contentContainerStyle={[styles.inner, { paddingBottom: keyboardHeight > 0 ? height * 0.16 : height * 0.035 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            nestedScrollEnabled
          >
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerRow} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={moderateScale(22)} color={colors.icon} />
              <AppText variant="h4" style={styles.header}>Life Style</AppText>
            </TouchableOpacity>

            {loading ? (
              <View style={styles.loaderWrapper}>
                <ActivityIndicator size="large" color={colors.accentFuchsia} />
                <AppText variant="bodySmall" color="textMuted" style={styles.loadingText}>
                  Loading lifestyle data...
                </AppText>
              </View>
            ) : (
              <>
                {normalizedCategories.map((category) => {
                  const relatedOptions = normalizedOptions.filter(
                    (opt) => Number(opt.category_id) === Number(category.id)
                  );

                  const selectedName = getSelectedOptionName(category.id);
                  const isOpen = openDropdownId === category.id;

                  return (
                    <View key={category.id} style={styles.card}>
                      <AppText variant="subtitle" style={styles.label}>{category.name}</AppText>

                      <TouchableOpacity
                        style={[styles.dropdown, isOpen && styles.activeDropdown]}
                        activeOpacity={0.8}
                        onPress={() => setOpenDropdownId(isOpen ? null : category.id)}
                      >
                        <AppText
                          variant="bodySmall"
                          style={[styles.dropdownText, !selectedName && styles.placeholderText]}
                        >
                          {selectedName || 'Select...'}
                        </AppText>

                        <Ionicons
                          name={isOpen ? 'chevron-up' : 'chevron-down'}
                          size={moderateScale(18)}
                          color={colors.iconMuted}
                        />
                      </TouchableOpacity>

                      {isOpen && (
                        <ScrollView style={styles.dropdownList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                          {relatedOptions.length > 0 ? (
                            relatedOptions.map((opt) => (
                              <TouchableOpacity
                                key={opt.id}
                                style={styles.dropdownItem}
                                activeOpacity={0.8}
                                onPress={() => handleSelect(category.id, opt.id)}
                              >
                                <AppText variant="bodySmall" style={styles.dropdownItemText}>{opt.name}</AppText>
                              </TouchableOpacity>
                            ))
                          ) : (
                            <View style={styles.dropdownItem}>
                              <AppText variant="bodySmall" color="textMuted">No options found</AppText>
                            </View>
                          )}
                        </ScrollView>
                      )}
                    </View>
                  );
                })}

                <View style={styles.card}>
                  <AppText variant="subtitle" style={styles.label}>About</AppText>

                  <TextInput
                    style={styles.textArea}
                    placeholder="Type Here..."
                    placeholderTextColor={colors.placeholder}
                    multiline
                    value={about}
                    onChangeText={setAbout}
                    onFocus={handleAboutFocus}
                    textAlignVertical="top"
                    returnKeyType="done"
                    blurOnSubmit={false}
                  />
                </View>
              </>
            )}
          </ScrollView>

          {!loading && (
            <View
              style={[
                styles.footer,
                { marginBottom: Platform.OS === 'android' && keyboardHeight > 0 ? keyboardHeight : 0 },
              ]}
            >
              <TouchableOpacity style={styles.buttonWrapper} onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#D800F4', '#8C35F5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={colors.textInverse} />
                  ) : (
                    <AppText variant="button" style={styles.buttonText}>CONTINUE</AppText>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </WelcomeScreenbackgroungpage>
  );
};

export default LifeStyleScreen;

const createStyles = (theme, width, height) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    keyboardView: { flex: 1 },
    mainContainer: { flex: 1 },
    scrollView: { flex: 1 },

    inner: {
      flexGrow: 1,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
    },

    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
    header: { marginLeft: spacing.xxs },

    card: { marginBottom: spacing.md },

    label: { marginBottom: spacing.xxs },

    dropdown: {
      backgroundColor: colors.card,
      height: moderateScale(46),
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    activeDropdown: { borderColor: colors.accentFuchsia },

    dropdownText: { flex: 1, color: colors.text },
    placeholderText: { color: colors.placeholder },

    dropdownList: {
      maxHeight: height * 0.25,
      backgroundColor: colors.card,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: spacing.xxs,
      overflow: 'hidden',
    },

    dropdownItem: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },

    dropdownItemText: { color: colors.text },

    textArea: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
      minHeight: height * 0.15,
      backgroundColor: colors.card,
      color: colors.text,
    },

    footer: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xs,
    },

    buttonWrapper: { width: '100%' },

    button: {
      height: moderateScale(48),
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },

    buttonText: { color: colors.textInverse },

    loaderWrapper: { marginTop: height * 0.06, alignItems: 'center', justifyContent: 'center' },
    loadingText: { marginTop: spacing.sm },
  });
};