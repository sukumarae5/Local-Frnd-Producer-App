// ProcessingScreen.js

import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";

const ProcessingScreen = ({ navigation, route }) => {
  const { order } = useSelector((state) => state.purchase);

  useEffect(() => {
    if (order) {
      setTimeout(() => {
        navigation.replace("PaymentScreen", {
          order,
          package: route.params.package
        });
      }, 1500); // 🔥 1.5 sec delay
    }
  }, [order]);

  return (
    <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
      <ActivityIndicator size="large" color="#9333EA" />

      <Text style={{ marginTop:20, fontSize:18, fontWeight:"600" }}>
        Processing Payment...
      </Text>
    </View>
  );
};

export default ProcessingScreen;