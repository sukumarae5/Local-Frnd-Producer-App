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
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Svg, { Path } from "react-native-svg";
import { userOtpRequest } from "../features/Auth/authAction";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const OTP_LENGTH = 6;

const OtpScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { mode, Otp } = useSelector((state) => state.auth);

  console.log("📩 OTP STATE:", Otp);

  const mobile_number = route?.params?.mobile_number;
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!mobile_number) {
      Alert.alert("Error", "Mobile number missing");
      navigation.goBack();
    }
  }, []);

  const handleChange = (text, idx) => {
    const char = text ? text.slice(-1) : "";
    const newOtp = [...otp];
    newOtp[idx] = char;
    setOtp(newOtp);

    if (char && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus?.();
    }
  };

  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus?.();
    }
  };

  const handleOtpSubmit = () => {
    if (!mobile_number) {
      Alert.alert("Error", "Mobile number missing");
      return;
    }

    const otpString = otp.join("");
    if (otpString.length !== OTP_LENGTH) {
      Alert.alert("Error", "Please enter 6 digit OTP");
      return;
    }

    dispatch(userOtpRequest({ mobile_number, otp: otpString }));
  };

  useEffect(() => {
    if (!Otp) return;

    if (Otp.success === false) {
      Alert.alert("Invalid OTP", Otp.message || "Try again");
      return;
    }

    if (!Otp.success) return;

    const handleSuccess = async () => {
      try {
        console.log("✅ OTP VERIFIED SUCCESSFULLY");

        // 1️⃣ Save auth data
        await AsyncStorage.setItem("twittoke", Otp.token ?? "");
        await AsyncStorage.setItem("user_id", String(Otp.user?.user_id ?? ""));
        await AsyncStorage.setItem("gender", Otp.user?.gender ?? "");

        // 2️⃣ Confirm token is really stored
        const savedToken = await AsyncStorage.getItem("twittoke");
        console.log("🔑 TOKEN IN STORAGE:", savedToken);

        if (!savedToken) {
          console.log("❌ TOKEN NOT SAVED — STOPPING SOCKET CONNECT");
          Alert.alert("Error", "Login failed. Please try again.");
          return;
        }

        // 3️⃣ Connect socket AFTER login (VERY IMPORTANT)
        console.log("🔌 Connecting socket after login...");
        
        // 4️⃣ Navigate to correct home screen
        if (mode === "login") {
          navigation.reset({
            index: 0,
            routes: [
              {
                name:
                  Otp.user.gender === "Male"
                    ? "MaleHomeTabs"
                    : "ReceiverBottomTabs",
              },
            ],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: "SelectYourCountryScreen" }],
          });
        }

      } catch (err) {
        console.error("❌ OTP FLOW ERROR:", err);
        Alert.alert("Error", "Something went wrong");
      }
    };

    handleSuccess();

  }, [Otp]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="chevron-back" size={26} color="#000" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* TOP SECTION */}
        <View style={styles.topWrapper}>
          <View style={styles.topPurple}>
            <Image
              source={require("../assets/leftheart.png")}
              style={styles.leftHeart}
            />
            <Image
              source={require("../assets/rightheart.png")}
              style={styles.rightHeart}
            />
            <Image
              source={require("../components/BackgroundPages/main_log1.png")}
              style={styles.logo}
            />
          </View>

          <Svg width={width} height={140} style={{ position: "absolute", bottom: -1 }}>
            <Path
              d={`
                M0 80
                C ${width * 0.2} 20, ${width * 0.8} 160, ${width} 80
                L ${width} 140
                L 0 140
                Z
              `}
              fill="#fff"
            />
          </Svg>
        </View>

        {/* BOTTOM SECTION */}
        <View style={styles.bottomSection}>
          <Text style={styles.title}>Verification OTP</Text>
          <Text style={styles.subtitle}>OTP sent on your mobile Number</Text>

          <View style={styles.otpContainer}>
            {otp.map((v, idx) => (
              <TextInput
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                style={styles.otpInput}
                maxLength={1}
                keyboardType="numeric"
                value={v}
                onChangeText={(t) => handleChange(t, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
              />
            ))}
          </View>

          <Text style={styles.resendText}>Resend in 10 Sec.</Text>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleOtpSubmit}
          >
            <Text style={styles.continueText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  topWrapper: {
    height: height * 0.42,
    width: "100%",
    position: "relative",
  },
  topPurple: {
    backgroundColor: "#EBCDFC",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  leftHeart: {
    position: "absolute",
    top: 190,
    left: -20,
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  rightHeart: {
    position: "absolute",
    top: 160,
    right: -30,
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: "contain",
  },
  bottomSection: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 0,
    padding: 6,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#161616",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginBottom: 39,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingHorizontal: 25,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderBottomWidth: 2,
    borderColor: "#B023E8",
    textAlign: "center",
    fontSize: 22,
    color: "#000",
  },
  resendText: {
    textAlign: "center",
    marginTop: 5,
    color: "#B023E8",
    fontSize: 14,
  },
  continueButton: {
    marginTop: 190,
    backgroundColor: "#B023E8",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
