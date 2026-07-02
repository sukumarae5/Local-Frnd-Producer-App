import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';

import {
  FETCH_LIFESTYLE_OPTIONS_REQUEST,
  FETCH_LIFESTYLE_REQUEST,
} from '../features/lifeStyle/lifestyleTypes';
import { fetchInterestsRequest } from '../features/interest/interestActions';
import {
  fetchCitiesRequest,
  fetchStatesRequest,
} from '../features/Countries/locationActions';
import { languageApiFetchRequest } from '../features/language/languageAction';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import { newUserDataRequest } from '../features/user/userAction';
import { RESET_USER_STATE } from '../features/user/userType';
import DateTimePicker from '@react-native-community/datetimepicker';
import { userdeletephotorequest } from '../features/photo/photoAction';
import ContinueButton from '../components/Common/ContinueButton';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import {
  uploadProfileImageRequest,
  deleteProfileImageRequest,
} from '../features/profileImage/profileImageAction';

const { width, height } = Dimensions.get('window');
const wp = percent => (width * percent) / 100;
const hp = percent => (height * percent) / 100;

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  // ✅ HOOK 1 — selector (always first, never conditional)
  const { userdata, userDataResponse } = useSelector(state => state.user);
  const { loading } = useSelector(state => state.profileImage);

  // ✅ HOOK 2-14 — all useState in fixed order

  const [profileImg, setProfileImg] = useState(
    userdata?.images?.display_profile_image || null,
  );
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Female');
  const [language, setLanguage] = useState('');
  const [locationText, setLocationText] = useState('');
  const [locationIds, setLocationIds] = useState({
    city_id: null,
    state_id: null,
    country_id: null,
  });
  const [selectedLifestyles, setSelectedLifestyles] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const isResponseHandled = useRef(false);

  // ✅ HOOK 15 — useRef
  const isFormInitialized = useRef(false);

  // ✅ HOOK 16 — initial API load
  useEffect(() => {
    dispatch(languageApiFetchRequest());
    dispatch(fetchInterestsRequest());
    dispatch({ type: FETCH_LIFESTYLE_REQUEST });
    dispatch({ type: FETCH_LIFESTYLE_OPTIONS_REQUEST });
  }, []);

  // ✅ HOOK 17 — focus listener — NO dispatch, only reset ref
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      isFormInitialized.current = false;
      isResponseHandled.current = false; // ✅ only reset ref
      // ❌ REMOVE dispatch(RESET_USER_STATE) — this was wiping userDataResponse
    });
    return unsubscribe;
  }, [navigation]);

  // ✅ HOOK 18 — alert effect — clear Redux only AFTER user taps OK
  useEffect(() => {
    if (!userDataResponse || isResponseHandled.current) return; // ✅ .current fixed

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
          dispatch({ type: RESET_USER_STATE }); // ✅ clear ONLY after OK tap
        },
      },
    ]);
  }, [userDataResponse]); // ✅ removed isResponseHandled from deps — it's a ref

  // ✅ HOOK 19 — form prefill on focus (useFocusEffect always last)
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

      setLocationText(
        `${city?.name ?? ''}, ${state?.name ?? ''}, ${country?.name ?? ''}`,
      );

      if (userdata?.lifestyles?.length) {
        setSelectedLifestyles(
          userdata.lifestyles.map(item => ({
            categoryId: item.category.id,
            categoryName: item.category.name,
            id: item.subcategory.id,
            name: item.subcategory.name,
          })),
        );
      }

      if (userdata?.interests?.length) {
        setSelectedInterests(userdata.interests);
      }

      isFormInitialized.current = true;
    }, [userdata]),
  );

  // ✅ Regular functions — AFTER all hooks
  const formatDateForApi = date => {
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

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const uploadImage = asset => {
  if (!asset) return;

  const formData = new FormData();

  formData.append("photo", {
    uri: asset.uri,
    type: asset.type || "image/jpeg",
    name: asset.fileName || `profile_${Date.now()}.jpg`,
  });

  dispatch(
    uploadProfileImageRequest(formData, () => {
      dispatch({
        type: "USER_DATA_REQUEST",
      });
    }),
  );
};

  const openCamera = async () => {
    const allowed = await requestCameraPermission();

    if (!allowed) {
      Alert.alert('Camera permission denied');
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      response => {
        if (response.didCancel || response.errorCode) return;

        if (response.assets?.length) {
          setProfileImg(response.assets[0].uri);

          uploadImage(response.assets[0]);
        }
      },
    );
  };
  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      response => {
        if (response.didCancel || response.errorCode) return;

        if (response.assets?.length) {
          setProfileImg(response.assets[0].uri);

          uploadImage(response.assets[0]);
        }
      },
    );
  };

  const pickImage = () => {
    Alert.alert(
      'Profile Photo',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: openCamera,
        },
        {
          text: 'Gallery',
          onPress: openGallery,
        },
        profileImg ||
        userdata?.images?.display_profile_image ||
        userdata?.images?.avatar
          ? {
              text: 'Remove Photo',
              style: 'destructive',
              onPress: () => {
                dispatch(
                  deleteProfileImageRequest(() => {
                    dispatch({
                      type: 'USER_DATA_REQUEST',
                    });
                  }),
                );
              },
            }
          : null,
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ].filter(Boolean),
    );
  };

  const openGeneralInfo = () => {
    navigation.navigate('EditUserGeneralInfoScreen', {
      language,
      locationText,
      locationIds,
    });

    if (userdata?.location?.country?.id) {
      dispatch(fetchStatesRequest(userdata.location.country.id));
    }
    if (userdata?.location?.state?.id) {
      dispatch(fetchCitiesRequest(userdata.location.state.id));
    }
  };

  const openLifestyle = () => {
    navigation.navigate('EditUserLifestyleScreen', {
      selected: selectedLifestyles,
    });
  };

  const handleSave = () => {
    const payload = {
      name: fullName,
      username: username,
      email: email,
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

  const handleDeleteImage = photo_id => {
    Alert.alert('Delete Photo', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch(
            userdeletephotorequest({ photo_id }, () => {
              console.log('✅ Deleted');
            }),
          );
        },
      },
    ]);
  };

  const interestText = selectedInterests.map(i => i.name).join(', ');
  const displayImage =
    profileImg ??
    userdata?.images?.display_profile_image ??
    userdata?.images?.avatar ??
    null;

  return (
    <WelcomeScreenbackgroungpage>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* HEADER */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="chevron-back" size={26} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Edit Profile</Text>
            </View>

            {/* AVATAR */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarRing}
                onPress={!loading ? pickImage : null}
                activeOpacity={0.8}
              >
                <>
                  <Image
                    source={
                      displayImage
                        ? { uri: displayImage }
                        : require('../assets/boy1.jpg')
                    }
                    style={styles.avatar}
                  />

                  {loading && (
                    <View style={styles.uploadLoader}>
                      <ActivityIndicator size="large" color="#ffffff" />
                    </View>
                  )}
                </>
                {!loading && (
                  <View style={styles.cameraBtn}>
                    <Icon name="camera" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* FORM */}
            <View style={styles.form}>
              <Text style={styles.label}>Full Name</Text>
              <Input value={fullName} onChange={setFullName} />

              <Text style={styles.label}>Username</Text>
              <Input value={username} onChange={setUsername} />

              <Text style={styles.label}>Email</Text>
              <Input value={email} onChange={setEmail} />

              <Text style={styles.label}>Date Of Birth</Text>
              <TouchableOpacity
                style={styles.inputBox}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ flex: 1, color: dob ? '#000' : '#999' }}>
                  {dob || 'Select Date of Birth'}
                </Text>
                <Icon name="calendar-outline" size={20} color="#999" />
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

              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderRow}>
                <Gender label="Female" value={gender} setValue={setGender} />
                <Gender label="Male" value={gender} setValue={setGender} />
              </View>

              {/* GENERAL INFORMATION */}
              <AccordionHeader
                title="General Information"
                sectionKey="general"
                openSection={openSection}
                setOpenSection={setOpenSection}
              />
              {openSection === 'general' && (
                <View style={styles.generalContainer}>
                  <Text style={styles.label}>Language</Text>
                  <TouchableOpacity
                    style={styles.selectInput}
                    onPress={openGeneralInfo}
                  >
                    <Text>{language || 'Select Language'}</Text>
                    <Icon name="chevron-down" />
                  </TouchableOpacity>

                  <Text style={styles.label}>Country</Text>
                  <TouchableOpacity
                    style={styles.selectInput}
                    onPress={openGeneralInfo}
                  >
                    <Text>
                      {userdata?.location?.country?.name || 'Select Country'}
                    </Text>
                    <Icon name="chevron-down" />
                  </TouchableOpacity>

                  {locationIds.country_id && (
                    <>
                      <Text style={styles.label}>State</Text>
                      <TouchableOpacity
                        style={styles.selectInput}
                        onPress={openGeneralInfo}
                      >
                        <Text>
                          {userdata?.location?.state?.name || 'Select State'}
                        </Text>
                        <Icon name="chevron-down" />
                      </TouchableOpacity>
                    </>
                  )}

                  {locationIds.state_id && (
                    <>
                      <Text style={styles.label}>City</Text>
                      <TouchableOpacity
                        style={styles.selectInput}
                        onPress={openGeneralInfo}
                      >
                        <Text>
                          {userdata?.location?.city?.name || 'Select City'}
                        </Text>
                        <Icon name="chevron-down" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}

              {/* LIFESTYLE */}
              <AccordionHeader
                title="Life Style"
                sectionKey="lifestyle"
                openSection={openSection}
                setOpenSection={setOpenSection}
              />
              {openSection === 'lifestyle' && (
                <View style={styles.generalContainer}>
                  {userdata?.lifestyles && userdata.lifestyles.length > 0 ? (
                    userdata.lifestyles.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.selectInput}
                        onPress={openLifestyle}
                      >
                        <Text>
                          {item.category.name} : {item.subcategory.name}
                        </Text>
                        <Icon name="chevron-down" />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyLifestyleBox}>
                      <Text style={styles.emptyText}>
                        No lifestyle available
                      </Text>
                      <TouchableOpacity
                        style={styles.addNowBtn}
                        onPress={openLifestyle}
                      >
                        <Text style={styles.addNowText}>Add Now</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* INTEREST */}
              <AccordionHeader
                title="Interest"
                sectionKey="interest"
                openSection={openSection}
                setOpenSection={setOpenSection}
              />
              {openSection === 'interest' && (
                <TouchableOpacity
                  style={styles.inputBox}
                  onPress={() =>
                    navigation.navigate('EditUserInterestScreen', {
                      selected: selectedInterests,
                    })
                  }
                >
                  <Text style={{ flex: 1 }}>
                    {interestText || 'Select Interest'}
                  </Text>
                  <Icon name="chevron-forward" />
                </TouchableOpacity>
              )}

              {/* GALLERY */}
              <AccordionHeader
                title="Gallery"
                sectionKey="gallery"
                openSection={openSection}
                setOpenSection={setOpenSection}
              />
              {openSection === 'gallery' && (
                <View style={{ marginTop: 12 }}>
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
                              <Image
                                source={{ uri: image.photo_url }}
                                style={styles.galleryImage}
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.deleteBtn}
                              onPress={() => handleDeleteImage(image.photo_id)}
                            >
                              <Icon name="close" size={14} color="#fff" />
                            </TouchableOpacity>
                          </View>
                        );
                      }
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[styles.galleryItem, styles.emptyGallery]}
                          onPress={() =>
                            navigation.navigate('AddYourPhotosScreen', {
                              from: 'EditProfile',
                              existingPhotos: userdata?.images?.gallery || [],
                            })
                          }
                        >
                          <Icon name="add" size={28} color="#999" />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
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

const Input = ({ value, onChange, placeholder }) => {
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
        placeholderTextColor="#aaa"
      />
    </View>
  );
};

const Gender = ({ label, value, setValue }) => {
  const isDisabled =
    (value === 'Male' && label === 'Female') ||
    (value === 'Female' && label === 'Male');
  return (
    <TouchableOpacity
      style={[styles.genderItem, isDisabled && { opacity: 0.4 }]}
      disabled={isDisabled}
      onPress={() => setValue(label)}
    >
      <View style={[styles.radio, value === label && styles.radioActive]}>
        {value === label && <View style={styles.radioDot} />}
      </View>
      <Text style={{ color: isDisabled ? '#999' : '#000' }}>{label}</Text>
    </TouchableOpacity>
  );
};

const AccordionHeader = ({
  title,
  sectionKey,
  openSection,
  setOpenSection,
}) => {
  const isOpen = openSection === sectionKey;
  return (
    <TouchableOpacity
      style={styles.accordionRow}
      onPress={() => setOpenSection(isOpen ? null : sectionKey)}
    >
      <Text style={styles.accordionTitle}>{title}</Text>
      <View style={styles.accordionArrow}>
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-forward'}
          size={14}
          color="#fff"
        />
      </View>
    </TouchableOpacity>
  );
};

/* ================= STYLES ================= */

const PURPLE = '#B832F9';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  headerTitle: {
    fontSize: wp(5),
    fontWeight: '600',
    marginLeft: wp(2),
    color: '#000', // ✅ ADD
  },
  avatarSection: { alignItems: 'center', marginVertical: hp(3) },
  avatarRing: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    borderWidth: 4,
    borderColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { width: wp(22), height: wp(22), borderRadius: wp(11) },
  inputActive: {
    borderColor: '#B832F9',
    borderWidth: 1.5,
    backgroundColor: '#fff',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: hp(0.8),
    right: wp(1.5),
    backgroundColor: PURPLE,
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: { paddingHorizontal: wp(5) },
  label: {
    marginTop: hp(1.8),
    marginBottom: hp(0.8),
    color: '#444',
    fontSize: wp(3.8),
  },
  inputBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 28,
    paddingHorizontal: wp(4),
    minHeight: hp(6),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    fontSize: wp(4),
    color: '#000', // ✅ ADD
  },
  genderRow: { flexDirection: 'row', marginTop: hp(1) },
  genderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp(6),
  },
  radio: {
    width: wp(4.5),
    height: wp(4.5),
    borderRadius: wp(2.25),
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: wp(2),
  },
  radioActive: { borderColor: PURPLE },
  radioDot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: PURPLE,
    alignSelf: 'center',
    marginTop: 3,
  },
  accordionRow: {
    marginTop: hp(3),
    paddingVertical: hp(1.8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  accordionTitle: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#000', // ✅ ADD
  },
  accordionArrow: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generalContainer: { marginTop: hp(1.5) },
  selectInput: {
    minHeight: hp(6),
    backgroundColor: '#FAFAFA',
    borderRadius: 25,
    paddingHorizontal: wp(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: hp(1.5),
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  galleryItem: {
    width: wp(44),
    height: wp(44),
    borderRadius: 16,
    marginBottom: hp(1.5),
    backgroundColor: '#F2F2F2',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  emptyGallery: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#ccc' },
  galleryTouch: { width: '100%', height: '100%' },
  deleteBtn: {
    position: 'absolute',
    top: hp(1),
    right: wp(2),
    backgroundColor: '#000',
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLifestyleBox: { alignItems: 'center', paddingVertical: hp(3) },
  emptyText: { color: '#999', marginBottom: hp(1.2), fontSize: wp(3.5) },
  addNowBtn: {
    paddingHorizontal: wp(6),
    paddingVertical: hp(1),
    borderRadius: 20,
    backgroundColor: PURPLE,
  },
  addNowText: { color: '#fff', fontWeight: '600', fontSize: wp(3.8) },
  scrollContent: { paddingBottom: hp(10) },
  bottomFixed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: hp(1.5),
    backgroundColor: '#fff',
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
    borderRadius: 100,
  },
});
