// PaymentScreen.js

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import RazorpayCheckout from "react-native-razorpay";
import { useDispatch } from "react-redux";
import { verifyPaymentRequest } from "../features/purchase/purchaseActions";

const PaymentScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();

  const { order, package: pkg } = route.params;

  const handlePayment = () => {
    const options = {
      key: "YOUR_RAZORPAY_KEY",
      amount: order.amount,
      currency: "INR",
      name: "Your App",
      description: "Coin Purchase",
      order_id: order.order_id,
      theme: { color: "#9333EA" },
    };

    RazorpayCheckout.open(options)
      .then((data) => {
        // ✅ VERIFY
        dispatch(
          verifyPaymentRequest({
            razorpay_order_id: data.razorpay_order_id,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_signature: data.razorpay_signature,
            package_id: pkg.id,
          })
        );

        navigation.replace("SuccessScreen");
      })
      .catch((err) => {
        alert("Payment Failed");
        navigation.goBack();
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Details</Text>

      <View style={styles.card}>
        <Text style={styles.plan}>Coin Package</Text>
        <Text style={styles.amount}>₹ {order.amount / 100}</Text>
      </View>

      <Text style={styles.sub}>Select Payment Method</Text>

      <View style={styles.option}>
        <Text>Credit / Debit Card</Text>
      </View>

      <View style={styles.option}>
        <Text>UPI</Text>
      </View>

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
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:"#fff" },

  title: { fontSize:20, fontWeight:"700", marginBottom:20 },

  card: {
    backgroundColor:"#f3f3f3",
    padding:15,
    borderRadius:10,
    marginBottom:20
  },

  plan: { fontSize:16 },

  amount: { fontSize:22, fontWeight:"bold", marginTop:5 },

  sub: { marginBottom:10, fontWeight:"600" },

  option: {
    padding:15,
    borderWidth:1,
    borderRadius:10,
    marginBottom:10
  },

  payBtn: {
    marginTop:20,
    padding:15,
    borderRadius:10,
    alignItems:"center"
  },

  payText: {
    color:"#fff",
    fontSize:16,
    fontWeight:"700"
  }
});