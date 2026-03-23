import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  PermissionsAndroid,
  Platform
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import {
  createStatusRequest,
  getMyStatusRequest,
  getFriendStatusRequest
} from "../features/Status/statusActions";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const StoriesScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { status, myStatus, friendStatus } = useSelector(
    (state) => state.status
  );
console.log(friendStatus)
  const stories = myStatus?.data || [];

  // ✅ SAFE FRIEND DATA
  const friendStories = Array.isArray(friendStatus)
    ? friendStatus
    : friendStatus?.data || [];

  /* 🔥 GROUP FRIEND STORIES */
  const groupedFriendStories = Object.values(
    (friendStories || []).reduce((acc, item) => {
      if (!item?.user_id) return acc;

      if (!acc[item.user_id]) {
        acc[item.user_id] = {
          user_id: item.user_id,
          user_name: item.name,
          stories: []
        };
      }

      acc[item.user_id].stories.push(item);
      return acc;
    }, {})
  );

  useEffect(() => {
    dispatch(getMyStatusRequest());
    dispatch(getFriendStatusRequest());
  }, []);

  /* CAMERA */

  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const openCamera = async () => {
    const permitted = await requestCameraPermission();
    if (!permitted) return Alert.alert("Permission Denied");

    launchCamera({ mediaType: "photo" }, (res) => {
      const img = res.assets?.[0];
      if (!img) return;

      dispatch(createStatusRequest({
        uri: img.uri,
        type: img.type,
        name: img.fileName || "story.jpg"
      }));
    });
  };

  const openGallery = () => {
    launchImageLibrary({ mediaType: "photo" }, (res) => {
      const img = res.assets?.[0];
      if (!img) return;

      dispatch(createStatusRequest({
        uri: img.uri,
        type: img.type,
        name: img.fileName || "story.jpg"
      }));
    });
  };

  const openSelectOption = () => {
    Alert.alert("Add Story", "Choose", [
      { text: "Camera", onPress: openCamera },
      { text: "Gallery", onPress: openGallery },
      { text: "Cancel", style: "cancel" }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Stories</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>

        {/* ➕ ADD STORY */}
        <TouchableOpacity style={styles.storyContainer} onPress={openSelectOption}>
          <View style={styles.addCircle}>
            <Icon name="plus" size={30} color="#fff" />
          </View>
          <Text style={styles.storyName}>Add Story</Text>
        </TouchableOpacity>

        {/* 👤 YOUR STORY */}
        {stories.length > 0 && (
          <TouchableOpacity
            style={styles.storyContainer}
            onPress={() =>
              navigation.navigate("StoryViewer", {
                stories,
                index: 0,
                isMyStatus: true   // ✅ IMPORTANT
              })
            }
          >
            <View style={styles.storyRing}>
              <Image source={{ uri: stories[0]?.media_url }} style={styles.storyAvatar} />
            </View>
            <Text style={styles.storyName}>Your Story</Text>
          </TouchableOpacity>
        )}

        {/* 👥 FRIEND STORIES */}
        {groupedFriendStories.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.storyContainer}
            onPress={() =>
              navigation.navigate("StoryViewer", {
                stories: item.stories,
                index: 0,
                isMyStatus: false   // ✅ IMPORTANT
              })
            }
          >
            <View style={styles.storyRing}>
              <Image
                source={{ uri: item.stories?.[0]?.media_url }}
                style={styles.storyAvatar}
              />
            </View>

            <Text style={styles.storyName}>
              {item.user_name || "Friend"}
            </Text>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );
};

export default StoriesScreen;

/* STYLES */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16
  },

  sectionLabel: {
    fontSize: 20,
    fontWeight: "700"
  },

  storyContainer: {
    alignItems: "center",
    marginRight: 15
  },

  addCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center"
  },

  storyAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35
  },

  storyRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: "#25D366",
    justifyContent: "center",
    alignItems: "center"
  },

  storyName: {
    marginTop: 5
  }
});