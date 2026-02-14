import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { newUserDataRequest } from "../features/user/userAction";
import { useravatarapifetchrequest } from "../features/Avatars/avatarsAction";
import WelcomeScreenbackgroungpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";

const { width } = Dimensions.get("window");

const GenderScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const [selectedGender, setSelectedGender] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResponseHandled, setIsResponseHandled] = useState(false);

  // ✅ BACKEND RESPONSE FROM USER REDUCER
  const { success, message } = useSelector((state) => state.user);

  /* ---------- HANDLE CONTINUE ---------- */
  const handleContinue = () => {
    if (!selectedGender) return;

    setIsSubmitting(true);

    dispatch(newUserDataRequest({ gender: selectedGender }));
    dispatch(useravatarapifetchrequest(selectedGender));
  };

  /* ---------- HANDLE BACKEND RESPONSE ---------- */
  useEffect(() => {
    if (!message || isResponseHandled) return;

    setIsSubmitting(false);
    setIsResponseHandled(true);

    // ✅ FIX: normalize message (string only)
    const alertMessage =
      typeof message === "string"
        ? message
        : message?.message || "Something went wrong";

    Alert.alert(
      success ? "Success ✅" : "Error ❌",
      alertMessage,
      [
        {
          text: "OK",
          onPress: () => {
            if (success) {
              if (selectedGender === "Male") {
                navigation.navigate("BoysavatarScreen");
              } else if (selectedGender === "Female") {
                navigation.navigate("GirlsavatarScreen");
              }
            }
          },
        },
      ]
    );
  }, [message, success, isResponseHandled, selectedGender, navigation]);

  /* ---------- RESET ALERT WHEN SCREEN OPENS AGAIN ---------- */
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setIsResponseHandled(false);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.container}>
        {/* Logo */}
        <Image
          source={require("../components/BackgroundPages/main_log1.png")}
          style={styles.logo}
        />

        {/* Title */}
        <Text style={styles.title}>Select your gender</Text>

        {/* Gender Cards */}
        <View style={styles.cardRow}>
          {/* MALE */}
          <Pressable onPress={() => setSelectedGender("Male")}>
            <View
              style={[
                styles.card,
                selectedGender === "Male" && styles.selectedCard,
              ]}
            >
              <Image
                source={require("../assets/boy1.jpg")}
                style={styles.avatar}
              />
            </View>
            <Text style={styles.label}>Male</Text>
          </Pressable>

          {/* FEMALE */}
          <Pressable onPress={() => setSelectedGender("Female")}>
            <View
              style={[
                styles.card,
                selectedGender === "Female" && styles.selectedCard,
              ]}
            >
              <Image
                source={require("../assets/girl1.jpg")}
                style={styles.avatar}
              />
            </View>
            <Text style={styles.label}>Female</Text>
          </Pressable>
        </View>

        {/* Continue Button */}
        <Pressable
          style={[
            styles.button,
            selectedGender ? styles.buttonActive : styles.buttonDisabled,
          ]}
          disabled={!selectedGender || isSubmitting}
          onPress={handleContinue}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </Pressable>
      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default GenderScreen;

/* ================= STYLES ================= */

const CARD_SIZE = width / 2.8;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logo: {
    width: 100,
    height: 120,
    resizeMode: "contain",
    margin: 100,
  },
  title: {
    color: "#fff",
    fontSize: 31,
    fontWeight: "600",
    textAlign: "center",
    marginTop: -55,
    marginBottom: 50,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: "#fff",
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: "#db0afc",
    transform: [{ scale: 1.05 }],
  },
  avatar: {
    width: "95%",
    height: "95%",
    resizeMode: "contain",
  },
  label: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    fontSize: 20,
    fontWeight: "500",
  },
  button: {
    marginTop: "auto",
    marginLeft: 20,
    paddingVertical: 15,
    borderRadius: 14,
    marginBottom: 60,
    width: "90%",
    height: "7%",
  },
  buttonActive: {
    backgroundColor: "#db0afc",
  },
  buttonDisabled: {
    backgroundColor: "#444",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
  },
});
