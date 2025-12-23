import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
} from "react-native";
import BackgroundPagesOne from "../components/BackgroundPages/BackgroundPagesOne";

const LandingScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("OnboardScreen");
    }, 3000); // ⏱ 3 seconds

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <BackgroundPagesOne>
      <View style={styles.container}>
        {/* Center Logo */}
        <Image
          source={require("../components/BackgroundPages/log4.png")}

          style={styles.logo}
        />
      </View>
    </BackgroundPagesOne>
  );
};

export default LandingScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
});
