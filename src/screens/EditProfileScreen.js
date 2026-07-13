import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  PermissionsAndroid,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { moderateScale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';

import { FETCH_LIFESTYLE_OPTIONS_REQUEST, FETCH_LIFESTYLE_REQUEST } from '../features/lifeStyle/lifestyleTypes';
import { fetchInterestsRequest } from '../features/interest/interestActions';
import { fetchCitiesRequest, fetchStatesRequest } from '../features/Countries/locationActions';
import { languageApiFetchRequest } from '../features/language/languageAction';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import { newUserDataRequest } from '../features/user/userAction';
import { RESET_USER_STATE } from '../features/user/userType';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  userpostphotorequest,
  userdeletephotorequest,
} from '../features/photo/photoAction';
import ContinueButton from '../components/Common/ContinueButton';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { uploadProfileImageRequest, deleteProfileImageRequest } from '../features/profileImage/profileImageAction';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

// One-off accent for this screen only, consistently reused across its own
// avatar ring, camera button, accordion arrows, radios, etc.
const PURPLE = '#B832F9';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  // ✅ HOOK 1 — theme (always called, never conditional)
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, width, height), [theme, width, height]);

  // ✅ HOOK 2 — selector (always first among data hooks, never conditional)
  const { userdata, userDataResponse } = useSelector((state) => state.user);
  const { loading } = useSelector((state) => state.profileImage);

  // ✅ HOOK 3-15 — all useState in fixed order
  const [profileImg, setProfileImg] = useState(userdata?.images?.display_profile_image || null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Female');
  const [language, setLanguage] = useState('');
  const [locationText, setLocationText] = useState('');
  const [locationIds, setLocationIds] = useState({ city_id: null, state_id: null, country_id: null });
  const [selectedLifestyles, setSelectedLifestyles] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const isResponseHandled = useRef(false);

  // ✅ HOOK 16 — useRef
  const isFormInitialized = useRef(false);

  // ✅ HOOK 17 — initial API load
  useEffect(() => {
    dispatch(languageApiFetchRequest());
    dispatch(fetchInterestsRequest());
    dispatch({ type: FETCH_LIFESTYLE_REQUEST });
    dispatch({ type: FETCH_LIFESTYLE_OPTIONS_REQUEST });
  }, []);

  // ✅ HOOK 18 — focus listener — NO dispatch, only reset ref
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      isFormInitialized.current = false;
      isResponseHandled.current = false;
    });
    return unsubscribe;
  }, [navigation]);

  // ✅ HOOK 19 — alert effect — clear Redux only AFTER user taps OK
  useEffect(() => {
    if (!userDataResponse || isResponseHandled.current) return;

    const isSuccess = userDataResponse?.success === true;
    const safeMessage =
      typeof userDataResponse?.message === 'string'
        ? userDataResponse.message
        : isSuccess
        ? 'Profile updated successfully!'
        : 'Something went wrong';

    isResponseHandled.current = true;

    Alert.alert(isSuccess ? 'Success ✅' : 'Error ❌', safeMessage, [
      {
        text: 'OK',
        onPress: () => {
          dispatch({ type: RESET_USER_STATE });
        },
      },
    ]);
  }, [userDataResponse]);

  // ✅ HOOK 20 — form prefill on focus (useFocusEffect always last)
  useFocusEffect(
    useCallback(() => {
      if (!userdata) return;

      setProfileImg(userdata?.images?.display_profile_image ?? null);
      setFullName(userdata?.user?.name ?? '');
      setUsername(userdata?.user?.username ?? '');
      setEmail(userdata?.user?.email ?? '');
      setDob(formatDateForApi(userdata?.user?.date_of_birth));
      setGender(userdata?.user?.gender ?? 'Female');
      setLanguage(userdata?.language?.native_name ?? '');

      const city = userdata?.location?.city;
      const state = userdata?.location?.state;
      const country = userdata?.location?.country;

      setLocationIds({
        city_id: city?.id ?? null,
        state_id: state?.id ?? null,
        country_id: country?.id ?? null,
      });

      setLocationText(`${city?.name ?? ''}, ${state?.name ?? ''}, ${country?.name ?? ''}`);

      if (userdata?.lifestyles?.length) {
        setSelectedLifestyles(
          userdata.lifestyles.map((item) => ({
            categoryId: item.category.id,
            categoryName: item.category.name,
            id: item.subcategory.id,
            name: item.subcategory.name,
          }))
        );
      }

      if (userdata?.interests?.length) {
        setSelectedInterests(userdata.interests);
      }

      isFormInitialized.current = true;
    }, [userdata])
  );

  // ✅ Regular functions — AFTER all hooks
  const formatDateForApi = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const uploadImage = (asset) => {
    if (!asset) return;

    const formData = new FormData();
    formData.append('photo', {
      uri: asset.uri,
      type: asset.type || 'image/jpeg',
      name: asset.fileName || `profile_${Date.now()}.jpg`,
    });

    dispatch(
      uploadProfileImageRequest(formData, () => {
        dispatch({ type: 'USER_DATA_REQUEST' });
      })
    );
  };

  const openCamera = async () => {
    const allowed = await requestCameraPermission();

    if (!allowed) {
      Alert.alert('Camera permission denied');
      return;
    }

    launchCamera({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel || response.errorCode) return;
      if (response.assets?.length) {
        setProfileImg(response.assets[0].uri);
        uploadImage(response.assets[0]);
      }
    });
  };

  const openGallery = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel || response.errorCode) return;
      if (response.assets?.length) {
        setProfileImg(response.assets[0].uri);
        uploadImage(response.assets[0]);
      }
    });
  };

  const pickImage = () => {
    Alert.alert(
      'Profile Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        profileImg || userdata?.images?.display_profile_image || userdata?.images?.avatar
          ? {
              text: 'Remove Photo',
              style: 'destructive',
              onPress: () => {
                dispatch(
                  deleteProfileImageRequest(() => {
                    dispatch({ type: 'USER_DATA_REQUEST' });
                  })
                );
              },
            }
          : null,
        { text: 'Cancel', style: 'cancel' },
      ].filter(Boolean)
    );
  };

  const openGeneralInfo = () => {
    navigation.navigate('EditUserGeneralInfoScreen', { language, locationText, locationIds });

    if (userdata?.location?.country?.id) {
      dispatch(fetchStatesRequest(userdata.location.country.id));
    }
    if (userdata?.location?.state?.id) {
      dispatch(fetchCitiesRequest(userdata.location.state.id));
    }
  };

  const openLifestyle = () => {
    navigation.navigate('EditUserLifestyleScreen', { selected: selectedLifestyles });
  };

  const handleSave = () => {
    const payload = {
      name: fullName,
      username,
      email,
      date_of_birth: formatDateForApi(dob),
      gender: gender?.toLowerCase() === 'male' ? 'Male' : 'Female',
    };
    dispatch(newUserDataRequest(payload));
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDob(formatDateForApi(selectedDate));
    }
  };

  const handleDeleteImage = (photo_id) => {
    Alert.alert('Delete Photo', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch(userdeletephotorequest({ photo_id }, () => {}));
        },
      },
    ]);
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

