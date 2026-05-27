import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  Animated,
  Easing,
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

  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateRipple = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateRipple(ripple1, 0);
    animateRipple(ripple2, 800);
  }, []);

  const rippleStyle1 = {
    position: "absolute",
    width: wp(23),
    height: wp(23),
    borderRadius: wp(13),
    backgroundColor: "rgba(226,133,251,0.25)",
    transform: [
      {
        scale: ripple1.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.6],
        }),
      },
    ],
    opacity: ripple1.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    }),
  };

  const rippleStyle2 = {
    position: "absolute",
    width: wp(23),
    height: wp(23),
    borderRadius: wp(13),
    backgroundColor: "rgba(226,133,251,0.25)",
    transform: [
      {
        scale: ripple2.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.6],
        }),
      },
    ],
    opacity: ripple2.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    }),
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.dottedRing}>

        {/* Ripple Effect */}
        <Animated.View style={rippleStyle1} />
        <Animated.View style={rippleStyle2} />

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
          paddingTop: hp(2),
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
  color: "#000", // ✅ FIX
},

  card: {
    width: wp(36),
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
    width: wp(17),
    height: wp(17),
    borderRadius: wp(10.5),
    borderWidth: 17,
    borderColor: "#c20bf9",
    justifyContent: "center",
    alignItems: "center",
  },

  avatar: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(8.5),
  },

  heartIcon: {
    position: "absolute",
    top: -8,
    right: -8,
    width: wp(6),
    height: wp(6),
    borderRadius: wp(4),
    // backgroundColor: "#d877fb",
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
  color: "#000", // ✅ FIX
},
});