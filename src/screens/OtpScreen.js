import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AnimatedLogo from "../components/SampleLogo/AnimatedLogo";
import BackgroundPagesOne from "../components/BackgroundPages/BackgroundPagesOne";
import { userLoginRequest, userOtpRequest } from "../features/Auth/authAction";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

const {width}=Dimensions.get("window")
const OTP_LENGTH = 6;

const OtpScreen = ({ route, navigation }) => {
    const { success, mode, Otp } = useSelector((state) => state.auth);
    if (!route.params) return null;   // ✔️ SAFE (after hooks)


  console.log(success) 
  console.log(mode) 
  console.log(Otp) 
  const { mobile_number } = route.params;
  const dispatch = useDispatch();
  



  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  // callback refs array so focus() always refers to real TextInput
  const inputRefs = useRef([]);

  // change handler: handles typing and deletion robustly
  const handleChange = (text, idx) => {
    // keep only last char if user pastes
    const char = text ? text.slice(-1) : "";

    const newOtp = [...otp];
    newOtp[idx] = char;
    setOtp(newOtp);

    if (char) {
      // move forward
      if (idx < OTP_LENGTH - 1) {
        const next = inputRefs.current[idx + 1];
        if (next && next.focus) next.focus();
      } else {
        // optionally blur last input to hide keyboard
        const cur = inputRefs.current[idx];
        if (cur && cur.blur) cur.blur();
      }
    } else {
      // if cleared this input, move focus to previous (helpful on Android)
      if (idx > 0) {
        const prev = inputRefs.current[idx - 1];
        if (prev && prev.focus) prev.focus();
      }
    }
  };

  // onKeyPress fallback (keeps your Backspace behavior for platforms that support it)
  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent && e.nativeEvent.key === "Backspace") {
      // if current already empty, move to previous and clear it
      if (!otp[idx] && idx > 0) {
        const newOtp = [...otp];
        newOtp[idx - 1] = "";
        setOtp(newOtp);
        const prev = inputRefs.current[idx - 1];
        if (prev && prev.focus) prev.focus();
      } else {
        const newOtp = [...otp];
        newOtp[idx] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleotp = () => {
    const otpString = otp.join("");
    dispatch(userOtpRequest({ mobile_number, otp: otpString }));
    
  };

  // OTP response handling unchanged
  useEffect(() => {
    if (!Otp) return;

    if (Otp.success === false) {
      Alert.alert("Invalid OTP", Otp.message || "Please try again.");
      return;
    }

    const saveTokenAndNavigate = async () => {
      if (Otp.success === true && Otp.token) { 
        
        try {
          await AsyncStorage.setItem("twittoke", (Otp.token));
          await AsyncStorage.setItem("user_id", `${Otp.user.user_id}`);

          if (mode === "login") {
            navigation.navigate("Home");
          } else {
            navigation.navigate("LanguageScreen");
          }
        } catch (err) {
          console.log("Error saving token:", err);
        }
      }
    };

    saveTokenAndNavigate();
  }, [Otp, mode, navigation]);

  return (
    <BackgroundPagesOne>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inner}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="chevron-back" size={26} color="#fff" />
            </TouchableOpacity>

            {/* <View style={styles.logoSpace}>
              <AnimatedLogo />
            </View> */}

            <Text style={styles.title}>Verification Code</Text>
            <Text style={styles.subTitle}>
              We’ve sent a 6-digit code to your number.
            </Text>

            <View style={styles.otpContainer}>
              {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
                <TextInput
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  style={styles.otpInput}
                  maxLength={1}
                  keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
                  value={otp[idx]}
                  onChangeText={(text) => handleChange(text, idx)}
                  onKeyPress={(e) => handleKeyPress(e, idx)}
                  autoFocus={idx === 0}
                  returnKeyType="done"
                  // helpful for OTP autofill on iOS/Android
                  textContentType="oneTimeCode"
                  importantForAutofill="yes"
                  autoComplete={Platform.OS === "android" ? "sms-otp" : undefined}
                />
              ))}
            </View>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn’t get the code? </Text>
              <TouchableOpacity>
                <Text style={styles.resendLink}>Resend</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleotp}>
  <Text style={styles.nextText}>Verify</Text>
</TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BackgroundPagesOne>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  inner: { flex: 1, paddingHorizontal: 25, paddingTop: 60, paddingBottom: 40 },
  backButton: { position: "absolute", top: 40, left: 20, zIndex: 10 },
  
  title: {
    marginTop:"25%",
    fontSize: 30,
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  subTitle: { color: "#aaa", fontSize: 14, textAlign: "center", marginBottom: 60,marginTop:"3%" },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginBottom: 25,
  },
  otpInput: {
    width: 49,
    height: 55,
    borderWidth: 1,
    borderColor: "#C724C7",
    borderRadius: 10,
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    backgroundColor: "rgba(43, 32, 38, 0.13)",
  },
  resendContainer: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  resendText: { color: "#aaa", fontSize: 14 },
  resendLink: { color: "#b784ff", fontSize: 14, textDecorationLine: "underline" },
  nextButton: {
  marginTop: 60,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 16,
  paddingVertical: 14,
  backgroundColor: "#2a072aff",
  width: "60%",
  marginLeft: "23%",

  // ✅ Border
  borderWidth: 1,
  borderColor: "#f896f8ff",

  // ✅ Shadow for iOS
  shadowColor: "#f080f0ff",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.9,
  shadowRadius: 19,

  // ✅ Shadow for Android
  elevation: 20,
},

nextText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "600",
  letterSpacing: 1,
},

});
