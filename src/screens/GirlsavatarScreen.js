import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  Dimensions,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { newUserDataRequest } from "../features/user/userAction";
import WelcomeScreenbackgroundgpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";
import Icon from "react-native-vector-icons/Ionicons";
import ContinueButton from "../components/Common/ContinueButton";

const { width, height } = Dimensions.get("window");

const SCREEN_PADDING = 8;
const COLUMN_GAP = 16;
const ITEM_SIZE =
  (width - SCREEN_PADDING * 2 - COLUMN_GAP * 2) / 3;

const GirlsavatarScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { avatars } = useSelector((state) => state.avatars);

  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const renderAvatar = ({ item }) => {
    const isSelected =
      selectedAvatar?.avatar_id === item.avatar_id;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setSelectedAvatar(item)}
        style={[
          styles.avatarWrapper,
          isSelected && styles.avatarSelected,
        ]}
      >
        <Image
          source={{ uri: item.image_url }}
          style={styles.avatarImage}
        />
      </TouchableOpacity>
    );
  };

  const handleContinue = () => {
    if (!selectedAvatar) return;

    setIsSubmitting(true);

    dispatch(
      newUserDataRequest({
        avatar_id: selectedAvatar.avatar_id,
      })
    );

    navigation.navigate("AddYourPhotosScreen");
  };

  return (
    <WelcomeScreenbackgroundgpage>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Icon
              name="chevron-back"
              size={24}
              color="#000"
            />
          </TouchableOpacity>

          <Text style={styles.title}>
            Select Your avatar
          </Text>
        </View>

        {/* GRID */}
        <FlatList
          data={avatars}
          renderItem={renderAvatar}
          keyExtractor={(item) =>
            item.avatar_id.toString()
          }
          numColumns={3}
          extraData={selectedAvatar}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
        />

        {/* BUTTON */}
        <View style={styles.bottomFixed}>
          <ContinueButton
            disabled={!selectedAvatar}
            loading={isSubmitting}
            onPress={handleContinue}
          />
        </View>

      </View>
    </WelcomeScreenbackgroundgpage>
  );
};

export default GirlsavatarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    marginTop: height * 0.01,
    marginBottom: 10,
  },

  backButton: {
    width: 28,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },

 title: {
    color: '#090909',
    fontSize: width * 0.045,
    fontWeight: '600',
    marginLeft: width * 0.03,
  },

  listContent: {
    paddingBottom: height * 0.14,
  },

  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },

  avatarWrapper: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#E8E8E8",
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

  bottomFixed: {
    position: "absolute",
    bottom: height * 0.025,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});