const validateImage = asset => {
  if (!asset) return false;

  if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
    Alert.alert('Large Image', 'Please select an image smaller than 5 MB.');
    return false;
  }

  return true;
};

const uploadGalleryPhoto = asset => {
  const formData = new FormData();

  formData.append('photos', {
    uri: asset.uri,
    type: asset.type || 'image/jpeg',
    name: asset.fileName || `photo_${Date.now()}.jpg`,
  });

  setUploadingPhoto(true);

  dispatch(
    userpostphotorequest(formData, response => {
      setUploadingPhoto(false);

      if (response.success) {
        dispatch({ type: 'USER_DATA_REQUEST' });

        Alert.alert('Success', response.message);
      } else {
        Alert.alert('Upload Failed', response.message);
      }
    }),
  );
};

const openGalleryPicker = () => {
  if ((userdata?.images?.gallery?.length || 0) >= 4) {
    Alert.alert('Limit Reached', 'Maximum 4 photos allowed.');
    return;
  }

  launchImageLibrary(
    {
      mediaType: 'photo',
      quality: 0.6,
      maxWidth: 1080,
      maxHeight: 1080,
    },
    response => {
      if (response.didCancel || response.errorCode) return;

      const asset = response.assets?.[0];

      if (!validateImage(asset)) return;

      uploadGalleryPhoto(asset);
    },
  );
};

