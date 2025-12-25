import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { newUserDataRequest } from "../features/user/userAction";

const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - 40) / 3;

const ChooseAvatarScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { avatars } = useSelector((state) => state.avatars);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const renderAvatar = ({ item }) => {
    const isSelected = selectedAvatar?.avatar_id === item.avatar_id;

    return (
      <TouchableOpacity
        activeOpacity={1} // ✅ no dim / no disable
        onPress={() => setSelectedAvatar(item)}
        style={[
          styles.avatarWrapper,
          isSelected && styles.avatarSelected,
        ]}
      >
        <Image
          source={{ uri: item.image_url }}
          style={styles.avatarImage}
        />
      </TouchableOpacity>
    );
  };

  const handleContinue = () => {
    if (!selectedAvatar) return;

    // ✅ DISPATCH SELECTED AVATAR ID
    dispatch(
      newUserDataRequest({
        avatar_id: selectedAvatar.avatar_id,
      })
    );

    // ✅ NAVIGATE AFTER DISPATCH
    navigation.navigate("ReciverHomeScreen");
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
          data={avatars}
          renderItem={renderAvatar}
          keyExtractor={(item) => item.avatar_id.toString()}
          numColumns={3}
          extraData={selectedAvatar}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
        />

        {/* CONTINUE BUTTON */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedAvatar && styles.continueDisabled,
          ]}
          disabled={!selectedAvatar}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ChooseAvatarScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#555",
    justifyContent: "center",
    alignItems: "center",
  },

  backIcon: {
    color: "#fff",
    fontSize: 24,
  },

  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 15,
  },

  grid: {
    paddingBottom: 120,
  },

  avatarWrapper: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 6,
    borderRadius: 14,
    backgroundColor: "#000",
  },

  avatarSelected: {
    borderWidth: 3,
    borderColor: "#d62edc",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  continueButton: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#d62edc",
    justifyContent: "center",
    alignItems: "center",
  },

  continueDisabled: {
    opacity: 0.4,
  },

  continueText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
