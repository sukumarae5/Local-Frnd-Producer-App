import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView ,
  SafeAreaView,
  StatusBar,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import RazorpayCheckout from "react-native-razorpay";

import { useDispatch, useSelector } from "react-redux";
import {
  verifyPaymentRequest,
  resetPurchase,
} from "../features/purchase/purchaseActions";

const PaymentScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();

  const { order, package: pkg } = route.params;

  const { loading, paymentSuccess } = useSelector(
    state => state.purchase
  );

  useEffect(() => {
    dispatch(resetPurchase());
  }, []);

  useEffect(() => {
    if (paymentSuccess) {
      navigation.replace("PaymentSuccessScreen");
    }
  }, [paymentSuccess]);

  const handlePayment = () => {

    dispatch(resetPurchase());

    const options = {
      key: "rzp_test_GRRNoJBdPElkDv",
      amount: order.amount,
      currency: "INR",
      name: "Lokal Frnd",
      description: "Coin Purchase",
      order_id: order.order_id,
      prefill: {
        contact: "9999999999",
        email: "test@gmail.com",
      },
      theme: {
        color: "#9333EA",
      },
    };

    RazorpayCheckout.open(options)
      .then((data) => {
        dispatch(
          verifyPaymentRequest({
            razorpay_order_id: data.razorpay_order_id,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_signature: data.razorpay_signature,
            package_id: pkg.id,
          })
        );
      })
      .catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#7B2FF7"
        barStyle="light-content"
      />

      {/* HEADER */}
       <ScrollView
  style={{ flex: 1 }}
  contentContainerStyle={styles.scrollContent}
  showsVerticalScrollIndicator={false}
>

      <LinearGradient
        colors={["#7B2FF7", "#F107A3"]}
        style={styles.header}
      >
        <Icon
          name="wallet-plus"
          color="#fff"
          size={42}
        />

        <Text style={styles.headerTitle}>
          Coin Purchase
        </Text>

        <Text style={styles.headerSub}>
          Fast & Secure Payment
        </Text>
      </LinearGradient>

      {/* CARD */}

      <View style={styles.card}>

        <View style={styles.coinCircle}>
          <Icon
            name="cash-100"
            color="#FFD700"
            size={48}
          />
        </View>

        <Text style={styles.coinText}>
          {pkg.coins} Coins
        </Text>

        <Text style={styles.price}>
          ₹ {order.amount / 100}
        </Text>

        <Text style={styles.save}>
          Instant Credit After Payment
        </Text>

      </View>

      {/* DETAILS */}

      <View style={styles.details}>

        <Text style={styles.sectionTitle}>
          Order Summary
        </Text>

        <View style={styles.row}>
          <Text>Coin Package</Text>
          <Text>{pkg.coins} Coins</Text>
        </View>

        <View style={styles.row}>
          <Text>Payment</Text>
          <Text>Razorpay</Text>
        </View>

        <View style={styles.row}>
          <Text>GST</Text>
          <Text>Included</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.total}>
            Total
          </Text>

          <Text style={styles.total}>
            ₹ {order.amount / 100}
          </Text>
        </View>

      </View>

      {/* SECURITY */}

      <View style={styles.secureBox}>

        <Icon
          name="shield-check"
          size={24}
          color="#4CAF50"
        />

        <Text style={styles.secureText}>
          100% Secure Payment Powered by Razorpay
        </Text>

      </View>

      {/* BUTTON */}
 
  </ScrollView>

       {loading ? (
    <ActivityIndicator
      style={styles.loader}
      size="large"
      color="#9333EA"
    />
  ) : (
    <View style={styles.bottomContainer}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePayment}
      >
        <LinearGradient
          colors={["#7B2FF7", "#F107A3"]}
          style={styles.button}
        >
          <Icon
            name="lock"
            color="#fff"
            size={20}
          />

          <Text style={styles.buttonText}>
            PAY ₹ {order.amount / 100}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )}
</SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#F7F8FC"
},

header:{
height:220,
justifyContent:"center",
alignItems:"center",
borderBottomLeftRadius:35,
borderBottomRightRadius:35
},

headerTitle:{
fontSize:26,
fontWeight:"700",
color:"#fff",
marginTop:10
},

headerSub:{
color:"#fff",
marginTop:6,
fontSize:15,
opacity:.9
},

card:{
backgroundColor:"#fff",
marginHorizontal:22,
marginTop:-45,
borderRadius:25,
padding:25,
alignItems:"center",
elevation:10
},

coinCircle:{
width:90,
height:90,
borderRadius:45,
backgroundColor:"#FFF8E1",
justifyContent:"center",
alignItems:"center"
},

coinText:{
fontSize:28,
fontWeight:"700",
marginTop:18,
color:"#222"
},

price:{
fontSize:34,
fontWeight:"800",
color:"#7B2FF7",
marginTop:10
},

save:{
marginTop:8,
color:"#888"
},

details:{
backgroundColor:"#fff",
margin:20,
padding:20,
borderRadius:20,
elevation:3
},

sectionTitle:{
fontSize:18,
fontWeight:"700",
marginBottom:15
},

row:{
flexDirection:"row",
justifyContent:"space-between",
marginVertical:10
},

divider:{
height:1,
backgroundColor:"#ECECEC",
marginVertical:12
},

total:{
fontSize:18,
fontWeight:"700"
},

secureBox:{
flexDirection:"row",
alignItems:"center",
backgroundColor:"#fff",
marginHorizontal:20,
padding:16,
borderRadius:18,
elevation:2
},

secureText:{
marginLeft:12,
fontWeight:"600",
color:"#444",
flex:1
},

button: {
  height: 58,
  borderRadius: 18,
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
},

buttonText:{
color:"#fff",
fontSize:18,
fontWeight:"700",
marginLeft:10
},
scrollContent: {
  flexGrow: 1,
  paddingBottom: 120, // enough space for fixed button
},

bottomContainer: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "#fff",
  paddingHorizontal: 20,
  paddingTop: 15,
  paddingBottom: 25,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,

  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: {
    width: 0,
    height: -5,
  },
  elevation: 20,
},

loader: {
  position: "absolute",
  bottom: 40,
  alignSelf: "center",
},

});