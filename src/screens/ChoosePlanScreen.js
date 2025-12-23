import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";

const plans = [
  {
    id: 1,
    title: "1 Month Plan",
    oldPrice: "₹600",
    discount: "Save 50%",
    price: "₹300",
  },
  {
    id: 2,
    title: "3 Months Plan",
    oldPrice: "₹900",
    discount: "Save 30%",
    price: "₹600",
  },
  {
    id: 3,
    title: "6 Months Plan",
    oldPrice: "₹1,200",
    discount: "Save 25%",
    price: "₹900",
  },
  {
    id: 4,
    title: "1 Year Plan",
    oldPrice: "₹1,400",
    discount: "Save 21%",
    price: "₹1,100",
    popular: true,
  },
];

const ChoosePlanScreen = ({ navigation }) => {
  const [selected, setSelected] = useState(4);

  return (
    <LinearGradient
      colors={["#7C0B70", "#4A0450", "#3A0145"]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safe}>
        {/* Back */}
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Choose a subscription plan to unlock all{"\n"}
          the functionality of the Local Friend 😄
        </Text>

        {/* Plans */}
        <View style={styles.planWrapper}>
          {plans.map((item) => {
            const active = selected === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={() => setSelected(item.id)}
                style={[
                  styles.card,
                  active && styles.activeCard,
                ]}
              >
                {item.popular && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Most Popular</Text>
                  </View>
                )}

                <View>
                  <Text style={styles.planTitle}>{item.title}</Text>
                  <View style={styles.row}>
                    <Text style={styles.oldPrice}>{item.oldPrice}</Text>
                    <Text style={styles.save}> {item.discount}</Text>
                  </View>
                </View>

                <Text style={styles.price}>{item.price}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Continue */}
        <TouchableOpacity style={styles.continueBtn}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ChoosePlanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safe: {
    flex: 1,
    paddingHorizontal: 20,
  },

  backBtn: {
    marginTop: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: "#E8C5E6",
    textAlign: "center",
  },

  planWrapper: {
    marginTop: 30,
  },

  card: {
    backgroundColor: "#6B0F63",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  activeCard: {
    backgroundColor: "#C12AC8",
    borderWidth: 2,
    borderColor: "#FF6BFF",
  },

  planTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  row: {
    flexDirection: "row",
    marginTop: 6,
  },

  oldPrice: {
    fontSize: 12,
    color: "#F1B3EC",
    textDecorationLine: "line-through",
  },

  save: {
    fontSize: 12,
    color: "#F1B3EC",
  },

  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  badge: {
    position: "absolute",
    top: -10,
    left: 18,
    backgroundColor: "#FF63FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  continueBtn: {
    marginTop: "auto",
    marginBottom: 26,
    backgroundColor: "#C12AC8",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  continueText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
