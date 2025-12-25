import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Pressable,
  Image,
  Linking,
  Platform,
} from "react-native";
import Geolocation from "@react-native-community/geolocation";
import { useDispatch, useSelector } from "react-redux";
import { useRoute, useNavigation } from "@react-navigation/native";
import { newUserDataRequest, userEditRequest } from "../features/user/userAction";
import BackgroundPagesOne from "../components/BackgroundPages/BackgroundPagesOne";

/* ================= UX POPUP ================= */
const PermissionTimePopup = ({ visible, onAllow, onDeny }) => {
  if (!visible) return null;

  return (
    <View style={popupStyles.overlay}>
      <View style={popupStyles.dialog}>
        <Text style={popupStyles.title}>
          Allow <Text style={{ fontWeight: "700" }}>this app</Text> to access your
          location?
        </Text>

        <Pressable style={popupStyles.option} onPress={onAllow}>
          <Text style={popupStyles.optionText}>While using the app</Text>
        </Pressable>

        <Pressable style={popupStyles.option} onPress={onAllow}>
          <Text style={popupStyles.optionText}>Only this time</Text>
        </Pressable>

        <Pressable style={popupStyles.option} onPress={onDeny}>
          <Text style={popupStyles.denyText}>Don’t allow</Text>
        </Pressable>
      </View>
    </View>
  );
};

/* ================= MAIN SCREEN ================= */
const LocationScreen = () => {
  /* ---------- HOOKS (TOP LEVEL – SAFE) ---------- */
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const { success, loading } = useSelector((state) => state.user);

  // ✅ SAFE PARAMS (no crash)
  const { name, gender, date_of_birth, age } = route.params || {};

  const [location, setLocation] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState("idle");
  const [showPopup, setShowPopup] = useState(false);
const [submitted, setSubmitted] = useState(false); // ✅ FIX

  /* ---------- ASK PERMISSION ---------- */
  const requestLocationPermission = async () => {
    if (Platform.OS !== "android") return;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      setPermissionStatus("granted");
      fetchLocation();
    } else {
      setPermissionStatus("denied");
    }
  };

  /* ---------- FETCH GPS ---------- */
  const fetchLocation = () => {
    Geolocation.getCurrentPosition(
      (pos) => {
        setLocation(pos.coords);
      },
      (error) => {
        console.log("GPS ERROR:", error);
        setPermissionStatus("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
        forceRequestLocation: true,
        showLocationDialog: true,
      }
    );
  };

  /* ---------- SUBMIT ---------- */
  const handleContinue = () => {
    if (!location || loading) return;
 setSubmitted(true);
    dispatch(
      newUserDataRequest({ location_lat: location.latitude,
        location_log: location.longitude,})
     
    );
  };

  /* ---------- NAVIGATION ---------- */
 useEffect(() => {
  if (submitted && success === true) {
    navigation.replace("GenderScreen");
  }
}, [submitted, success, navigation]);


  /* ---------- CLEANUP ---------- */
  // useEffect(() => {
  //   return () => {
  //     Geolocation.stopObserving();
  //   };
  // }, []);

  return (
    <BackgroundPagesOne>
      <View style={styles.container}>
        <Text style={styles.title}>ENABLE LOCATION</Text>

        <View style={styles.circle}>
          <Image
            source={require("../assets/locationimage.png")}
            style={styles.icon}
          />
        </View>

        <Text style={styles.description}>
          We need access to your location to show nearby people and updates.
        </Text>

        {/* ALLOW BUTTON */}
        {permissionStatus !== "granted" && (
          <Pressable
            style={styles.allowBtn}
            onPress={() => setShowPopup(true)}
          >
            <Text style={styles.allowText}>ALLOW LOCATION ACCESS</Text>
          </Pressable>
        )}

        {/* DENIED STATE */}
        {permissionStatus === "denied" && (
          <>
            <Text style={styles.deniedText}>
              Location permission denied
            </Text>
            <Pressable onPress={() => Linking.openSettings()}>
              <Text style={styles.retryText}>OPEN SETTINGS</Text>
            </Pressable>
          </>
        )}

        {/* CONTINUE */}
        {location && (
          <Pressable
            style={[
              styles.submitBtn,
              loading && { opacity: 0.6 },
            ]}
            disabled={loading}
            onPress={handleContinue}
          >
            <Text style={styles.submitText}>
              {loading ? "Submitting..." : "CONTINUE"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* UX POPUP */}
      <PermissionTimePopup
        visible={showPopup}
        onAllow={() => {
          setShowPopup(false);
          requestLocationPermission();
        }}
        onDeny={() => {
          setShowPopup(false);
          setPermissionStatus("denied");
        }}
      />
    </BackgroundPagesOne>
  );
};

export default LocationScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 80,
    height: 80,
  },
  description: {
    color: "#ccc",
    textAlign: "center",
    marginVertical: 20,
    paddingHorizontal: 30,
  },
  allowBtn: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 30,
    width: "80%",
  },
  allowText: {
    color: "#7a1fa2",
    textAlign: "center",
    fontWeight: "700",
  },
  deniedText: {
    color: "#ffb3b3",
    marginTop: 10,
  },
  retryText: {
    color: "#b784ff",
    textDecorationLine: "underline",
  },
  submitBtn: {
    backgroundColor: "#ff1983",
    padding: 14,
    borderRadius: 30,
    width: "80%",
    marginTop: 15,
  },
  submitText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
});

/* ================= POPUP STYLES ================= */
const popupStyles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
  },
  title: {
    fontSize: 16,
    marginBottom: 16,
  },
  option: {
    paddingVertical: 14,
  },
  optionText: {
    color: "#1A73E8",
    fontSize: 15,
  },
  denyText: {
    color: "#D93025",
    fontSize: 15,
  },
});
