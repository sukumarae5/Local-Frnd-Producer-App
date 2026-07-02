// src/components/LikeMindedSection.js

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";

import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";

import { getLikeMindedRequest } from "../features/LikeMinded/likeMindedAction";

const { width, height } = Dimensions.get("window");

const wp = (value) => (width * value) / 100;
const hp = (value) => (height * value) / 100;

const LikeMindedSectionScreen = () => {
  const dispatch = useDispatch();

  const {
    loading = false,
    data = [],
    error = null,
  } = useSelector(
    (state) => state.likeMinded || {}
  );

  const ripple1 = useRef(
    new Animated.Value(0)
  ).current;

  const ripple2 = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    dispatch(getLikeMindedRequest());
  }, [dispatch]);

  useEffect(() => {
    const createRippleAnimation = (
      animatedValue,
      delay
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),

          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const firstAnimation =
      createRippleAnimation(ripple1, 0);

    const secondAnimation =
      createRippleAnimation(ripple2, 800);

    firstAnimation.start();
    secondAnimation.start();

    return () => {
      firstAnimation.stop();
      secondAnimation.stop();
    };
  }, [ripple1, ripple2]);

  const rippleStyle1 = useMemo(
    () => ({
      position: "absolute",
      width: wp(23),
      height: wp(23),
      borderRadius: wp(13),
      backgroundColor:
        "rgba(226,133,251,0.25)",

      transform: [
        {
          scale: ripple1.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.6],
          }),
        },
      ],

      opacity: ripple1.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 0],
      }),
    }),
    [ripple1]
  );

  const rippleStyle2 = useMemo(
    () => ({
      position: "absolute",
      width: wp(23),
      height: wp(23),
      borderRadius: wp(13),
      backgroundColor:
        "rgba(226,133,251,0.25)",

      transform: [
        {
          scale: ripple2.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.6],
          }),
        },
      ],

      opacity: ripple2.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 0],
      }),
    }),
    [ripple2]
  );

  const getUserId = useCallback(
    (item, index) => {
      return String(
        item?.id ??
          item?.user_id ??
          item?.like_minded_user_id ??
          item?.liked_user_id ??
          item?._id ??
          index
      );
    },
    []
  );

  const getUserName = useCallback((item) => {
    return (
      item?.name ||
      item?.full_name ||
      item?.username ||
      item?.user_name ||
      item?.display_name ||
      item?.first_name ||
      "User"
    );
  }, []);

  const getProfileImage = useCallback(
    (item) => {
      return (
        item?.profile_image ||
        item?.profile_image_url ||
        item?.profile_photo ||
        item?.profile_pic ||
        item?.image_url ||
        item?.image ||
        item?.avatar ||
        item?.photo ||
        item?.user_image ||
        null
      );
    },
    []
  );

  const renderItem = useCallback(
    ({ item }) => {
      const name = getUserName(item);
      const profileImage =
        getProfileImage(item);

      return (
        <View style={styles.card}>
          <View style={styles.dottedRing}>
            <Animated.View
              style={rippleStyle1}
            />

            <Animated.View
              style={rippleStyle2}
            />

            <View style={styles.solidRing}>
              {profileImage ? (
                <Image
                  source={{
                    uri: profileImage,
                  }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={
                    styles.avatarPlaceholder
                  }
                >
                  <Icon
                    name="person"
                    size={wp(8)}
                    color="#c20bf9"
                  />
                </View>
              )}
            </View>

            <View style={styles.heartIcon}>
              <Icon
                name="heart"
                size={wp(4)}
                color="#06f86f"
              />
            </View>

            <View style={styles.phoneIcon}>
              <Icon
                name="call"
                size={wp(4)}
                color="#b671fb"
              />
            </View>

            <View style={styles.chatIcon}>
              <Icon
                name="chatbubble-ellipses-outline"
                size={wp(4)}
                color="#b671fb"
              />
            </View>

            <View style={styles.locationIcon}>
              <Icon
                name="location"
                size={wp(4)}
                color="#b671fb"
              />
            </View>
          </View>

          <View style={styles.namePill}>
            <Text
              style={styles.nameText}
              numberOfLines={1}
            >
              {name}
            </Text>
          </View>
        </View>
      );
    },
    [
      getProfileImage,
      getUserName,
      rippleStyle1,
      rippleStyle2,
    ]
  );

  const keyExtractor = useCallback(
    (item, index) =>
      getUserId(item, index),
    [getUserId]
  );

  const renderContent = () => {
    if (loading && data.length === 0) {
      return (
        <View style={styles.statusContainer}>
          <ActivityIndicator
            size="small"
            color="#c20bf9"
          />

          <Text style={styles.loadingText}>
            Loading like-minded users...
          </Text>
        </View>
      );
    }

    if (error && data.length === 0) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.errorText}>
            {error?.message ||
              error?.error ||
              "Unable to load like-minded users"}
          </Text>
        </View>
      );
    }

    if (!loading && data.length === 0) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.emptyText}>
            No like-minded users found
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={data}
        horizontal
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          styles.listContent
        }
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
      />
    );
  };

  return (
    <View>
      <Text style={styles.sectionLabel}>
        Like Minded
      </Text>

      {renderContent()}
    </View>
  );
};

export default LikeMindedSectionScreen;

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: wp(5),
    fontWeight: "700",
    paddingTop: hp(2),
    paddingHorizontal: wp(4),
    color: "#000",
  },

  listContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(1),
  },

  card: {
    width: wp(36),
    alignItems: "center",
    marginLeft: wp(-5),
    overflow: "visible",
  },

  dottedRing: {
    width: wp(23),
    height: wp(23),
    borderRadius: wp(13),
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#C084FC",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "visible",
  },

  solidRing: {
    width: wp(17),
    height: wp(17),
    borderRadius: wp(10.5),
    borderWidth: 17,
    borderColor: "#c20bf9",
    justifyContent: "center",
    alignItems: "center",
  },

  avatar: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(8.5),
  },

  avatarPlaceholder: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(8.5),
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
  },

  heartIcon: {
    position: "absolute",
    top: -8,
    right: -8,
    width: wp(6),
    height: wp(6),
    borderRadius: wp(4),
    justifyContent: "center",
    alignItems: "center",
  },

  phoneIcon: {
    position: "absolute",
    top: -8,
    left: -8,
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: "center",
    alignItems: "center",
  },

  chatIcon: {
    position: "absolute",
    bottom: -8,
    left: -8,
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: "center",
    alignItems: "center",
  },

  locationIcon: {
    position: "absolute",
    bottom: -8,
    right: -8,
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: "center",
    alignItems: "center",
  },

  namePill: {
    marginTop: hp(1.5),
    maxWidth: wp(30),
    backgroundColor: "#F3E8FF",
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.6),
    borderRadius: wp(6),
  },

  nameText: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },

  statusContainer: {
    minHeight: hp(15),
    paddingHorizontal: wp(4),
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: hp(1),
    fontSize: wp(3.4),
    color: "#666",
  },

  errorText: {
    fontSize: wp(3.4),
    color: "#D32F2F",
    textAlign: "center",
  },

  emptyText: {
    fontSize: wp(3.4),
    color: "#777",
    textAlign: "center",
  },
});