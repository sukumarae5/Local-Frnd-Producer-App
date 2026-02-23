import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const { width, height } = Dimensions.get("window");
const wp = (v) => (width * v) / 100;
const hp = (v) => (height * v) / 100;

const activePals = [
  { id: 1, name: "Anamika", img: require("../assets/girl1.jpg") },
  { id: 2, name: "Priya", img: require("../assets/girl2.jpg") },
  { id: 3, name: "Anushka", img: require("../assets/girl3.jpg") },
  { id: 4, name: "Dhanika", img: require("../assets/girl1.jpg") },
];

const LikeMindedSection = () => {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.dottedRing}>

        <View style={styles.solidRing}>
          <Image source={item.img} style={styles.avatar} />
        </View>

        <View style={styles.heartIcon}>
          <Icon name="heart" size={wp(4)} color="#06f86f" />
        </View>

        <View style={styles.phoneIcon}>
          <Icon name="call" size={wp(4)} color="#b671fb" />
        </View>

        <View style={styles.chatIcon}>
          <Icon name="chatbubble-ellipses-outline" size={wp(4)} color="#b671fb" />
        </View>

        <View style={styles.locationIcon}>
          <Icon name="location" size={wp(4)} color="#b671fb" />
        </View>

      </View>

      <View style={styles.namePill}>
        <Text style={styles.nameText}>{item.name}</Text>
      </View>
    </View>
  );

  return (
    <View>
      <Text style={styles.sectionLabel}>Like Minded</Text>

      <FlatList
  data={activePals}
  horizontal
  keyExtractor={(item) => item.id.toString()}
  renderItem={renderItem}
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{
    paddingHorizontal: wp(4),
    paddingTop: hp(2),   // 🔥 ADD THIS
  }}
/>

    </View>
  );
};

export default LikeMindedSection;
const styles = StyleSheet.create({

  sectionLabel: {
    fontSize: wp(5),
    fontWeight: "700",
     paddingTop: hp(2),
    paddingHorizontal: wp(4),
  
  },

  card: {
    width: wp(36),   // 🔥 THIS MAKES SCROLL WORK
    alignItems: "center",
    marginLeft: wp(-5),
    overflow: "visible",
  },

  dottedRing: {
    width: wp(23),
    height: wp(23),
    borderRadius: wp(13),
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#C084FC",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
     overflow: "visible",
  },

  solidRing: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(10.5),
    borderWidth: 17,
    borderColor: "#c473d6",
    justifyContent: "center",
    alignItems: "center",
  },

  avatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(8.5),
  },

  heartIcon: {
    position: "absolute",
    top: -8,
    right: -8,
    width: wp(6),
    height: wp(6),
    borderRadius: wp(4),
    backgroundColor: "#d877fb",
    justifyContent: "center",
    alignItems: "center",
  },

  phoneIcon: {
    position: "absolute",
    top: -8,
    left: -8,
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: "center",
    alignItems: "center",
  },

  chatIcon: {
    position: "absolute",
    bottom: -8,
    left: -8,
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: "center",
    alignItems: "center",
  },

  locationIcon: {
    position: "absolute",
    bottom: -8,
    right: -8,
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: "center",
    alignItems: "center",
  },

  namePill: {
    marginTop: hp(1.5),
    backgroundColor: "#F3E8FF",
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.6),
    borderRadius: wp(6),
  },

  nameText: {
    fontSize: wp(3.5),
    fontWeight: "600",
  },
});
