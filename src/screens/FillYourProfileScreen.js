import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useDispatch, useSelector } from "react-redux";
import WelcomeScreenbackgroundgpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";
import { languageApiFetchRequest } from "../features/language/languageAction";
import { fetchCitiesRequest } from "../features/Countries/locationActions";
import { newUserDataRequest } from "../features/user/userAction";

const { width } = Dimensions.get("window");

const FillYourProfileScreen = ({ navigation, route }) => {
  console.log(route.params.country_id);

  const dispatch = useDispatch();

  const { languages } = useSelector((state) => state.language);
  const { states, cities } = useSelector((state) => state.location);
  const { userdata, message: apiResponse } = useSelector(
    (state) => state.user
  );

  console.log(apiResponse);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [date, setDate] = useState(new Date());
  const [dob, setDob] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

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
  }, []);

  useEffect(() => {
    if (isFormValid) {
      setShowMandatoryMsg(false);
    } else {
      setShowMandatoryMsg(true);
    }
  }, [isFormValid]);

  // ✅ Validation Check (All fields required)
  const isFormValid =
    name.trim() !== "" &&
    username.trim() !== "" &&
    dob.trim() !== "" &&
    language !== null &&
    stateValue !== null &&
    cityValue !== null;

  // 🔞 AGE CALCULATION (ADDED)
  const calculateAge = (dobString) => {
    // dobString format: DD-MM-YYYY
    const [day, month, year] = dobString.split("-").map(Number);
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

  // 🚀 Submit Handler (UPDATED WITH AGE CHECK)
  const handleSubmit = () => {
    if (!isFormValid) return;

    const age = calculateAge(dob);

    if (age < 18) {
      Alert.alert(
        "Age Restriction ❌",
        "You must be at least 18 years old to continue.",
        [{ text: "OK" }]
      );
      return;
    }

    const payload = {
      name,
      username,
      date_of_birth: dob,
      language_id: language.id,
      state_id: stateValue.id,
      city_id: cityValue.id,
      country_id: route.params.country_id,
    };

    dispatch(newUserDataRequest(payload));
  };

  // ✅ BACKEND RESPONSE ALERT (UNCHANGED LOGIC)
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
            navigation.navigate("LifeStyleScreen");
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

  return (
    <WelcomeScreenbackgroundgpage>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Fill Your Profile</Text>

        {showMandatoryMsg && (
          <Text style={styles.mandatoryText}>* All fields are mandatory</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
        />

        {/* DOB Calendar Input */}
        <TouchableOpacity
          style={styles.inputIconBox}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ flex: 1, fontSize: 16, color: dob ? "#000" : "#999" }}>
            {dob || "DD/MM/YYYY"}
          </Text>
          <Icon name="calendar-outline" size={20} color="#999" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);

                const day = selectedDate
                  .getDate()
                  .toString()
                  .padStart(2, "0");
                const month = (selectedDate.getMonth() + 1)
                  .toString()
                  .padStart(2, "0");
                const year = selectedDate.getFullYear();

                const formatted = `${day}-${month}-${year}`;
                setDob(formatted);
              }
            }}
          />
        )}

        <Text style={styles.sectionTitle}>General Information</Text>

        {/* Language Dropdown */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowLanguageDrop(!showLanguageDrop)}
        >
          <Text style={styles.dropdownText}>
            {language?.native_name || "Select Language"}
          </Text>
          <Icon name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        {showLanguageDrop && (
          <FlatList
            data={languages || []}
            keyExtractor={(item) => item.id.toString()}
            style={styles.dropdownList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setLanguage(item);
                  setShowLanguageDrop(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{item.name_en}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* State Dropdown */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowStateDrop(!showStateDrop)}
        >
          <Text style={styles.dropdownText}>
            {stateValue?.name || "Select State"}
          </Text>
          <Icon name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        {showStateDrop && (
          <FlatList
            data={states || []}
            keyExtractor={(item) => item.id.toString()}
            style={styles.dropdownList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setStateValue(item);
                  dispatch(fetchCitiesRequest(item.id));
                  setCityValue(null);
                  setShowStateDrop(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* City Dropdown */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowCityDrop(!showCityDrop)}
        >
          <Text style={styles.dropdownText}>
            {cityValue?.name || "Select City"}
          </Text>
          <Icon name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        {showCityDrop && (
          <FlatList
            data={cities || []}
            keyExtractor={(item) => item.id.toString()}
            style={styles.dropdownList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setCityValue(item);
                  setShowCityDrop(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* CONTINUE BUTTON */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: isFormValid ? "#B45BFA" : "#D3C8F6" },
          ]}
          disabled={!isFormValid}
          onPress={handleSubmit}
        >
          <Text
            style={[
              styles.continueText,
              { color: isFormValid ? "#fff" : "#eee" },
            ]}
          >
            CONTINUE
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomIndicator} />
      </View>
    </WelcomeScreenbackgroundgpage>
  );
};

export default FillYourProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 70, paddingHorizontal: 20 },
  backButton: { position: "absolute", top: 60, left: 15, padding: 4, zIndex: 10 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 30,
    color: "#111",
  },
  input: {
    backgroundColor: "#fff",
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E3D8FF",
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#000",
    marginBottom: 15,
  },
  inputIconBox: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E3D8FF",
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginTop: 10,
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: "#fff",
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E3D8FF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  dropdownText: { flex: 1, fontSize: 16, color: "#000" },
  dropdownList: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E3D8FF",
    maxHeight: 160,
    marginBottom: 15,
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 12 },
  dropdownItemText: { fontSize: 16, color: "#000" },
  continueButton: {
    position: "absolute",
    bottom: 50,
    width: width - 40,
    alignSelf: "center",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  continueText: { fontWeight: "700", fontSize: 16 },
  bottomIndicator: {
    position: "absolute",
    bottom: 10,
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#aaa",
    alignSelf: "center",
  },
  mandatoryText: {
    color: "red",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 8,
  },
});
