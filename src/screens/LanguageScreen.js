import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { languageApiFetchRequest } from "../features/language/languageAction";
import { newUserDataRequest } from "../features/user/userAction"; // ✅ ADD

const LanguageScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const { languages, loading } = useSelector(
    (state) => state.language
  );

  const [selectedLang, setSelectedLang] = useState(null); // stores code

  // ✅ CALL API ONLY ONCE
  useEffect(() => {
    dispatch(languageApiFetchRequest());
  }, []);

  return (
    <LinearGradient
      colors={["#2b002b", "#000000", "#000000"]}
      style={styles.container}
    >
      {/* Title */}
      <Text style={styles.title}>choose your language</Text>

      {/* Loader */}
      {loading && (
        <ActivityIndicator size="large" color="#c42bd6" />
      )}

      {/* Language List */}
      <FlatList
        data={languages}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20 }}
        renderItem={({ item }) => {
          const selected = selectedLang === item.code;

          return (
            <Pressable onPress={() => setSelectedLang(item.code)}>
              <View
                style={[
                  styles.langItem,
                  selected && styles.langSelected,
                ]}
              >
                <Text
                  style={[
                    styles.langText,
                    selected && styles.langTextSelected,
                  ]}
                >
                  {item.native_name}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      {/* Continue Button */}
      <Pressable
        style={[
          styles.button,
          !selectedLang && { opacity: 0.5 },
        ]}
        disabled={!selectedLang}
        onPress={() => {
          // 🔥 FIND SELECTED LANGUAGE OBJECT
          const selectedLanguageObj = languages.find(
            (lang) => lang.code === selectedLang
          );

          if (selectedLanguageObj) {
            // ✅ DISPATCH ONLY ID
            dispatch(
              newUserDataRequest({
                language_id: selectedLanguageObj.id,
              })
            );
          }

          navigation.navigate("DateofBirth", {
            language: selectedLang,
          });
        }}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </LinearGradient>
  );
};

export default LanguageScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "500",
    marginBottom: 20,
    textAlign: "center",
  },

  langItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 12,
    borderRadius: 12,
  },

  langSelected: {
    backgroundColor: "#c42bd6",
  },

  langText: {
    color: "#ffffff",
    fontSize: 18,
  },

  langTextSelected: {
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#c42bd6",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 30,
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
