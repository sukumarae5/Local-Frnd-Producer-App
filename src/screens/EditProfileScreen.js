import React, { useEffect, useState, useCallback, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";

import {
  FETCH_LIFESTYLE_OPTIONS_REQUEST,
  FETCH_LIFESTYLE_REQUEST,
} from "../features/lifeStyle/lifestyleTypes";
import { fetchInterestsRequest } from "../features/interest/interestActions";
import {
  fetchCitiesRequest,
  fetchStatesRequest,
} from "../features/Countries/locationActions";
import { languageApiFetchRequest } from "../features/language/languageAction";
import WelcomeScreenbackgroungpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";
import { newUserDataRequest } from "../features/user/userAction";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";
import { Alert,  } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { userdeletephotorequest } from "../features/photo/photoAction";

/* ================================================= */

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  /* ===== REDUX ===== */
  const { userdata } = useSelector((state) => state.user);
    const { newUserData } = useSelector((state) => state.user);

    const {  message: apiResponse } = useSelector(
        (state) => state.user
      );
console.log(apiResponse)
  /* ===== BASIC INFO ===== */
  
  const [profileImg, setProfileImg] = useState(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("female");

  /* ===== GENERAL INFO ===== */
  const [language, setLanguage] = useState("");
  const [locationText, setLocationText] = useState("");
  const [locationIds, setLocationIds] = useState({
    city_id: null,
    state_id: null,
    country_id: null,
  });

  /* ===== LIFESTYLE / INTEREST ===== */
  const [selectedLifestyles, setSelectedLifestyles] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
const [showDatePicker, setShowDatePicker] = useState(false);

  /* ===== ACCORDION ===== */
  const [openSection, setOpenSection] = useState(null);

  
  /* ===== IMAGE PICKER ===== */
  const pickImage = () => {
  Alert.alert(
    "Select Option",
    "Choose an option to upload photo",
    [
      {
        text: "Camera",
        onPress: () =>
          navigation.navigate("UplodePhotoScreen", {
            open: "camera",
            from: "EditProfile",
          }),
      },
      {
        text: "Gallery",
        onPress: () =>
          navigation.navigate("UplodePhotoScreen", {
            open: "gallery",
            from: "EditProfile",
          }),
      },
      { text: "Cancel", style: "cancel" },
    ],
    { cancelable: true }
  );
};

  /* ===== INITIAL API LOAD ===== */
  useEffect(() => {
    dispatch(languageApiFetchRequest());
    dispatch(fetchInterestsRequest());
    // dispatch(newUserDataRequest())
    dispatch({ type: FETCH_LIFESTYLE_REQUEST });
    dispatch({ type: FETCH_LIFESTYLE_OPTIONS_REQUEST });
  }, []);
const formatDateForApi = (date) => {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`; // YYYY-MM-DD
};


  /* ================= REFRESH FIX ================= */
const isFormInitialized = useRef(false);

useFocusEffect(
  useCallback(() => {
    if (!userdata || isFormInitialized.current) return;

    console.log("🟢 Initializing EditProfile form");

    // BASIC INFO (ONLY ONCE)
    setProfileImg(userdata?.images?.avatar ?? null);
    setFullName(userdata?.user?.name ?? "");
    setUsername(userdata?.user?.username ?? "");
    setEmail(userdata?.user?.email ?? "");
    setDob(formatDateForApi(userdata?.user?.date_of_birth));
    setGender(userdata?.user?.gender ?? "Female");

    // LANGUAGE
    setLanguage(userdata?.language?.native_name ?? "");

    // LOCATION
    const city = userdata?.location?.city;
    const state = userdata?.location?.state;
    const country = userdata?.location?.country;

    setLocationIds({
      city_id: city?.id ?? null,
      state_id: state?.id ?? null,
      country_id: country?.id ?? null,
    });

    setLocationText(
      `${city?.name ?? ""}, ${state?.name ?? ""}, ${country?.name ?? ""}`
    );

    // LIFESTYLES
    if (userdata?.lifestyles?.length) {
      setSelectedLifestyles(
        userdata.lifestyles.map(item => ({
          categoryId: item.category.id,
          categoryName: item.category.name,
          id: item.subcategory.id,
          name: item.subcategory.name,
        }))
      );
    }

    // INTERESTS
    if (userdata?.interests?.length) {
      setSelectedInterests(userdata.interests);
    }

    isFormInitialized.current = true; // 🔒 LOCK IT
  }, [userdata])
);



const onDateChange = (event, selectedDate) => {
  setShowDatePicker(false);

  if (selectedDate) {
    setDob(formatDateForApi(selectedDate));
  }
};


  /* ===== NAVIGATION ===== */
  const openGeneralInfo = () => {
    navigation.navigate("EditUserGeneralInfoScreen", {
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

    if (userdata?.language?.id) {
      dispatch(newUserDataRequest({ language_id: userdata.language.id }));
    }
  };

  const openLifestyle = () => {
    navigation.navigate("EditUserLifestyleScreen", {
      selected: selectedLifestyles,
    });
  };

  const handleSave = () => {
  const payload = {
    name: fullName,
    username: username,
    email:email,
    date_of_birth: formatDateForApi(dob),
    gender: gender?.toLowerCase() === "male" ? "Male" : "Female",
  };

  console.log("✅ PROFILE UPDATE PAYLOAD", payload);

  // 🔥 DISPATCH API CALL
  dispatch(newUserDataRequest(payload));
};
const [isResponseHandled, setIsResponseHandled] = useState(false);

 useEffect(() => {
  if (!apiResponse || isResponseHandled) return;

  setIsResponseHandled(true); // ✅ stop future alerts

  Alert.alert(
    apiResponse.success ? "Success ✅" : "Error ❌",
    apiResponse.message,
    [
      {
        text: "OK",
        onPress: () => {
          if (apiResponse.success) {
            navigation.goBack();
          }
        },
      },
    ]
  );
}, [apiResponse, isResponseHandled]);

useEffect(() => {
  const unsubscribe = navigation.addListener("focus", () => {
    setIsResponseHandled(false);
  });

  return unsubscribe;
}, [navigation]);



  const interestText = selectedInterests.map((i) => i.name).join(", ");
const handleDeleteImage = (photo_id) => {
  Alert.alert("Delete Photo", "Are you sure?", [
    { text: "Cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: () => {
        dispatch(
          userdeletephotorequest(
            { photo_id },
            () => {
              console.log("✅ Deleted");

              // 👇 force refresh screen
            ({ refresh: Date.now() });
            }
          )
        );
      },
    },
  ]);
};




  return (
    <WelcomeScreenbackgroungpage>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="chevron-back" size={26} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
          </View>

          {/* AVATAR */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarRing} onPress={pickImage}>
              <Image
                source={
                  profileImg
                    ? { uri: profileImg }
                    : require("../assets/boy1.jpg")
                }
                style={styles.avatar}
              />
              <View style={styles.cameraBtn}>
                <Icon name="camera" size={14} color="#fff" />
              </View>
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
  <Text style={{ flex: 1, color: dob ? "#000" : "#999" }}>
    {dob || "Select Date of Birth"}
  </Text>
  <Icon name="calendar-outline" size={20} color="#999" />
</TouchableOpacity>

{showDatePicker && (
  <DateTimePicker
    value={dob ? new Date(dob) : new Date()}
    mode="date"
    display={Platform.OS === "ios" ? "spinner" : "default"}
    maximumDate={new Date()} // no future dates
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

            {openSection === "general" && (
              <View style={styles.generalContainer}>
                <Text style={styles.label}>Language</Text>
                <TouchableOpacity style={styles.selectInput} onPress={openGeneralInfo}>
                  <Text>{language || "Select Language"}</Text>
                  <Icon name="chevron-down" />
                </TouchableOpacity>

                <Text style={styles.label}>Country</Text>
                <TouchableOpacity style={styles.selectInput} onPress={openGeneralInfo}>
                  <Text>{userdata?.location?.country?.name || "Select Country"}</Text>
                  <Icon name="chevron-down" />
                </TouchableOpacity>

                {locationIds.country_id && (
                  <>
                    <Text style={styles.label}>State</Text>
                    <TouchableOpacity style={styles.selectInput} onPress={openGeneralInfo}>
                      <Text>{userdata?.location?.state?.name || "Select State"}</Text>
                      <Icon name="chevron-down" />
                    </TouchableOpacity>
                  </>
                )}

                {locationIds.state_id && (
                  <>
                    <Text style={styles.label}>City</Text>
                    <TouchableOpacity style={styles.selectInput} onPress={openGeneralInfo}>
                      <Text>{userdata?.location?.city?.name || "Select City"}</Text>
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

           {openSection === "lifestyle" && (
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

            {openSection === "interest" && (
              <TouchableOpacity
                style={styles.inputBox}
                onPress={() =>
                  navigation.navigate("EditUserInterestScreen", {
                    selected: selectedInterests,
                  })
                }
              >
                <Text style={{ flex: 1 }}>
                  {interestText || "Select Interest"}
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
{openSection === "gallery" && (
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
            navigation.navigate("EditUserGalleryScreen", {
              images: userdata.images.gallery,
              startIndex: index,
            })
          }
        ><Image
  source={{ uri: image.photo_url }}
  style={styles.galleryImage}
  onError={(e) =>
    console.log("❌ Image load failed:", e.nativeEvent)
  }
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
        navigation.navigate("AddYourPhotosScreen", {
  from: "EditProfile",
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
            {/* SAVE */}
            <View style={styles.saveWrapper}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </WelcomeScreenbackgroungpage>
  );
};

export default EditProfileScreen;

/* ================= SMALL COMPONENTS ================= */

const Input = ({ value, onChange, placeholder }) => (
  <View style={styles.inputBox}>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      style={styles.input}
    />
  </View>
);

const Gender = ({ label, value, setValue }) => (
  <TouchableOpacity style={styles.genderItem} onPress={() => setValue(label)}>
    <View style={[styles.radio, value === label && styles.radioActive]}>
      {value === label && <View style={styles.radioDot} />}
    </View>
    <Text>{label}</Text>
  </TouchableOpacity>
);

const AccordionHeader = ({ title, sectionKey, openSection, setOpenSection }) => {
  const isOpen = openSection === sectionKey;
  return (
    <TouchableOpacity
      style={styles.accordionRow}
      onPress={() => setOpenSection(isOpen ? null : sectionKey)}
    >
      <Text style={styles.accordionTitle}>{title}</Text>
      <View style={styles.accordionArrow}>
        <Icon
          name={isOpen ? "chevron-up" : "chevron-forward"}
          size={14}
          color="#fff"
        />
      </View>
    </TouchableOpacity>
  );
};

/* ================= STYLES ================= */

const PURPLE = "#B832F9";

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: "600", marginLeft: 10 },
  avatarSection: { alignItems: "center", marginVertical: 24 },
  avatarRing: {width: 120,height: 120,borderRadius: 60,borderWidth: 4,borderColor: PURPLE,alignItems: "center",justifyContent: "center",},
  avatar: { width: 95, height: 95, borderRadius: 48 },
  cameraBtn:{position: "absolute",bottom: 6,right: 6,backgroundColor: PURPLE,width: 30,height: 30,borderRadius: 15,alignItems: "center",justifyContent: "center",},
  form:{ paddingHorizontal: 20 },
  label:{ marginTop: 14, marginBottom: 6, color: "#444" },
  inputBox:{backgroundColor:"#FAFAFA",borderRadius:28,paddingHorizontal:18,height: 50,flexDirection:"row",alignItems: "center",borderWidth:1,borderColor: "#eee",},
  input: { flex: 1 },
  genderRow: { flexDirection: "row", marginTop: 8 },
  genderItem: { flexDirection: "row", alignItems: "center", marginRight:30 },
  radio:{width: 18,height: 18,borderRadius: 9,borderWidth: 2,borderColor:"#ccc",marginRight: 6,},
  radioActive: { borderColor: PURPLE },
  radioDot:{width:8,height:8,borderRadius:4,backgroundColor:PURPLE,alignSelf:"center",marginTop: 3,},
  accordionRow:{marginTop:26,paddingVertical:14,flexDirection:"row",justifyContent:"space-between",borderBottomWidth:1,borderBottomColor:"#F0F0F0",},
  accordionTitle:{ fontSize: 15, fontWeight: "600" },
  accordionArrow:{width:26,height: 26,borderRadius: 13,backgroundColor:PURPLE,alignItems:"center",justifyContent:"center",},
  saveWrapper: { marginVertical: 30 },
  saveBtn:{backgroundColor:PURPLE,height: 54,borderRadius: 30,alignItems:"center",justifyContent:"center",},
  saveText:{color: "#fff", fontSize: 16, fontWeight: "700" },
  generalContainer:{ marginTop: 12 },
  selectInput:{height:48,backgroundColor:"#FAFAFA",borderRadius:25,paddingHorizontal:18,flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderWidth:1,borderColor: "#eee",
    marginBottom: 14,  },
  sectionTitle: {marginTop:26,marginBottom:12,fontSize:15,fontWeight: "600",},
galleryGrid: {flexDirection: "row",flexWrap: "wrap",justifyContent: "space-between",},
galleryItem:{width: "48%",height: 140,borderRadius: 16,marginBottom: 12,backgroundColor: "#F2F2F2",overflow: "hidden",alignItems: "center",justifyContent:"center",},

galleryImage:{width: "100%",height: "100%",resizeMode: "cover",},


emptyGallery: {
  borderWidth: 1,
  borderStyle: "dashed",
  borderColor: "#ccc",
},
galleryTouch: {
  width: "100%",
  height: "100%",
},

deleteBtn: {
  position: "absolute",
  top: 8,
  right: 8,
  backgroundColor: "#000",
  width: 22,
  height: 22,
  borderRadius: 11,
  alignItems: "center",
  justifyContent: "center",
},
emptyLifestyleBox: {
  alignItems: "center",
  paddingVertical: 20,
},

emptyText: {
  color: "#999",
  marginBottom: 10,
  fontSize: 14,
},

addNowBtn: {
  paddingHorizontal: 20,
  paddingVertical: 8,
  borderRadius: 20,
  backgroundColor: "#B832F9",
},

addNowText: {
  color: "#fff",
  fontWeight: "600",
},


});
