import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
  TouchableOpacity,
  Alert,
  Text,
  FlatList
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import {
  deleteStatusRequest,
  viewStatusRequest,
  getViewersRequest
} from "../features/Status/statusActions";

const { width, height } = Dimensions.get("window");

/* 🔥 TIME FORMAT FUNCTION */
const formatTimeAgo = (time) => {
  if (!time) return "";

  const now = new Date();
  const viewedTime = new Date(time);

  const diff = Math.floor((now - viewedTime) / 1000);

  if (diff < 60) return "Just now";

  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";

  return `${days} days ago`;
};

const StoryViewer = ({ route, navigation }) => {
  const { stories, index, isMyStatus } = route.params;

  const dispatch = useDispatch();

  // ✅ REDUX VIEWERS
  const viewers = useSelector(state => state.status.viewers);

  const [currentIndex, setCurrentIndex] = useState(index);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;
  const animation = useRef(null);
  const viewedStories = useRef(new Set());

  /* DELETE */
  const handleDelete = () => {
    if (!isMyStatus) return;

    const currentStory = stories[currentIndex];

    Alert.alert("Delete", "Delete this story?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => {
          dispatch(deleteStatusRequest(currentStory?.status_id));
          navigation.goBack();
        }
      }
    ]);
  };

  /* VIEW TRACKING */
  useEffect(() => {
    if (!stories.length) return;

    const currentStory = stories[currentIndex];

    if (isMyStatus) return;

    if (viewedStories.current.has(currentStory?.status_id)) return;

    viewedStories.current.add(currentStory?.status_id);

    dispatch(
      viewStatusRequest({
        status_id: currentStory?.status_id
      })
    );
  }, [currentIndex]);

  /* ANIMATION */
  const startAnimation = () => {
    animation.current = Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false
    });

    animation.current.start(({ finished }) => {
      if (finished) nextStory();
    });
  };

  useEffect(() => {
    progress.setValue(0);
    startAnimation();
    return () => animation.current?.stop();
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused) {
      animation.current?.stop();
    } else {
      startAnimation();
    }
  }, [isPaused]);

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.goBack();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"]
  });

  /* 👁 VIEWERS CLICK */
  const handleViewers = () => {
    if (!isMyStatus) return;

    const currentStory = stories[currentIndex];

    setIsPaused(true);

    dispatch(getViewersRequest(currentStory?.status_id));

    setShowViewers(true);
  };

  return (
    <TouchableWithoutFeedback
      disabled={showViewers}
      onPress={(e) => {
        const x = e.nativeEvent.locationX;
        if (x < width / 2) prevStory();
        else nextStory();
      }}
      onPressIn={() => setIsPaused(true)}
      onPressOut={() => setIsPaused(false)}
    >
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={26} color="#fff" />
          </TouchableOpacity>

          {isMyStatus && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>

              {/* 👁 VIEW COUNT */}
              <TouchableOpacity
                onPress={handleViewers}
                style={{ marginRight: 15, flexDirection: "row", alignItems: "center" }}
              >
                <Icon name="eye-outline" size={26} color="#fff" />
                <Text style={{ color: "#fff", marginLeft: 5 }}>
                  {viewers?.length || 0}
                </Text>
              </TouchableOpacity>

              {/* DELETE */}
              <TouchableOpacity onPress={handleDelete}>
                <Icon name="delete" size={26} color="#fff" />
              </TouchableOpacity>

            </View>
          )}
        </View>

        {/* PROGRESS */}
        <View style={styles.progressContainer}>
          {stories.map((_, i) => (
            <View key={i} style={styles.progressBarBackground}>
              {i === currentIndex ? (
                <Animated.View
                  style={[styles.progressBarFill, { width: progressWidth }]}
                />
              ) : (
                <View
                  style={[
                    styles.progressBarFill,
                    { width: i < currentIndex ? "100%" : "0%" }
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        {/* IMAGE */}
        <Image
          source={{ uri: stories[currentIndex]?.media_url }}
          style={styles.image}
        />

        {/* VIEWERS LIST */}
        {showViewers && (
          <View style={styles.viewerContainer}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                setShowViewers(false);
                setIsPaused(false);
              }}
            >
              <Icon name="close" size={26} color="#fff" />
            </TouchableOpacity>

            <FlatList
              data={viewers || []}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.viewerItem}>
                  <Icon name="account-circle" size={40} color="#fff" />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.viewerName}>{item?.name}</Text>
                    <Text style={styles.viewerUsername}>
                      @{item?.username}
                    </Text>

                    {/* ⏱ TIME */}
                    <Text style={styles.viewerTime}>
                      {formatTimeAgo(item?.viewed_at)}
                    </Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={{ color: "#fff", textAlign: "center" }}>
                  No viewers yet
                </Text>
              }
            />
          </View>
        )}

      </View>
    </TouchableWithoutFeedback>
  );
};

export default StoryViewer;

/* STYLES */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  image: {
    width: width,
    height: height,
    resizeMode: "cover"
  },

  header: {
    position: "absolute",
    top: 50,
    width: "100%",
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 20
  },

  progressContainer: {
    position: "absolute",
    top: 40,
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 10,
    zIndex: 10
  },

  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 2,
    borderRadius: 2,
    overflow: "hidden"
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff"
  },

  viewerContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    maxHeight: height * 0.5,
    backgroundColor: "#111",
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },

  viewerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15
  },

  viewerName: {
    color: "#fff",
    fontSize: 16
  },

  viewerUsername: {
    color: "#aaa"
  },

  viewerTime: {
    color: "#888",
    fontSize: 12,
    marginTop: 2
  },

  closeBtn: {
    alignSelf: "flex-end",
    marginBottom: 10
  }
});