import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import BackgroundPagesOne from "../components/BackgroundPages/BackgroundPagesOne";
import { useDispatch } from "react-redux";
import { newUserDataRequest } from "../features/user/userAction";

const DobScreen = ({ navigation }) => {
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const dispatch=useDispatch();

  const isValid =
    month.length === 2 &&
    day.length === 2 &&
    year.length === 4 &&
    Number(year) <= new Date().getFullYear() - 18;

  const handleContinue = () => {
    const dob = `${day}-${month}-${year}`;
     dispatch(
                  newUserDataRequest({dob
                    
                  })
                );
    console.log(dob)
    navigation.navigate("LocationScreen", { dob });
  };

  return (
    <BackgroundPagesOne>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          {/* 🔹 TITLE */}
          <Text style={styles.title}>When’s your Spark day</Text>

          {/* 🔹 LABELS */}
          <View style={styles.labelRow}>
            <Text style={styles.label}>Month</Text>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.label}>Year</Text>
          </View>

          {/* 🔹 INPUTS */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="MM"
              placeholderTextColor="#aaa"
              keyboardType="number-pad"
              maxLength={2}
              value={month}
              onChangeText={setMonth}
            />

            <TextInput
              style={styles.input}
              placeholder="DD"
              placeholderTextColor="#aaa"
              keyboardType="number-pad"
              maxLength={2}
              value={day}
              onChangeText={setDay}
            />

            <TextInput
              style={[styles.input, styles.yearInput]}
              placeholder="YYYY"
              placeholderTextColor="#aaa"
              keyboardType="number-pad"
              maxLength={4}
              value={year}
              onChangeText={setYear}
            />
          </View>

          {/* 🔹 CONTINUE BUTTON */}
          <TouchableOpacity
            disabled={!isValid}
            onPress={handleContinue}
            style={[
              styles.button,
              { opacity: isValid ? 1 : 0.4 },
            ]}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </BackgroundPagesOne>
  );
};

export default DobScreen;

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 120,marginTop:"9%"
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 50,
    textAlign: "center",
  },

  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 10,
  },

  label: {
    color: "#aaa",
    fontSize: 14,
  },

  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },

  input: {
    width: 70,
    height: 48,
    borderWidth: 1.5,
    borderColor: "#C724C7",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 16,
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  yearInput: {
    width: 90,
  },

  button: {
    marginTop: "50%",
    width: "80%",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#2a072aff",
    borderWidth: 3,
    borderColor: "#f896f8ff",

    // ✨ Glow / Shadow
    shadowColor: "#f896f8ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
