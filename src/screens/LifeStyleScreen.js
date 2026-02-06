import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
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

const LifeStyleScreen = ({ navigation }) => {
  const [about, setAbout] = useState("");
  const [selectedChoices, setSelectedChoices] = useState({});

  const dispatch = useDispatch();
  const { loading, data, options } = useSelector((state) => state.lifestyle);

 
  // Fetch categories and options
  useEffect(() => {
    dispatch({ type: FETCH_LIFESTYLE_REQUEST });
    dispatch({ type: FETCH_LIFESTYLE_OPTIONS_REQUEST });
  }, []);

  // Store selections
  const handleSelect = (categoryId, optionId) => {
    setSelectedChoices((prev) => ({ ...prev, [categoryId]: optionId }));
  };

  // Submit selected values
  const handleSubmit = () => {
    const lifestyleIds = Object.values(selectedChoices).map(Number);

   dispatch({
  type: USER_LIFESTYLE_REQUEST,
  payload: {
    lifestyles: lifestyleIds,
  },
});

 dispatch(newUserDataRequest({bio:about}));
    navigation.navigate("InterestScreen");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerRow}>
          <Ionicons name="chevron-back" size={22} />
          <Text style={styles.header}>Life Style</Text>
        </TouchableOpacity>

        {loading && <Text>Loading...</Text>}

        {!loading && data.map((category) => {
          const relatedOptions = options.filter(opt => opt.category_id === category.id);

          return (
            <View key={category.id} style={{ marginBottom: 20 }}>
              <Text style={styles.label}>{category.name}</Text>

              <View style={styles.dropdownWrapper}>
                <Picker
                  selectedValue={selectedChoices[category.id] || ""}
                  onValueChange={(value) => handleSelect(category.id, value)}
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

        <TouchableOpacity style={{ marginTop: 30 }} onPress={handleSubmit}>
          <LinearGradient colors={["#9D4CF1", "#D800F4"]} style={styles.button}>
            <Text style={styles.buttonText}>CONTINUE</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default LifeStyleScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDF9FF" },
  inner: { paddingHorizontal: 20, paddingBottom: 40 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  header: { fontSize: 20, fontWeight: "600", marginLeft: 8 },
  label: { fontSize: 15, fontWeight: "500", marginBottom: 6, marginTop: 14 },
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
