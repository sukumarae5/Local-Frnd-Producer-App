import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  userRegisterRequest,
  userLoginRequest,
  authReset,
} from "../features/Auth/authAction";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

const PhoneScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { success } = useSelector((state) => state.auth);

  const [mobile_number, setMobile_number] = useState("");
  const phoneInputRef = useRef(null);

  const handlePhoneChange = (text) => {
    const numeric = text.replace(/[^0-9]/g, "");
    if (numeric.length <= 10) setMobile_number(numeric);
  };

  useEffect(() => {
    dispatch(authReset());
  }, []);

  useEffect(() => {
    if (success === null) return;

    if (success === true) {
      navigation.navigate("Otp", { mobile_number });
    }

    if (success === false) {
      dispatch(userLoginRequest({ mobile_number }));
      navigation.navigate("Otp", { mobile_number });
    }
  }, [success]);

  const handleNext = () => {
    if (mobile_number.length !== 10) {
      Alert.alert("Invalid", "Please enter a valid 10 digit number");
      return;
    }
    dispatch(userRegisterRequest({ mobile_number }));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color="#181717" />
        </TouchableOpacity>

        <View style={styles.container}>
          {/* TOP */}
          <View style={styles.topWrapper}>
            <View style={styles.topPurple}>
              <Image
                source={require("../assets/leftheart.png")}
                style={styles.topLeftHeart}
              />
              <Image
                source={require("../assets/rightheart.png")}
                style={styles.topRightHeart}
              />
              <Image
                source={require("../components/BackgroundPages/main_log1.png")}
                style={styles.logo}
              />
            </View>

            <Svg width={width} height={160} style={{ position: "absolute", bottom: -1 }}>
              <Path
                d={`
                  M0 90
                  C ${width * 0.2} 20, ${width * 0.8} 160, ${width} 90
                  L ${width} 160
                  L 0 160
                  Z   
                `}
                fill="#fff"
              />
            </Svg>
          </View>

          {/* BOTTOM */}
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.bottomWrapper}>
              <View style={styles.headerWrapper}>
                <Text style={styles.title}>Sign Up With</Text>
                <Text style={styles.subTitle}>Phone Number</Text>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <Icon name="call-outline" size={18} style={styles.phoneIcon} />
                  <Text style={styles.label}>Mobile Number</Text>
                </View>

                <TextInput
                  ref={phoneInputRef}
                  style={styles.input}
                  placeholder="Enter phone number"
                  placeholderTextColor="#bbb"
                  keyboardType="number-pad"
                  value={mobile_number}
                  onChangeText={handlePhoneChange}
                  maxLength={10}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  mobile_number.length === 10 ? styles.nextActive : styles.nextDisabled,
                ]}
                disabled={mobile_number.length !== 10}
                onPress={handleNext}
                activeOpacity={0.7}
              >
                <Text style={styles.nextText}>CONTINUE</Text>
              </TouchableOpacity>

              <Text style={styles.helpText}>
                Need Help <Text style={styles.clickHere}>Click Here..</Text>
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topWrapper: { width: "100%", height: height * 0.38, position: "relative" },
  topPurple: {
    backgroundColor: "#EBCDFC",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  topLeftHeart: {
    position: "absolute",
    top: 140,
    left: -10,
    width: 130,
    height: 130,
    resizeMode: "contain",
  },
  topRightHeart: {
    position: "absolute",
    top: 120,
    right: -40,
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  logo: { width: 120, height: 120, resizeMode: "contain" },
  bottomWrapper: {
    backgroundColor: "#fff",
    flex: 1,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 5,
    padding: 4,
    zIndex: 10,
  },
  headerWrapper: { alignItems: "center", marginTop: -40, marginBottom: 25 },
  title: { fontSize: 22, fontWeight: "700", color: "#161616" },
  subTitle: { fontSize: 16, color: "#555" },
  inputContainer: { width: "100%", marginTop: 40, marginBottom: 150 },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  phoneIcon: { marginRight: 6, color: "#C724C7" },
  label: { fontSize: 18, fontWeight: "500", color: "#151414" },
  input: {
    borderWidth: 1,
    borderColor: "#C724C7",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 16 : 12,
    fontSize: 17,
    color: "#5a555a",
  },
  nextButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  nextDisabled: { backgroundColor: "#444" },
  nextActive: { backgroundColor: "#bb78ee" },
  nextText: { color: "#fff", fontSize: 18, fontWeight: "700", letterSpacing: 1 },
  helpText: { textAlign: "center", marginTop: 25, fontSize: 15, color: "#555" },
  clickHere: { color: "#B023E8", fontWeight: "600" },
});

export default PhoneScreen;
