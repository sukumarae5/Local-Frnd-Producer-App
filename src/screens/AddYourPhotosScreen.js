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
  Dimensions
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import ContinueButton from "../components/Common/ContinueButton";
import { useDispatch } from "react-redux";
import { userpostphotorequest } from "../features/photo/photoAction";
const { width, height } = Dimensions.get("window");
import WelcomeScreenbackgroundgpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";



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
  <WelcomeScreenbackgroundgpage>

    <View style={{ flex: 1 }}>

      <ScrollView contentContainerStyle={{ paddingBottom: height * 0.18 }}>

        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={width * 0.06} />
          </TouchableOpacity>
          <Text style={styles.header}>Add Your Photos</Text>
        </View>

        {/* GRID */}
        <View style={styles.grid}>
          {Array.from({ length: 4 }).map((_, index) => {
            const photo = totalPhotos[index];

            if (photo?.photo_url) {
              return (
                <View key={`existing-${photo.photo_id}`} style={styles.gridItem}>
                  <Image source={{ uri: photo.photo_url }} style={styles.image} />
                </View>
              );
            }

            if (photo?.uri) {
              return (
                <View key={`new-${index}`} style={styles.gridItem}>
                  <Image source={{ uri: photo.uri }} style={styles.image} />
                </View>
              );
            }

            if (index === totalPhotos.length) {
              return (
                <TouchableOpacity
                  key={`add-${index}`}
                  style={styles.addBox}
                  onPress={openSelectOption}
                >
                  <Ionicons name="add" size={width * 0.1} color="#C56CF0" />
                </TouchableOpacity>
              );
            }

            return (
              <View key={`empty-${index}`} style={styles.placeholderBox}>
                <Text style={styles.placeholderText}>160 x 210</Text>
              </View>
            );
          })}
        </View>

      </ScrollView>

      {/* BUTTON */}
      <View style={styles.bottomFixed}>
        <ContinueButton
          title="CONTINUE"
          onPress={handleUploadPhotos}
          disabled={newPhotos.length === 0}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate("SelectYourIdealMatchScreen")}
          style={{ marginTop: height * 0.015 }}
        >
          <Text style={styles.skipText}>NOT NOW</Text>
        </TouchableOpacity>
      </View>

    </View>

  </WelcomeScreenbackgroundgpage>
);
};

export default AddYourPhotosScreen;

/* ==================== STYLES ==================== */

const ITEM_HEIGHT = height * 0.26; // 🔥 replaces 210

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    marginTop: height * 0.02,
  },

  header: {
    fontSize: width * 0.045,
    fontWeight: "600",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.05,
    marginTop: height * 0.02,
  },

  gridItem: {
    width: "48%",
    height: ITEM_HEIGHT,
    marginBottom: height * 0.02,
    borderRadius: width * 0.04,
    overflow: "hidden",
    backgroundColor: "#D9D9D9",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  addBox: {
    width: "48%",
    height: ITEM_HEIGHT,
    borderRadius: width * 0.04,
    borderWidth: 2,
    borderColor: "#C56CF0",
    borderStyle: "dashed",
    backgroundColor: "#FEEBFF",
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderBox: {
    width: "48%",
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    fontSize: width * 0.035,
    color: "#777",
  },

  bottomFixed: {
    position: "absolute",
    bottom: height * 0.025,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  skipText: {
    color: "#666",
    fontSize: width * 0.04,
    fontWeight: "600",
  },
});