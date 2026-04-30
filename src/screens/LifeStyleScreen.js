import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  FETCH_LIFESTYLE_REQUEST,
  FETCH_LIFESTYLE_OPTIONS_REQUEST,
  USER_LIFESTYLE_REQUEST,
} from "../features/lifeStyle/lifestyleTypes";

import { newUserDataRequest } from "../features/user/userAction";
import WelcomeScreenbackgroungpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";

const { width, height } = Dimensions.get("window");
const RF = (size) => (width / 375) * size;

const LifeStyleScreen = ({ navigation }) => {
  const [about, setAbout] = useState("");
  const [selectedChoices, setSelectedChoices] = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [userId, setUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResponseHandled, setIsResponseHandled] = useState(false);

  const dispatch = useDispatch();

  const { loading, data = [], options = [] } = useSelector(
    (state) => state.lifestyle
  );

  const { message: apiResponse } = useSelector((state) => state.user);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const id = await AsyncStorage.getItem("user_id");
        if (id) setUserId(Number(id));
      } catch (error) {
        console.log("Error loading user id:", error);
      }
    };

    loadUserId();
  }, []);

  useEffect(() => {
    dispatch({ type: FETCH_LIFESTYLE_REQUEST });
    dispatch({ type: FETCH_LIFESTYLE_OPTIONS_REQUEST });
  }, [dispatch]);

  useEffect(() => {
    if (!apiResponse || isResponseHandled) return;

    setIsSubmitting(false);
    setIsResponseHandled(true);

    Alert.alert(
      apiResponse.success ? "Success ✅" : "Error ❌",
      apiResponse.message || "Something went wrong",
      [
        {
          text: "OK",
          onPress: () => {
            if (apiResponse.success) {
              navigation.navigate("InterestScreen");
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

  const normalizedCategories = useMemo(() => {
    return data.map((item) => ({
      id: item.id ?? item.category_id,
      name: item.name ?? item.category_name,
    }));
  }, [data]);

  const normalizedOptions = useMemo(() => {
    return options.map((item) => ({
      id: item.lifestyle_id ?? item.id,
      name: item.lifestyle_name ?? item.name,
      category_id: item.category_id,
    }));
  }, [options]);

  const handleSelect = (categoryId, optionId) => {
    setSelectedChoices((prev) => ({
      ...prev,
      [categoryId]: optionId,
    }));

    setOpenDropdownId(null);
  };

  const getSelectedOptionName = (categoryId) => {
    const selectedId = selectedChoices[categoryId];

    if (!selectedId) return "";

    const selectedOption = normalizedOptions.find(
      (opt) => Number(opt.id) === Number(selectedId)
    );

    return selectedOption?.name || "";
  };

  const handleSubmit = () => {
    if (!userId) {
      Alert.alert("Error", "User ID not found");
      return;
    }

    const lifestyleIds = Object.values(selectedChoices)
      .filter((value) => value !== "" && value !== null && value !== undefined)
      .map(Number);

    if (lifestyleIds.length === 0) {
      Alert.alert("Validation", "Please select at least one lifestyle option");
      return;
    }

    setIsSubmitting(true);

    dispatch({
      type: USER_LIFESTYLE_REQUEST,
      payload: {
        user_id: userId,
        lifestyles: lifestyleIds,
      },
    });

    dispatch(newUserDataRequest({ bio: about }));
  };

  return (
    <WelcomeScreenbackgroungpage>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.inner}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerRow}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={RF(22)} color="#111" />
            <Text style={styles.header}>Life Style</Text>
          </TouchableOpacity>

          {loading ? (
            <View style={styles.loaderWrapper}>
              <ActivityIndicator size="large" color="#B03EF7" />
              <Text style={styles.loadingText}>Loading lifestyle data...</Text>
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
                    <Text style={styles.label}>{category.name}</Text>

                    <TouchableOpacity
                      style={[styles.dropdown, isOpen && styles.activeDropdown]}
                      activeOpacity={0.8}
                      onPress={() =>
                        setOpenDropdownId(isOpen ? null : category.id)
                      }
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          !selectedName && styles.placeholderText,
                        ]}
                      >
                        {selectedName || "Select..."}
                      </Text>

                      <Ionicons
                        name={isOpen ? "chevron-up" : "chevron-down"}
                        size={RF(18)}
                        color="#777"
                      />
                    </TouchableOpacity>

                    {isOpen && (
                      <ScrollView
                        style={styles.dropdownList}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                      >
                        {relatedOptions.length > 0 ? (
                          relatedOptions.map((opt) => (
                            <TouchableOpacity
                              key={opt.id}
                              style={styles.dropdownItem}
                              activeOpacity={0.8}
                              onPress={() => handleSelect(category.id, opt.id)}
                            >
                              <Text style={styles.dropdownItemText}>
                                {opt.name}
                              </Text>
                            </TouchableOpacity>
                          ))
                        ) : (
                          <View style={styles.dropdownItem}>
                            <Text style={styles.noDataText}>
                              No options found
                            </Text>
                          </View>
                        )}
                      </ScrollView>
                    )}
                  </View>
                );
              })}

              <View style={styles.card}>
                <Text style={styles.label}>About</Text>

                <TextInput
                  style={styles.textArea}
                  placeholder="Type Here..."
                  placeholderTextColor="#B5B5B5"
                  multiline
                  value={about}
                  onChangeText={setAbout}
                />
              </View>

              <TouchableOpacity
                style={styles.buttonWrapper}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#D800F4", "#8C35F5"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>CONTINUE</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </WelcomeScreenbackgroungpage>
  );
};

export default LifeStyleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  inner: {
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.018,
    paddingBottom: height * 0.08,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.03,
  },

  header: {
    fontSize: RF(18),
    fontWeight: "600",
    marginLeft: width * 0.018,
    color: "#111",
  },

  card: {
    backgroundColor: "transparent",
    borderWidth: 0,
    elevation: 0,
    padding: 0,
    marginBottom: height * 0.018,
  },

  label: {
    fontSize: RF(14),
    fontWeight: "500",
    marginBottom: height * 0.008,
    color: "#111",
  },

  dropdown: {
    backgroundColor: "#fff",
    height: height * 0.058,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    paddingHorizontal: width * 0.035,
    flexDirection: "row",
    alignItems: "center",
  },

  activeDropdown: {
    borderColor: "#C72CFF",
  },

  dropdownText: {
    flex: 1,
    fontSize: RF(14),
    color: "#444",
    fontWeight: "400",
  },

  placeholderText: {
    color: "#9A9A9A",
  },

  dropdownList: {
    maxHeight: height * 0.25,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    marginTop: 5,
    overflow: "hidden",
  },

  dropdownItem: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.035,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },

  dropdownItemText: {
    fontSize: RF(14),
    color: "#333",
    fontWeight: "400",
  },

  noDataText: {
    fontSize: RF(13),
    color: "#999",
  },

  textArea: {
    borderWidth: 1,
    borderColor: "#E7E7E7",
    borderRadius: 8,
    paddingHorizontal: width * 0.035,
    paddingTop: height * 0.015,
    height: height * 0.15,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    color: "#111",
    fontSize: RF(14),
  },

  buttonWrapper: {
    marginTop: height * 0.03,
  },

  button: {
    height: height * 0.06,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: RF(15),
    fontWeight: "700",
  },

  loaderWrapper: {
    marginTop: height * 0.06,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: RF(14),
    color: "#666",
  },
});