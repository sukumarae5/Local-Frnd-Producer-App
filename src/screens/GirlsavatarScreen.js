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
const ITEM_SIZE = (width - width * 0.1) / 3;

const GirlsavatarScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { avatars } = useSelector((state) => state.avatars);

  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const renderAvatar = ({ item }) => {
    const isSelected = selectedAvatar?.avatar_id === item.avatar_id;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setSelectedAvatar(item)}
        style={[
          styles.avatarWrapper,
          isSelected && styles.avatarSelected,
        ]}
      >
        <Image source={{ uri: item.image_url }} style={styles.avatarImage} />
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
      <StatusBar barStyle="light-content" />

      <View style={{ flex: 1 }}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={26} color="#000" />
          </TouchableOpacity>

          <Text style={styles.title}>Choose your Avatar</Text>
        </View>

        {/* GRID */}
        <FlatList
          data={avatars}
          renderItem={renderAvatar}
          keyExtractor={(item) => item.avatar_id.toString()}
          numColumns={3}
          extraData={selectedAvatar}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: width * 0.03,
            paddingBottom: height * 0.12,
          }}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: height * 0.015,
    marginBottom: height * 0.03,
    paddingHorizontal: width * 0.05,
  },

  title: {
    color: "#090909",
    fontSize: width * 0.045,
    fontWeight: "600",
    marginLeft: width * 0.03,
  },

  avatarWrapper: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: width * 0.015,
    borderRadius: width * 0.03,
    backgroundColor: "#000",
  },

  avatarSelected: {
    borderWidth: 3,
    borderColor: "#d62edc",
    borderRadius: width * 0.03,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: width * 0.03,
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