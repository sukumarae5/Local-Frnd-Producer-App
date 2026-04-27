import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { useDispatch, useSelector } from 'react-redux';
import { newUserDataRequest } from '../features/user/userAction';
import WelcomeScreenbackgroundgpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import Icon from 'react-native-vector-icons/Ionicons';
import ContinueButton from '../components/Common/ContinueButton';

const { width, height } = Dimensions.get('window');
const ITEM_SIZE = (width - width * 0.1) / 3;

const BoysavatarScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  /* ================= REDUX ================= */
  const avatars = useSelector(state => state.avatars.avatars);
  const userState = useSelector(state => state.user);

  const success = userState?.success;
  const message = userState?.message;

  /* ================= LOCAL STATE ================= */
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResponseHandled, setIsResponseHandled] = useState(false);

  /* ================= SUBMIT ================= */
  const handleContinue = () => {
    if (!selectedAvatar) return;

    setIsSubmitting(true);

    dispatch(
      newUserDataRequest({
        avatar_id: selectedAvatar.avatar_id,
      }),
    );
  };

  /* ================= HANDLE BACKEND RESPONSE ================= */
  useEffect(() => {
    if (!message || isResponseHandled) return;

    setIsSubmitting(false);
    setIsResponseHandled(true);

    const alertMessage =
      typeof message === 'string'
        ? message
        : message?.message || 'Profile updated successfully';

    Alert.alert(success ? 'Success ✅' : 'Error ❌', alertMessage, [
      {
        text: 'OK',
        onPress: () => {
          if (success) {
            navigation.navigate('AddYourPhotosScreen');
          }
        },
      },
    ]);
  }, [message, success, isResponseHandled, navigation]);

  /* ================= RESET GUARD ================= */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setIsResponseHandled(false);
    });
    return unsubscribe;
  }, [navigation]);

  /* ================= RENDER ================= */
  const renderAvatar = ({ item }) => {
    const isSelected = selectedAvatar?.avatar_id === item.avatar_id;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setSelectedAvatar(item)}
        style={[styles.avatarWrapper, isSelected && styles.avatarSelected]}
      >
        <Image source={{ uri: item.image_url }} style={styles.avatarImage} />
      </TouchableOpacity>
    );
  };

  return (
    <WelcomeScreenbackgroundgpage>
      <StatusBar barStyle="light-content" />

      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={26} color="#000" />
          </TouchableOpacity>

          <Text style={styles.title}>Choose your Avatar</Text>
        </View>

        <FlatList
          data={avatars}
          renderItem={renderAvatar}
          keyExtractor={item => item.avatar_id.toString()}
          numColumns={3}
          extraData={selectedAvatar}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: width * 0.03,
            paddingBottom: height * 0.12, // 🔥 instead of 120
          }}
        />
        <View style={styles.bottomFixed}>
          <ContinueButton
            disabled={!selectedAvatar}
            loading={isSubmitting} // only needed in Boys screen
            onPress={handleContinue}
          />
        </View>
      </View>
    </WelcomeScreenbackgroundgpage>
  );
};

export default BoysavatarScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.012,
    marginBottom: height * 0.03,
    paddingHorizontal: width * 0.05,
  },

  backButton: {
    width: width * 0.09,
    height: width * 0.09,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    color: '#090909',
    fontSize: width * 0.045,
    fontWeight: '600',
    marginLeft: width * 0.03,
  },

  avatarWrapper: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: width * 0.015, // 🔥 responsive spacing
    borderRadius: width * 0.03,
    backgroundColor: '#000',
  },

  avatarSelected: {
    borderWidth: 3,
    borderColor: '#d62edc',
    borderRadius: width * 0.03, // 🔥 match wrapper
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: width * 0.03,
  },

  bottomFixed: {
    position: 'absolute',
    bottom: height * 0.025, // 🔥 responsive
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
