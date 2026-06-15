import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  createWithdrawRequest,
  resetWithdrawState
} from "../features/withdraw/withdrawAction";

const MIN_WITHDRAW = 10;

const WithdrawFormScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();

  const { withdrawSuccess, error, createLoading } = useSelector(
    state => state.withdraw
  );

  const { rings } = route.params;
  const [upi, setUpi] = useState("");

  const validate = () => {
    if (rings < MIN_WITHDRAW) {
      Alert.alert("Error", `Minimum ${MIN_WITHDRAW} rings required`);
      return false;
    }

    if (!upi) {
      Alert.alert("Error", "UPI ID is required");
      return false;
    }

    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (!upiRegex.test(upi)) {
      Alert.alert("Error", "Enter valid UPI ID");
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    dispatch(
      createWithdrawRequest({
        rings,
        upi_id: upi
      })
    );
  };

  useEffect(() => {
    if (withdrawSuccess) {
      Alert.alert(
        "Request Submitted",
        "Withdraw is processing ⏳"
      );

      setUpi("");
      dispatch(resetWithdrawState());
      navigation.goBack();
    }

    if (error) {
      Alert.alert("Error", error);
      dispatch(resetWithdrawState());
    }
  }, [withdrawSuccess, error]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Withdraw Money</Text>

      <View style={styles.card}>
        <Text>Available Rings</Text>
        <Text style={styles.value}>{rings}</Text>

        <Text>You will receive</Text>
        <Text style={styles.money}>
          ₹{(rings * 1.2).toFixed(0)}
        </Text>
      </View>

      <TextInput
        placeholder="Enter UPI ID"
        value={upi}
        onChangeText={setUpi}
        style={styles.input}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={createLoading}
        style={[
          styles.button,
          { opacity: createLoading ? 0.6 : 1 }
        ]}
      >
        {createLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Withdraw</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default WithdrawFormScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, textAlign: "center", marginBottom: 20 },
  card: { padding: 15, backgroundColor: "#F3E8FF", borderRadius: 10 },
  value: { fontSize: 22, fontWeight: "bold" },
  money: { fontSize: 18, color: "#7C3AED" },
  input: { borderWidth: 1, padding: 10, marginTop: 15 },
  button: {
    backgroundColor: "#7C3AED",
    padding: 15,
    marginTop: 15,
    alignItems: "center"
  },
  buttonText: { color: "#fff" }
});