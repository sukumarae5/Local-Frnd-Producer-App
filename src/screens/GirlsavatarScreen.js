import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  SafeAreaView,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";

/* ✅ 15 avatars – SAME images, UNIQUE ids */
const AVATARS = [
  { id: 1, image: require("../assets/girl1.jpg") },
  { id: 2, image: require("../assets/girl2.jpg") },
  { id: 3, image: require("../assets/girl3.jpg") },
  { id: 4, image: require("../assets/girl4.jpg") },
  { id: 5, image: require("../assets/girl5.jpg") },
  { id: 6, image: require("../assets/girl1.jpg") },
  { id: 7, image: require("../assets/girl2.jpg") },
  { id: 8, image: require("../assets/girl3.jpg") },
  { id: 9, image: require("../assets/girl4.jpg") },
  { id: 10, image: require("../assets/girl5.jpg") },
  { id: 11, image: require("../assets/girl1.jpg") },
  { id: 12, image: require("../assets/girl2.jpg") },
  { id: 13, image: require("../assets/girl3.jpg") },
  { id: 14, image: require("../assets/girl4.jpg") },
  { id: 15, image: require("../assets/girl5.jpg") },
];

const ChooseAvatarScreen = () => {
  // ✅ useNavigation must be inside the component
  const navigation = useNavigation();
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const renderAvatar = ({ item }) => {
    const isSelected = selectedAvatar === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setSelectedAvatar(item.id)}
        style={[styles.avatarWrapper, isSelected && styles.avatarSelected]}
      >
        <Image source={item.image} style={styles.avatarImage} />
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={["#000000", "#1a001f", "#2d0033"]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Choose your Avatar</Text>
        </View>

        {/* AVATAR GRID */}
        <FlatList
          data={AVATARS}
          renderItem={renderAvatar}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
        />

        {/* CONTINUE BUTTON */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate("ReciverHomeScreen")}
          disabled={!selectedAvatar} 
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ChooseAvatarScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", marginTop: 20, marginBottom: 30 },
  backButton: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: "#555", justifyContent: "center", alignItems: "center" },
  backIcon: { color: "#fff", fontSize: 24 },
  title: { color: "#fff", fontSize: 20, fontWeight: "600", marginLeft: 15 },
  grid: { paddingBottom: 120 },
  avatarWrapper: { width: "30%", aspectRatio: 1, margin: "1.66%", borderRadius: 14, overflow: "hidden", backgroundColor: "#000" },
  avatarSelected: { borderWidth: 3, borderColor: "#d62edc" },
  avatarImage: { width: "100%", height: "100%", resizeMode: "cover" },
  continueButton: { position: "absolute", bottom: 25, left: 20, right: 20, height: 55, borderRadius: 28, backgroundColor: "#d62edc", justifyContent: "center", alignItems: "center" },
  continueText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
