import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

const PaymentSuccessScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🎉</Text>

      <Text style={styles.title}>Payment Successful</Text>

      <Text style={styles.subtitle}>
        Coins added to your wallet successfully
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.btnText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff"
  },

  icon: {
    fontSize: 60
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10
  },

  subtitle: {
    marginTop: 10,
    color: "#555",
    textAlign: "center",
    paddingHorizontal: 20
  },

  btn: {
    marginTop: 25,
    backgroundColor: "#9333EA",
    padding: 14,
    borderRadius: 10,
    width: 180,
    alignItems: "center"
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold"
  }
});