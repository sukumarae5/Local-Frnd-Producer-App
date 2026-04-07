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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  FETCH_LIFESTYLE_REQUEST,
  FETCH_LIFESTYLE_OPTIONS_REQUEST,
  USER_LIFESTYLE_REQUEST,
} from "../features/lifeStyle/lifestyleTypes";
import { newUserDataRequest } from "../features/user/userAction";
import WelcomeScreenbackgroungpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";

const LifeStyleScreen = ({ navigation }) => {
  const [about, setAbout] = useState("");
  const [selectedChoices, setSelectedChoices] = useState({});
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
        if (id) {
          setUserId(Number(id));
        }
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
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerRow}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={22} color="#111" />
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

                return (
                  <View key={category.id} style={styles.card}>
                    <Text style={styles.label}>{category.name}</Text>

                    <View style={styles.dropdownWrapper}>
                      <Picker
                        selectedValue={selectedChoices[category.id] || ""}
                        onValueChange={(value) =>
                          handleSelect(category.id, value)
                        }
                        style={styles.picker}
                        dropdownIconColor="#7B2CF3"
                      >
                        <Picker.Item label="Select..." value="" />
                        {relatedOptions.map((opt) => (
                          <Picker.Item
                            key={opt.id}
                            label={opt.name}
                            value={opt.id}
                          />
                        ))}
                      </Picker>
                    </View>

                    {selectedName ? (
                      <View style={styles.selectedBox}>
                        <Text style={styles.selectedLabel}>Selected:</Text>
                        <Text style={styles.selectedValue}>{selectedName}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}

              <View style={styles.card}>
                <Text style={styles.label}>About</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Type Here..."
                  placeholderTextColor="#888"
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
                  colors={["#9D4CF1", "#D800F4"]}
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  header: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 8,
    color: "#111",
  },

  loaderWrapper: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEE5FF",
    elevation: 2,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1A1A1A",
  },

  dropdownWrapper: {
    borderWidth: 1,
    borderColor: "#D8C7FF",
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
  },

  picker: {
    height: 52,
    width: "100%",
    color: "#222",
  },

  selectedBox: {
    marginTop: 10,
    backgroundColor: "#F5EEFF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E4D5FF",
  },

  selectedLabel: {
    fontSize: 12,
    color: "#7A52C7",
    marginBottom: 2,
    fontWeight: "600",
  },

  selectedValue: {
    fontSize: 15,
    color: "#4B1FAE",
    fontWeight: "700",
  },

  textArea: {
    borderWidth: 1,
    borderColor: "#D8C7FF",
    borderRadius: 12,
    padding: 12,
    height: 120,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    color: "#111",
  },

  buttonWrapper: {
    marginTop: 8,
  },

  button: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});