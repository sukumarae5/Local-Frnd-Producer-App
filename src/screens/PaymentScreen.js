import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import RazorpayCheckout from "react-native-razorpay";
import { useDispatch, useSelector } from "react-redux";
import { verifyPaymentRequest } from "../features/purchase/purchaseActions";

const PaymentScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();

  const { order, package: pkg } = route.params;

  const { loading, paymentSuccess, error } = useSelector(
    (state) => state.purchase
  );

  /* =============================
     HANDLE SUCCESS / FAILURE
  ============================= */
  useEffect(() => {
    if (paymentSuccess) {
      navigation.replace("PaymentSuccessScreen");
    }

    if (error) {
      Alert.alert("Payment Failed", error);
    }
  }, [paymentSuccess, error]);

  /* =============================
     RAZORPAY
  ============================= */
  const handlePayment = () => {
    const options = {
      key: "rzp_test_GRRNoJBdPElkDv", // 🔥 replace with real key
      amount: order.amount,
      currency: "INR",
      name: "Lokal Frnd",
      description: "Coin Purchase",
      order_id: order.order_id,
      prefill: {
        contact: "9999999999",
        email: "test@gmail.com"
      },
      theme: { color: "#9333EA" }
    };

    RazorpayCheckout.open(options)
      .then((data) => {
        console.log("✅ PAYMENT SUCCESS:", data);

        dispatch(
          verifyPaymentRequest({
            razorpay_order_id: data.razorpay_order_id,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_signature: data.razorpay_signature,
            package_id: pkg.id
          })
        );
      })
      .catch((err) => {
        console.log("❌ PAYMENT FAILED:", err);

        Alert.alert(
          "Payment Failed",
          err?.description || "Something went wrong"
        );
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Details</Text>

      <View style={styles.card}>
        <Text style={styles.plan}>Coin Package</Text>
        <Text style={styles.amount}>₹ {order.amount / 100}</Text>
      </View>

      {/* 🔥 LOADING STATE */}
      {loading ? (
        <ActivityIndicator size="large" color="#9333EA" />
      ) : (
        <LinearGradient
          colors={["#7C3AED", "#D946EF"]}
          style={styles.payBtn}
        >
          <TouchableOpacity onPress={handlePayment}>
            <Text style={styles.payText}>
              PAY ₹ {order.amount / 100}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      )}

      {/* 🔥 FAILED UI */}
      {error && (
        <Text style={styles.errorText}>
          Payment Failed: {error}
        </Text>
      )}
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff"
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20
  },

  card: {
    backgroundColor: "#f3f3f3",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },

  plan: { fontSize: 16 },

  amount: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5
  },

  payBtn: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: "center"
  },

  payText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700"
  },

  errorText: {
    marginTop: 20,
    color: "red",
    textAlign: "center"
  }
});