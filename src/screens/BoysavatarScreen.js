import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { newUserDataRequest } from "../features/user/userAction";
import WelcomeScreenbackgroundgpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";

const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - 40) / 3;

const BoysavatarScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  /* ================= REDUX ================= */
  const avatars = useSelector((state) => state.avatars.avatars);
  const userState = useSelector((state) => state.user);

  const success = userState?.success;
  const message = userState?.message;

  /* ================= LOCAL STATE ================= */
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResponseHandled, setIsResponseHandled] = useState(false);

  /* ================= SUBMIT ================= */
  const handleContinue = () => {
    if (!selectedAvatar) return;

    setIsSubmitting(true);

    dispatch(
      newUserDataRequest({
        avatar_id: selectedAvatar.avatar_id,
      })
    );
  };

  /* ================= HANDLE BACKEND RESPONSE ================= */
  useEffect(() => {
    if (!message || isResponseHandled) return;

    setIsSubmitting(false);
    setIsResponseHandled(true);

    const alertMessage =
      typeof message === "string"
        ? message
        : message?.message || "Profile updated successfully";

    Alert.alert(
      success ? "Success ✅" : "Error ❌",
      alertMessage,
      [
        {
          text: "OK",
          onPress: () => {
            if (success) {
              navigation.navigate("AddYourPhotosScreen");
            }
          },
        },
      ]
    );
  }, [message, success, isResponseHandled, navigation]);

  /* ================= RESET GUARD ================= */
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setIsResponseHandled(false);
    });
    return unsubscribe;
  }, [navigation]);

  /* ================= RENDER ================= */
  const renderAvatar = ({ item }) => {
    const isSelected = selectedAvatar?.avatar_id === item.avatar_id;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setSelectedAvatar(item)}
        style={[
          styles.avatarWrapper,
          isSelected && styles.avatarSelected,
        ]}
      >
        <Image source={{ uri: item.image_url }} style={styles.avatarImage} />
      </TouchableOpacity>
    );
  };

  return (
    <WelcomeScreenbackgroundgpage>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Choose your Avatar</Text>
        </View>

        <FlatList
          data={avatars}
          renderItem={renderAvatar}
          keyExtractor={(item) => item.avatar_id.toString()}
          numColumns={3}
          extraData={selectedAvatar}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
        />

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedAvatar || isSubmitting) && { opacity: 0.4 },
          ]}
          disabled={!selectedAvatar || isSubmitting}
          onPress={handleContinue}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueText}>Continue</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </WelcomeScreenbackgroundgpage>
  );
};

export default BoysavatarScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
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
  backIcon: { color: "#fff", fontSize: 24 },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 15,
  },
  grid: { paddingBottom: 120 },
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
    backgroundColor: "#df09e7ff",
    justifyContent: "center",
    alignItems: "center",
  },
  continueText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
