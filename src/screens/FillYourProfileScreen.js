import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useDispatch, useSelector } from "react-redux";
import WelcomeScreenbackgroundgpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";
import { languageApiFetchRequest } from "../features/language/languageAction";
import { fetchCitiesRequest } from "../features/Countries/locationActions";
import { newUserDataRequest } from "../features/user/userAction";

const { width, height } = Dimensions.get("window");

const FillYourProfileScreen = ({ navigation, route }) => {
  const country_id = route?.params?.country_id ?? null;

  const dispatch = useDispatch();

  const { languages } = useSelector((state) => state.language);
  const { states, cities } = useSelector((state) => state.location);
  const { message: apiResponse } = useSelector((state) => state.user);

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
  }, [dispatch]);

  const isFormValid =
    name.trim() !== "" &&
    username.trim() !== "" &&
    dob.trim() !== "" &&
    language !== null &&
    stateValue !== null &&
    cityValue !== null;

  useEffect(() => {
    setShowMandatoryMsg(!isFormValid);
  }, [isFormValid]);

  const calculateAge = (dobString) => {
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

  const handleSubmit = () => {
    if (!isFormValid) return;

    const age = calculateAge(dob);

    if (age < 18) {
      Alert.alert(
        "Age Restriction ❌",
        "You must be at least 18 years old to continue."
      );
      return;
    }

    if (!country_id) {
      Alert.alert("Error", "Country ID missing.");
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
      })
    );
  };

  useEffect(() => {
    if (!apiResponse || isResponseHandled) return;

    setIsResponseHandled(true);

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
  }, [apiResponse, isResponseHandled, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setIsResponseHandled(false);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <WelcomeScreenbackgroundgpage>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={26} color="#000" />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: height * 0.18 }}
          >
            <Text style={styles.title}>Fill Your Profile</Text>

            {showMandatoryMsg && (
              <Text style={styles.mandatoryText}>
                * All fields are mandatory
              </Text>
            )}

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />

            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity
              style={styles.inputIconBox}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ flex: 1 }}>{dob || "DD/MM/YYYY"}</Text>
              <Icon name="calendar-outline" size={20} />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const day = selectedDate.getDate().toString().padStart(2, "0");
                    const month = (selectedDate.getMonth() + 1)
                      .toString()
                      .padStart(2, "0");
                    const year = selectedDate.getFullYear();
                    setDob(`${day}-${month}-${year}`);
                  }
                }}
              />
            )}

            <Text style={styles.sectionTitle}>General Information</Text>

            {/* Language */}
            <Text style={styles.label}>Language</Text>
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
              <View style={styles.dropdownList}>
                {(languages || []).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setLanguage(item);
                      setShowLanguageDrop(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>
                      {item.name_en}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* State */}
            <Text style={styles.label}>State</Text>
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
              <View style={styles.dropdownList}>
                {(states || []).map((item) => (
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
                    <Text style={styles.dropdownItemText}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* City */}
            <Text style={styles.label}>City</Text>
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
              <View style={styles.dropdownList}>
                {(cities || []).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCityValue(item);
                      setShowCityDrop(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

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
      </KeyboardAvoidingView>
    </WelcomeScreenbackgroundgpage>
  );
};

export default FillYourProfileScreen;
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: height * 0.08, paddingHorizontal: 20 },
  backButton: { position: "absolute", top: height * 0.07, left: 15, zIndex: 10 },
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
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 5 },
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
  dropdownItemText: { fontSize: 16 },
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