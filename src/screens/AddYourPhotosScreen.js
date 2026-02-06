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

import { useDispatch } from "react-redux"; // ✅ ADDED
import { userpostphotorequest } from "../features/photo/photoAction"; // ✅ ADDED

const AddYourPhotosScreen = ({ navigation }) => {
  const dispatch = useDispatch(); // ✅ ADDED
  const [photos, setPhotos] = useState([]);

  /* ================= CAMERA PERMISSION ================= */

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      return false;
    }
  };

  /* ================= OPEN CAMERA ================= */

  const openCamera = async () => {
    const permitted = await requestCameraPermission();
    if (!permitted) {
      InteractionManager.runAfterInteractions(() => {
        Alert.alert("Camera permission denied");
      });
      return;
    }

    launchCamera({ mediaType: "photo", quality: 1 }, (response) => {
      if (response.didCancel || response.errorCode) return;
      if (response.assets?.length > 0) {
        setPhotos((prev) => [...prev, response.assets[0]]);
      }
    });
  };

  /* ================= OPEN GALLERY ================= */

  const openGallery = () => {
    launchImageLibrary({ mediaType: "photo", quality: 0.8 }, (response) => {
      if (response.didCancel || response.errorMessage) return;
      if (response.assets?.length > 0) {
        setPhotos((prev) => [...prev, response.assets[0]]);
      }
    });
  };

  /* ================= SELECT OPTION ================= */

  const openSelectOption = () => {
    if (photos.length >= 4) {
      InteractionManager.runAfterInteractions(() => {
        Alert.alert("Limit Reached", "You can upload only 4 photos.");
      });
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

  /* ================= UPLOAD PHOTOS (API DISPATCH) ================= */

const handleUploadPhotos = () => {
  if (photos.length === 0) {
    Alert.alert("Please add at least one photo");
    return;
  }
  const formData = new FormData();

  photos.forEach((photo, index) => {
    formData.append("photos", {
      uri: photo.uri,
      type: photo.type || "image/jpeg",
      name: photo.fileName || `photo_${index}_${Date.now()}.jpg`,
    });
  });

  dispatch(
    userpostphotorequest(formData, () => {
      navigation.navigate("SelectYourIdealMatchScreen");
    })
  );
};


  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} />
          </TouchableOpacity>
          <Text style={styles.header}>Add Your Photos</Text>
        </View>

        {/* PHOTO GRID */}
        <View style={styles.grid}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={styles.gridItem}>
              {photos[index] ? (
                <Image
                  source={{ uri: photos[index].uri }}
                  style={styles.image}
                />
              ) : index === photos.length ? (
                <TouchableOpacity
                  style={styles.addBox}
                  onPress={openSelectOption}
                >
                  <Ionicons name="add" size={36} color="#C56CF0" />
                </TouchableOpacity>
              ) : (
                <View style={styles.placeholderBox}>
                  <Text style={styles.placeholderText}>160 x 210</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Continue Button */}
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

        {/* Not Now */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
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
  container: {
    flex: 1,
    backgroundColor: "#F8F2FF",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 10,
  },

  header: {
    fontSize: 18,
    fontWeight: "600",
  },

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
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  addBox: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#C56CF0",
    borderStyle: "dashed",
    backgroundColor: "#FEEBFF",
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderBox: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    fontSize: 14,
    color: "#777",
  },

  btnWrap: {
    paddingHorizontal: 20,
    marginTop: 20,
  },

  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  skipText: {
    color: "#666",
    fontSize: 15,
    fontWeight: "600",
  },
});
