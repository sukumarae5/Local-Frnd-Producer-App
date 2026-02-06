import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  PermissionsAndroid,
  ScrollView,
  InteractionManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";

import { useDispatch } from "react-redux";
import { userpostphotorequest } from "../features/photo/photoAction";

const AddYourPhotosScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();

  /* ================= EXISTING PHOTOS (FROM API) ================= */
  const existingPhotos = route?.params?.existingPhotos || []; // [{photo_id, photo_url}]
  const from = route?.params?.from;

  /* ================= NEW PHOTOS (LOCAL) ================= */
  const [newPhotos, setNewPhotos] = useState([]);

  const totalPhotos = [...existingPhotos, ...newPhotos];

  /* ================= CAMERA PERMISSION ================= */

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  };

  /* ================= OPEN CAMERA ================= */

  const openCamera = async () => {
    const permitted = await requestCameraPermission();
    if (!permitted) {
      Alert.alert("Camera permission denied");
      return;
    }

    launchCamera({ mediaType: "photo", quality: 1 }, (response) => {
      if (response.didCancel || response.errorCode) return;
      if (response.assets?.length > 0) {
        setNewPhotos((prev) => [...prev, response.assets[0]]);
      }
    });
  };

  /* ================= OPEN GALLERY ================= */

  const openGallery = () => {
    launchImageLibrary({ mediaType: "photo", quality: 0.8 }, (response) => {
      if (response.didCancel || response.errorMessage) return;
      if (response.assets?.length > 0) {
        setNewPhotos((prev) => [...prev, response.assets[0]]);
      }
    });
  };

  /* ================= SELECT OPTION ================= */

  const openSelectOption = () => {
    if (totalPhotos.length >= 4) {
      Alert.alert("Limit Reached", "You can upload only 4 photos.");
      return;
    }

    InteractionManager.runAfterInteractions(() => {
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
    });
  };

  /* ================= UPLOAD NEW PHOTOS ONLY ================= */

  const handleUploadPhotos = () => {
    if (newPhotos.length === 0) {
      Alert.alert("No new photos to upload");
      return;
    }

    const formData = new FormData();

    newPhotos.forEach((photo, index) => {
      formData.append("photos", {
        uri: photo.uri,
        type: photo.type || "image/jpeg",
        name: photo.fileName || `photo_${index}_${Date.now()}.jpg`,
      });
    });

    dispatch(
      userpostphotorequest(formData, () => {
        if (from === "EditProfile") {
          navigation.goBack();
        } else {
          navigation.navigate("SelectYourIdealMatchScreen");
        }
      })
    );
  };

  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} />
          </TouchableOpacity>
          <Text style={styles.header}>Add Your Photos</Text>
        </View>

        {/* PHOTO GRID */}
        <View style={styles.grid}>
          {Array.from({ length: 4 }).map((_, index) => {
            const photo = totalPhotos[index];

            // EXISTING PHOTO
            if (photo?.photo_url) {
              return (
                <View key={`existing-${photo.photo_id}`} style={styles.gridItem}>
                  <Image
                    source={{ uri: photo.photo_url }}
                    style={styles.image}
                  />
                </View>
              );
            }

            // NEW PHOTO
            if (photo?.uri) {
              return (
                <View key={`new-${index}`} style={styles.gridItem}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.image}
                  />
                </View>
              );
            }

            // ADD BUTTON
            if (index === totalPhotos.length) {
              return (
                <TouchableOpacity
                  key={`add-${index}`}
                  style={styles.addBox}
                  onPress={openSelectOption}
                >
                  <Ionicons name="add" size={36} color="#C56CF0" />
                </TouchableOpacity>
              );
            }

            // PLACEHOLDER
            return (
              <View key={`empty-${index}`} style={styles.placeholderBox}>
                <Text style={styles.placeholderText}>160 x 210</Text>
              </View>
            );
          })}
        </View>

        {/* CONTINUE BUTTON */}
        <View style={styles.btnWrap}>
          <TouchableOpacity onPress={handleUploadPhotos}>
            <LinearGradient
              colors={["#9D4CF1", "#D800F4"]}
              style={styles.button}
            >
              <Text style={styles.buttonText}>CONTINUE</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* SKIP */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 10, alignSelf: "center" }}
        >
          <Text style={styles.skipText}>NOT NOW</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default AddYourPhotosScreen;

/* ==================== STYLES ==================== */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F2FF" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 10,
  },

  header: { fontSize: 18, fontWeight: "600" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
  },

  gridItem: {
    width: "48%",
    height: 210,
    marginBottom: 15,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#D9D9D9",
  },

  image: { width: "100%", height: "100%", resizeMode: "cover" },

  addBox: {
    width: "48%",
    height: 210,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#C56CF0",
    borderStyle: "dashed",
    backgroundColor: "#FEEBFF",
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderBox: {
    width: "48%",
    height: 210,
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: { fontSize: 14, color: "#777" },

  btnWrap: { paddingHorizontal: 20, marginTop: 20 },

  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  skipText: { color: "#666", fontSize: 15, fontWeight: "600" },
});