const openGalleryCamera = async () => {
  const allowed = await requestCameraPermission();

  if (!allowed) {
    Alert.alert('Permission', 'Camera permission denied.');
    return;
  }

  launchCamera(
    {
      mediaType: 'photo',
      quality: 0.6,
      maxWidth: 1080,
      maxHeight: 1080,
    },
    response => {
      if (response.didCancel || response.errorCode) return;

      const asset = response.assets?.[0];

      if (!validateImage(asset)) return;

      uploadGalleryPhoto(asset);
    },
  );
};

const openGalleryOptions = () => {
  Alert.alert('Upload Photo', 'Choose an option', [
    {
      text: 'Camera',
      onPress: openGalleryCamera,
    },
    {
      text: 'Gallery',
      onPress: openGalleryPicker,
    },
    {
      text: 'Cancel',
      style: 'cancel',
    },
  ]);
};

  const interestText = selectedInterests.map((i) => i.name).join(', ');
  const displayImage = profileImg ?? userdata?.images?.display_profile_image ?? userdata?.images?.avatar ?? null;

  return (
    <WelcomeScreenbackgroungpage>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.flex}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={theme.hitSlop}>
                <Icon name="chevron-back" size={moderateScale(26)} color={colors.icon} />
              </TouchableOpacity>
              <AppText variant="h3" style={styles.headerTitle}>Edit Profile</AppText>
            </View>

            <View style={styles.avatarSection}>
              <TouchableOpacity style={styles.avatarRing} onPress={!loading ? pickImage : null} activeOpacity={0.8}>
                <Image source={displayImage ? { uri: displayImage } : require('../assets/boy1.jpg')} style={styles.avatar} />

                {loading && (
                  <View style={styles.uploadLoader}>
                    <ActivityIndicator size="large" color="#ffffff" />
                  </View>
                )}

                {!loading && (
                  <View style={styles.cameraBtn}>
                    <Icon name="camera" size={moderateScale(14)} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <AppText variant="bodySmall" style={styles.label}>Full Name</AppText>
              <Input value={fullName} onChange={setFullName} styles={styles} colors={colors} />

              <AppText variant="bodySmall" style={styles.label}>Username</AppText>
              <Input value={username} onChange={setUsername} styles={styles} colors={colors} />

              <AppText variant="bodySmall" style={styles.label}>Email</AppText>
              <Input value={email} onChange={setEmail} styles={styles} colors={colors} />

              <AppText variant="bodySmall" style={styles.label}>Date Of Birth</AppText>
              <TouchableOpacity style={styles.inputBox} onPress={() => setShowDatePicker(true)}>
                <AppText variant="body" style={[styles.dobText, { color: dob ? colors.text : colors.placeholder }]}>
                  {dob || 'Select Date of Birth'}
                </AppText>
                <Icon name="calendar-outline" size={moderateScale(20)} color={colors.iconMuted} />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={dob ? new Date(dob) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  onChange={onDateChange}
                />
              )}

              <AppText variant="bodySmall" style={styles.label}>Gender</AppText>
              <View style={styles.genderRow}>
                <Gender label="Female" value={gender} setValue={setGender} styles={styles} colors={colors} />
                <Gender label="Male" value={gender} setValue={setGender} styles={styles} colors={colors} />
              </View>

              <AccordionHeader title="General Information" sectionKey="general" openSection={openSection} setOpenSection={setOpenSection} styles={styles} />
              {openSection === 'general' && (
                <View style={styles.generalContainer}>
                  <AppText variant="bodySmall" style={styles.label}>Language</AppText>
                  <TouchableOpacity style={styles.selectInput} onPress={openGeneralInfo}>
                    <AppText variant="body">{language || 'Select Language'}</AppText>
                    <Icon name="chevron-down" color={colors.iconMuted} />
                  </TouchableOpacity>

                  <AppText variant="bodySmall" style={styles.label}>Country</AppText>
                  <TouchableOpacity style={styles.selectInput} onPress={openGeneralInfo}>
                    <AppText variant="body">{userdata?.location?.country?.name || 'Select Country'}</AppText>
                    <Icon name="chevron-down" color={colors.iconMuted} />
                  </TouchableOpacity>

                  {locationIds.country_id && (
                    <>
                      <AppText variant="bodySmall" style={styles.label}>State</AppText>
                      <TouchableOpacity style={styles.selectInput} onPress={openGeneralInfo}>
                        <AppText variant="body">{userdata?.location?.state?.name || 'Select State'}</AppText>
                        <Icon name="chevron-down" color={colors.iconMuted} />
                      </TouchableOpacity>
                    </>
                  )}

                  {locationIds.state_id && (
                    <>
                      <AppText variant="bodySmall" style={styles.label}>City</AppText>
                      <TouchableOpacity style={styles.selectInput} onPress={openGeneralInfo}>
                        <AppText variant="body">{userdata?.location?.city?.name || 'Select City'}</AppText>
                        <Icon name="chevron-down" color={colors.iconMuted} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}

              <AccordionHeader title="Life Style" sectionKey="lifestyle" openSection={openSection} setOpenSection={setOpenSection} styles={styles} />
              {openSection === 'lifestyle' && (
                <View style={styles.generalContainer}>
                  {userdata?.lifestyles && userdata.lifestyles.length > 0 ? (
                    userdata.lifestyles.map((item, index) => (
                      <TouchableOpacity key={index} style={styles.selectInput} onPress={openLifestyle}>
                        <AppText variant="body">{item.category.name} : {item.subcategory.name}</AppText>
                        <Icon name="chevron-down" color={colors.iconMuted} />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyLifestyleBox}>
                      <AppText variant="bodySmall" color="textMuted" style={styles.emptyText}>No lifestyle available</AppText>
                      <TouchableOpacity style={styles.addNowBtn} onPress={openLifestyle}>
                        <AppText variant="subtitle" style={styles.addNowText}>Add Now</AppText>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              <AccordionHeader title="Interest" sectionKey="interest" openSection={openSection} setOpenSection={setOpenSection} styles={styles} />
              {openSection === 'interest' && (
                <TouchableOpacity
                  style={styles.inputBox}
                  onPress={() => navigation.navigate('EditUserInterestScreen', { selected: selectedInterests })}
                >
                  <AppText variant="body" style={styles.dobText}>{interestText || 'Select Interest'}</AppText>
                  <Icon name="chevron-forward" color={colors.iconMuted} />
                </TouchableOpacity>
              )}

              <AccordionHeader title="Gallery" sectionKey="gallery" openSection={openSection} setOpenSection={setOpenSection} styles={styles} />
              {openSection === 'gallery' && (
                <View style={styles.galleryWrap}>
                  <View style={styles.galleryGrid}>
                    {Array.from({ length: 4 }).map((_, index) => {
                      const image = userdata?.images?.gallery?.[index];
                      if (image) {
                        return (
                          <View key={image.photo_id} style={styles.galleryItem}>
                            <TouchableOpacity
                              style={styles.galleryTouch}
                              onPress={() =>
                                navigation.navigate('EditUserGalleryScreen', {
                                  images: userdata.images.gallery,
                                  startIndex: index,
                                })
                              }
                            >
                              <Image source={{ uri: image.photo_url }} style={styles.galleryImage} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteImage(image.photo_id)}>
                              <Icon name="close" size={moderateScale(14)} color="#fff" />
                            </TouchableOpacity>
                          </View>
                        );
                      }
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[styles.galleryItem, styles.emptyGallery]}
                         onPress={openGalleryOptions}
                        >
                          <Icon name="add" size={moderateScale(28)} color={colors.iconMuted} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
          {uploadingPhoto && (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
        </View>
      </KeyboardAvoidingView>

      <View style={styles.bottomFixed}>
        <ContinueButton title="SAVE" onPress={handleSave} />
      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default EditProfileScreen;

/* ================= SMALL COMPONENTS ================= */
// Pure presentational components — receive styles/colors as props rather
// than calling useAppTheme() themselves, avoiding redundant context reads.

const Input = ({ value, onChange, placeholder, styles, colors }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || value?.length > 0;
  return (
    <View style={[styles.inputBox, isActive && styles.inputActive]}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        style={styles.input}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor={colors.placeholder}
      />
    </View>
  );
};

const Gender = ({ label, value, setValue, styles, colors }) => {
  const isDisabled = (value === 'Male' && label === 'Female') || (value === 'Female' && label === 'Male');
  return (
    <TouchableOpacity style={[styles.genderItem, isDisabled && { opacity: 0.4 }]} disabled={isDisabled} onPress={() => setValue(label)}>
      <View style={[styles.radio, value === label && styles.radioActive]}>
        {value === label && <View style={styles.radioDot} />}
      </View>
      <AppText variant="body" style={{ color: isDisabled ? colors.textMuted : colors.text }}>{label}</AppText>
    </TouchableOpacity>
  );
};

const AccordionHeader = ({ title, sectionKey, openSection, setOpenSection, styles }) => {
  const isOpen = openSection === sectionKey;
  return (
    <TouchableOpacity style={styles.accordionRow} onPress={() => setOpenSection(isOpen ? null : sectionKey)}>
      <AppText variant="subtitle" style={styles.accordionTitle}>{title}</AppText>
      <View style={styles.accordionArrow}>
        <Icon name={isOpen ? 'chevron-up' : 'chevron-forward'} size={moderateScale(14)} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

/* ================= STYLES ================= */

const createStyles = (theme, width, height) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    flex: { flex: 1 },

    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
    headerTitle: { marginLeft: spacing.sm },

    avatarSection: { alignItems: 'center', marginVertical: spacing.xxl },
    avatarRing: {
      width: moderateScale(112),
      height: moderateScale(112),
      borderRadius: moderateScale(56),
      borderWidth: 4,
      borderColor: PURPLE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatar: { width: moderateScale(82), height: moderateScale(82), borderRadius: moderateScale(41) },

    inputActive: { borderColor: PURPLE, borderWidth: 1.5, backgroundColor: colors.card },

    cameraBtn: {
      position: 'absolute',
      bottom: spacing.xxs,
      right: spacing.xs,
      backgroundColor: PURPLE,
      width: moderateScale(30),
      height: moderateScale(30),
      borderRadius: moderateScale(15),
      alignItems: 'center',
      justifyContent: 'center',
    },

    form: { paddingHorizontal: spacing.lg },
    label: { marginTop: spacing.md, marginBottom: spacing.xs, color: colors.textSecondary },

    inputBox: {
      backgroundColor: colors.surface,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      minHeight: moderateScale(48),
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },

    dobText: { flex: 1 },

    input: { flex: 1, fontSize: theme.fontSizes.base, color: colors.text },

    genderRow: { flexDirection: 'row', marginTop: spacing.sm },
    genderItem: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.xxl },

    radio: {
      width: moderateScale(17),
      height: moderateScale(17),
      borderRadius: moderateScale(9),
      borderWidth: 2,
      borderColor: colors.border,
      marginRight: spacing.sm,
    },

    radioActive: { borderColor: PURPLE },
    radioDot: {
      width: moderateScale(8),
      height: moderateScale(8),
      borderRadius: moderateScale(4),
      backgroundColor: PURPLE,
      alignSelf: 'center',
      marginTop: 3,
    },

    accordionRow: {
      marginTop: spacing.xxl,
      paddingVertical: spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },

    accordionTitle: {},

    accordionArrow: {
      width: moderateScale(24),
      height: moderateScale(24),
      borderRadius: moderateScale(12),
      backgroundColor: PURPLE,
      alignItems: 'center',
      justifyContent: 'center',
    },

    generalContainer: { marginTop: spacing.sm },

    selectInput: {
      minHeight: moderateScale(48),
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.sm,
    },

    galleryWrap: { marginTop: spacing.md },

    galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

    galleryItem: {
      width: width * 0.44,
      height: width * 0.44,
      borderRadius: radius.lg,
      marginBottom: spacing.sm,
      backgroundColor: colors.surface,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },

    galleryImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    emptyGallery: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border },
    galleryTouch: { width: '100%', height: '100%' },

    deleteBtn: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.xs,
      backgroundColor: '#000',
      width: moderateScale(24),
      height: moderateScale(24),
      borderRadius: moderateScale(12),
      alignItems: 'center',
      justifyContent: 'center',
    },

    emptyLifestyleBox: { alignItems: 'center', paddingVertical: spacing.xl },
    emptyText: { marginBottom: spacing.sm },

    addNowBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: radius.xl, backgroundColor: PURPLE },
    addNowText: { color: '#fff' },

    scrollContent: { paddingBottom: height * 0.1 },

    bottomFixed: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingVertical: spacing.sm,
      backgroundColor: colors.background,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 5,
    },

    uploadLoader: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: moderateScale(100),
    },
    uploadOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0,0,0,0.35)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
},
  });
};