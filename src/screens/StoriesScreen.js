import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width, height } = Dimensions.get("window");
const wp = (v) => (width * v) / 100;
const hp = (v) => (height * v) / 100;
const iconSize = (v) => wp(v);

const StoriesScreen = () => {
  const activePals = [
    { id: 1, name: "Aadhya", img: require("../assets/girl1.jpg") },
    { id: 2, name: "Yuvaan", img: require("../assets/boy1.jpg") },
    { id: 3, name: "Luna", img: require("../assets/girl2.jpg") },
    { id: 4, name: "Hannah", img: require("../assets/girl3.jpg") },
    { id: 5, name: "Aarav", img: require("../assets/boy2.jpg") },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Stories</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: wp(2) }}
      >
        <TouchableOpacity style={styles.storyContainer}>
          <View style={styles.yourStoryCircle}>
            <Icon name="plus" size={iconSize(6)} color="#8B5CF6" />
          </View>
          <Text style={styles.storyName}>Your Story</Text>
        </TouchableOpacity>

        {activePals.map((p) => (
          <TouchableOpacity key={p.id} style={styles.storyContainer}>
            <Image source={p.img} style={styles.storyAvatar} />
            <Text style={styles.storyName}>{p.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default StoriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp(2),
    paddingHorizontal: wp(4),
  },
  sectionLabel: {
    fontSize: wp(5),
    fontWeight: "700",
    color: "#111",

    marginBottom: hp(1.5),
  },
  storyContainer: {
    alignItems: "center",
    marginRight: wp(4),
   


  },
  yourStoryCircle: {
    width: wp(18),
    height: wp(18),
    borderRadius: 110,
    backgroundColor: "#EFE7FF",
    justifyContent: "center",
    alignItems: "center",
    
  },
  storyAvatar: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
     borderWidth:2,
                borderColor:"#f25ef5"
  },
  storyName: {
    marginTop: hp(0.7),
    fontSize: wp(3),
    color: "#333",
    fontWeight: "500",
  },
});
