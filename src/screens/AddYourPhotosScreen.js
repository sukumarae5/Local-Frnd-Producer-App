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
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { useDispatch } from "react-redux";
import { userpostphotorequest } from "../features/photo/photoAction";

const AddYourPhotosScreen = ({ navigation }) => {

  const dispatch = useDispatch();

  const [primaryPhoto, setPrimaryPhoto] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState([]);

  const requestCameraPermission = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const handlePick = async (type) => {
    const launchFn = type === "camera" ? launchCamera : launchImageLibrary;

    const permitted = type === "camera" ? await requestCameraPermission() : true;
    if (!permitted) return Alert.alert("Camera Permission Denied");

    launchFn({ mediaType: "photo", quality: 1 }, (res) => {
      if (res.didCancel || res.errorCode || !res.assets?.length) return;
      const img = res.assets[0];

      if (!primaryPhoto) return setPrimaryPhoto(img);

      if (galleryPhotos.length >= 3)
        return Alert.alert("Max 3 gallery photos allowed");

      setGalleryPhotos(prev => [...prev, img]);
    });
  };

  const openPicker = () => {
    Alert.alert(
      "Upload Photo",
      "Select a source",
      [
        { text: "Camera", onPress: () => handlePick("camera") },
        { text: "Gallery", onPress: () => handlePick("gallery") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const sendPhotos = () => {
    if (!primaryPhoto) return Alert.alert("Please upload primary photo");

    const formData = new FormData();

    formData.append("primary", {
      uri: primaryPhoto.uri,
      type: primaryPhoto.type || "image/jpeg",
      name: primaryPhoto.fileName || `primary_${Date.now()}.jpg`,
    });

    galleryPhotos.forEach((img, index) => {
      formData.append("gallery", {
        uri: img.uri,
        type: img.type || "image/jpeg",
        name: img.fileName || `gallery_${index}.jpg`,
      });
    });

    dispatch(userpostphotorequest(formData, () => {
      navigation.navigate("Home");
    }));
  };

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

        {/* PRIMARY PHOTO */}
        <Text style={styles.sectionTitle}>Primary Photo</Text>
        <TouchableOpacity style={styles.primaryBox} onPress={openPicker}>
          {primaryPhoto ? (
            <Image source={{ uri: primaryPhoto.uri }} style={styles.primaryImg} />
          ) : (
            <Ionicons name="camera" size={40} color="#C56CF0" />
          )}
        </TouchableOpacity>

        {/* GALLERY PHOTOS */}
        <Text style={styles.sectionTitle}>Gallery Photos</Text>
        <View style={styles.grid}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <View key={idx} style={styles.gridItem}>
              {galleryPhotos[idx] ? (
                <Image
                  source={{ uri: galleryPhotos[idx].uri }}
                  style={styles.galleryImg}
                />
              ) : (
                <TouchableOpacity style={styles.addBox} onPress={openPicker}>
                  <Ionicons name="add" size={32} color="#C56CF0" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity onPress={sendPhotos} style={styles.btnWrap}>
          <LinearGradient colors={["#9D4CF1", "#D800F4"]} style={styles.button}>
            <Text style={styles.btnText}>UPLOAD & CONTINUE</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* SKIP */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={{ alignSelf: "center", marginTop: 10 }}
        >
          <Text style={styles.skip}>NOT NOW</Text>
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
  sectionTitle: {
    paddingLeft: 20,
    marginTop: 10,
    marginBottom: 5,
    fontSize: 15,
    fontWeight: "600",
  },
  primaryBox: {
    width: "90%",
    height: 220,
    backgroundColor: "#E7D4FF",
    alignSelf: "center",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryImg: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  grid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    marginTop: 10,
  },
  gridItem: {
    width: "30%",
    height: 150,
    backgroundColor: "#E7D4FF",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryImg: {
    width: "100%",
    height: "100%",
  },
  addBox: {
    borderWidth: 2,
    borderColor: "#C56CF0",
    borderStyle: "dashed",
    width: "100%",
    height: "100%",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  btnWrap: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  skip: {
    color: "#555",
    fontWeight: "600",
    fontSize: 14,
    marginTop: 10,
  }
});
