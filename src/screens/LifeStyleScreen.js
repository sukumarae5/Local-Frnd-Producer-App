import React, { useState, useEffect } from "react";
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

  // ✅ Loading + alert guard
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResponseHandled, setIsResponseHandled] = useState(false);

  const dispatch = useDispatch();

  const { loading, data, options } = useSelector(
    (state) => state.lifestyle
  );

  const { message: apiResponse } = useSelector(
    (state) => state.user
  );

  // Load user_id
  useEffect(() => {
    const loadUserId = async () => {
      const id = await AsyncStorage.getItem("user_id");
      setUserId(Number(id));
    };
    loadUserId();
  }, []);

  // Fetch lifestyle data
  useEffect(() => {
    dispatch({ type: FETCH_LIFESTYLE_REQUEST });
    dispatch({ type: FETCH_LIFESTYLE_OPTIONS_REQUEST });
  }, []);

  // 🔔 Handle backend response (ALERT → NAVIGATE)
  useEffect(() => {
    if (!apiResponse || isResponseHandled) return;

    setIsSubmitting(false);
    setIsResponseHandled(true);

    Alert.alert(
      apiResponse.success ? "Success ✅" : "Error ❌",
      apiResponse.message,
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
  }, [apiResponse, isResponseHandled]);

  // Reset guard when screen opens again
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setIsResponseHandled(false);
    });
    return unsubscribe;
  }, [navigation]);

  // Store selections
  const handleSelect = (categoryId, optionId) => {
    setSelectedChoices((prev) => ({
      ...prev,
      [categoryId]: optionId,
    }));
  };

  // 🚀 Submit
  const handleSubmit = () => {
    if (!userId) {
      Alert.alert("Error", "User ID not found");
      return;
    }

    setIsSubmitting(true);

    const lifestyleIds = Object.values(selectedChoices).map(Number);

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
        <ScrollView contentContainerStyle={styles.inner}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerRow}
          >
            <Ionicons name="chevron-back" size={22} />
            <Text style={styles.header}>Life Style</Text>
          </TouchableOpacity>

          {loading && <Text>Loading...</Text>}

          {!loading &&
            data.map((category) => {
              const relatedOptions = options.filter(
                (opt) => opt.category_id === category.id
              );

              return (
                <View key={category.id} style={{ marginBottom: 20 }}>
                  <Text style={styles.label}>{category.name}</Text>

                  <View style={styles.dropdownWrapper}>
                    <Picker
                      selectedValue={selectedChoices[category.id] || ""}
                      onValueChange={(value) =>
                        handleSelect(category.id, value)
                      }
                    >
                      <Picker.Item label="Select..." value="" />
                      {relatedOptions.map((opt) => (
                        <Picker.Item
                          key={opt.lifestyle_id}
                          label={opt.lifestyle_name}
                          value={opt.lifestyle_id}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              );
            })}

          <Text style={styles.label}>About</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Type Here..."
            multiline
            value={about}
            onChangeText={setAbout}
          />

          {/* BUTTON / LOADER */}
          <TouchableOpacity
            style={{ marginTop: 30 }}
            onPress={handleSubmit}
            disabled={isSubmitting}
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
        </ScrollView>
      </SafeAreaView>
    </WelcomeScreenbackgroungpage>
  );
};

export default LifeStyleScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { paddingHorizontal: 20, paddingBottom: 40 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  header: { fontSize: 20, fontWeight: "600", marginLeft: 8 },
  label: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 14,
  },
  dropdownWrapper: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 10,
    height: 48,
    justifyContent: "center",
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    height: 120,
    textAlignVertical: "top",
    backgroundColor: "#fff",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
