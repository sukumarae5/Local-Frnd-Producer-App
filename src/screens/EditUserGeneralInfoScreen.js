import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

import { FETCH_COUNTRIES_REQUEST } from "../features/Countries/locationTypes";
import {
  fetchStatesRequest,
  fetchCitiesRequest,
} from "../features/Countries/locationActions";
import { languageApiFetchRequest } from "../features/language/languageAction";
import { newUserDataRequest } from "../features/user/userAction";

const PURPLE = "#B832F9";

const EditUserGeneralInfoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  /* ===== PARAMS ===== */
  const { locationIds = {}, language = "" } = route.params || {};

  /* ===== LOCAL STATE ===== */
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const [openLanguage, setOpenLanguage] = useState(false);
  const [openCountry, setOpenCountry] = useState(false);
  const [openState, setOpenState] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  const [query, setQuery] = useState("");

  /* ===== REDUX ===== */
  const { countries = [], states = [], cities = [], loading } = useSelector(
    state => state.location
  );
  const { languages = [], loading: langLoading } = useSelector(
    state => state.language
  );

  /* ===== LOAD ===== */
  useEffect(() => {
    dispatch({ type: FETCH_COUNTRIES_REQUEST });
    dispatch(languageApiFetchRequest());
  }, []);

  /* ===== PREFILL LANGUAGE ===== */
  useEffect(() => {
    if (languages.length && language) {
      const l = languages.find(i => i.native_name === language);
      if (l) setSelectedLanguage(l);
    }
  }, [languages]);

  /* ===== PREFILL COUNTRY ===== */
  useEffect(() => {
    if (countries.length && locationIds.country_id) {
      const c = countries.find(i => i.id === locationIds.country_id);
      if (c) {
        setSelectedCountry(c);
        dispatch(fetchStatesRequest(c.id));
      }
    }
  }, [countries]);

  /* ===== PREFILL STATE ===== */
  useEffect(() => {
    if (states.length && locationIds.state_id) {
      const s = states.find(i => i.id === locationIds.state_id);
      if (s) {
        setSelectedState(s);
        dispatch(fetchCitiesRequest(s.id));
      }
    }
  }, [states]);

  /* ===== PREFILL CITY ===== */
  useEffect(() => {
    if (cities.length && locationIds.city_id) {
      const c = cities.find(i => i.id === locationIds.city_id);
      if (c) setSelectedCity(c);
    }
  }, [cities]);

  const filteredCountries = countries.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  /* ===== DONE → DISPATCH ===== */
  const handleDone = () => {
    const payload = {
      language_id: selectedLanguage?.id,
      country_id: selectedCountry?.id,
      state_id: selectedState?.id,
      city_id: selectedCity?.id,
    };

    console.log("✅ GENERAL INFO PAYLOAD", payload);

    dispatch(newUserDataRequest(payload));

    navigation.navigate({
      name: "EditProfileScreen",
      params: { refresh: Date.now() },
      merge: true,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>General Information</Text>
        <TouchableOpacity onPress={handleDone}>
          <Text style={styles.done}>DONE</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* LANGUAGE */}
        <View style={styles.section}>
          <Text style={styles.label}>Language</Text>

          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setOpenLanguage(!openLanguage);
              setOpenCountry(false);
              setOpenState(false);
              setOpenCity(false);
            }}
          >
            <Text>{selectedLanguage?.native_name || "Select Language"}</Text>
            <Icon name="chevron-down" />
          </TouchableOpacity>

          {openLanguage && (
            <>
              {langLoading && <ActivityIndicator color={PURPLE} />}
              {languages.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.option}
                  onPress={() => {
                    setSelectedLanguage(item);
                    setOpenLanguage(false);
                  }}
                >
                  <Text>{item.native_name}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        {/* COUNTRY */}
        <View style={styles.section}>
          <Text style={styles.label}>Country</Text>

          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setOpenCountry(!openCountry);
              setOpenLanguage(false);
              setOpenState(false);
              setOpenCity(false);
            }}
          >
            <Text>{selectedCountry?.name || "Select Country"}</Text>
            <Icon name="chevron-down" />
          </TouchableOpacity>

          {openCountry && (
            <>
              <View style={styles.searchBox}>
                <Icon name="search-outline" size={18} />
                <TextInput
                  placeholder="Search country"
                  value={query}
                  onChangeText={setQuery}
                  style={{ flex: 1, marginLeft: 6 }}
                />
              </View>

              {loading && <ActivityIndicator color={PURPLE} />}

              {filteredCountries.map(item => (
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
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        {/* STATE */}
        {states.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>State</Text>

            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => {
                setOpenState(!openState);
                setOpenCity(false);
              }}
            >
              <Text>{selectedState?.name || "Select State"}</Text>
              <Icon name="chevron-down" />
            </TouchableOpacity>

            {openState &&
              states.map(item => (
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
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              ))}
          </View>
        )}

        {/* CITY */}
        {cities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>City</Text>

            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setOpenCity(!openCity)}
            >
              <Text>{selectedCity?.name || "Select City"}</Text>
              <Icon name="chevron-down" />
            </TouchableOpacity>

            {openCity &&
              cities.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.option}
                  onPress={() => {
                    setSelectedCity(item);
                    setOpenCity(false);
                  }}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditUserGeneralInfoScreen;


/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  done: { color: PURPLE, fontWeight: "700" },

  section: { padding: 20 },
  label: { marginBottom: 6, color: "#444" },

  dropdown: {
    height: 50,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#E3D8FF",
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E3D8FF",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 10,
    height: 44,
  },

  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
  },

  flag: {
    width: 26,
    height: 18,
    marginRight: 10,
  },
});
