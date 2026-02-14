import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");
const wp = (v) => (width * v) / 100;
const hp = (v) => (height * v) / 100;

/* same static data – only moved here */
const activePals = [
  { id: 1, name: "Aadhya", img: require("../assets/girl1.jpg") },
  { id: 2, name: "Yuvaan", img: require("../assets/boy1.jpg") },
  { id: 3, name: "Luna", img: require("../assets/girl2.jpg") },
  { id: 4, name: "Hannah", img: require("../assets/girl3.jpg") },
  { id: 5, name: "Aarav", img: require("../assets/boy2.jpg") },
];

const LikeMindedSection = () => {
  return (
    <View>
      <Text style={styles.sectionLabel}>Like Minded People</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: wp(2) }}
      >
        {activePals.map((p) => (
          <View key={p.id} style={styles.likeCard}>
            <Image source={p.img} style={styles.likeAvatar} />
            <Text style={styles.likeName}>{p.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default LikeMindedSection;

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: wp(5),
    fontWeight: "700",
    color: "#111",
    marginTop: hp(3),
    marginBottom: hp(1),
  },

  likeCard: {
    alignItems: "center",
    marginRight: wp(4),
  },

  likeAvatar: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    borderWidth: 2,
    borderColor: "#C4B5FD",
  },

  likeName: {
    fontSize: wp(3.2),
    color: "#222",
    marginTop: hp(0.5),
    fontWeight: "600",
  },
});
