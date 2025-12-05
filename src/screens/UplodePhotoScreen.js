import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Alert,
  PermissionsAndroid,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { userpostphotorequest } from "../features/photo/photoAction";

const { width } = Dimensions.get("window");

const UplodePhotoScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [photo, setPhoto] = useState(null);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "App needs access to your camera",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const openCamera = async () => {
    const permitted = await requestCameraPermission();
    if (!permitted) {
      Alert.alert("Camera permission denied");
      return;
    }

    launchCamera(
      {
        mediaType: "photo",
        quality: 1,
      },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        if (response.assets?.length > 0) setPhoto(response.assets[0].uri);
      }
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      { mediaType: "photo", includeBase64: true, quality: 0.7 },
      (response) => {
        if (response.didCancel || response.errorMessage) return;

        if (response.assets?.length > 0) {
          const base64 = `data:${response.assets[0].type};base64,${response.assets[0].base64}`;
          setPhoto(base64);
        }
      }
    );
  };

  const openSelectOption = () => {
    Alert.alert(
      "Select Option",
      "Choose an option to upload photo",
      [
        { text: "Camera", onPress: openCamera },
        { text: "Gallery", onPress: openGallery },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  // ======= UPDATED UPLOAD FUNCTION WITH NAVIGATION =======
  const handlesendphoto = () => {
    if (!photo) {
      Alert.alert("Please select an image first");
      return; // don't navigate
    }

    const formData = new FormData();
    formData.append("photo", {
      uri: photo,
      type: "image/jpeg",
      name: `photo_${Date.now()}.jpg`,
    });

    formData.append("photo_url", photo);
    formData.append("is_primary", true);
    formData.append("status", "active");

    // Dispatch with callback
    dispatch(
      userpostphotorequest(formData, () => {
        navigation.navigate("Home"); // navigate after successful upload
      })
    );
  };

  return (
    <LinearGradient colors={["#4a0f4aff", "#2f0738ff"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Profile Setup (2/2)</Text>

        <TouchableOpacity style={styles.photoCircle} onPress={openSelectOption}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoPreview} />
          ) : (
            <Text style={styles.bigCameraIcon}>📷</Text>
          )}

          <TouchableOpacity style={styles.smallCameraBtn} onPress={openSelectOption}>
            <Text style={styles.smallCameraIcon}>📷</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <Text style={styles.smileText}>Show us your smile!</Text>
        <Text style={styles.coinText}>
          Upload now and instantly get{" "}
          <Text style={styles.boldCoin}>50 Coins! 💰</Text>
        </Text>

        <TouchableOpacity style={styles.uploadBtn} onPress={handlesendphoto}>
          <Text style={styles.uploadBtnText}>Upload Photo (+50 Coins)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 15 }} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default UplodePhotoScreen;


const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 40, alignItems: "center" },

  backBtn: { position: "absolute", left: 20, top: 45 },
  backArrow: { fontSize: 28, color: "#fff" },

  title: {
    fontSize: 20,
    color: "#fff",
    marginTop: 20,
    fontWeight: "600",
  },

  photoCircle: {
    width: 180,
    height: 180,
    borderRadius: 100,
    backgroundColor: "#eee",
    marginTop: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  bigCameraIcon: { fontSize: 50, opacity: 0.4 },

  photoPreview: { width: "100%", height: "100%", borderRadius: 100 },

  smallCameraBtn: {
    position: "absolute",
    bottom: 10,
    right: 15,
    backgroundColor: "#fff",
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  smallCameraIcon: { fontSize: 22 },

  smileText: { fontSize: 22, color: "#fff", marginTop: 35, fontWeight: "600" },

  coinText: { fontSize: 16, color: "#fff", marginTop: 8, textAlign: "center" },

  boldCoin: { fontWeight: "bold" },

  uploadBtn: {
    backgroundColor: "#fff",
    width: width * 0.8,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 40,
    alignItems: "center",
    elevation: 4,
  },

  uploadBtnText: { fontSize: 18, fontWeight: "600", color: "#000" },

  skipText: { color: "#fff", textDecorationLine: "underline", fontSize: 16, marginBottom: 20 },
});
