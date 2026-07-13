import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';

import { useDispatch, useSelector } from 'react-redux';
import { newUserDataRequest } from '../features/user/userAction';
import WelcomeScreenbackgroundgpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import Icon from 'react-native-vector-icons/Ionicons';
import ContinueButton from '../components/Common/ContinueButton';

const { width, height } = Dimensions.get('window');

const SCREEN_PADDING = 8;
const COLUMN_GAP = 16;

const ITEM_SIZE =
  (width - SCREEN_PADDING * 2 - COLUMN_GAP * 2) / 3;

/* -------------------------------------------------------------------------- */
/*                               Avatar Item                                  */
/* -------------------------------------------------------------------------- */

const AvatarItem = React.memo(
  ({ item, isSelected, onPress }) => {
    console.log(
  'Avatar:',
  item.avatar_id,
  item.image_url,
);
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress(item)}
        style={[
          styles.avatarWrapper,
          isSelected && styles.avatarSelected,
        ]}>
        {item.image_url ? (
    <Image
                source={{uri: item.image_url}}
                style={styles.avatarImage}
                resizeMode="cover"
              />
        ) : (
          <View style={styles.missingImagePlaceholder} />
        )}
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.item.avatar_id === nextProps.item.avatar_id &&
    prevProps.item.image_url === nextProps.item.image_url,
);

/* -------------------------------------------------------------------------- */
/*                           Girls Avatar Screen                              */
/* -------------------------------------------------------------------------- */

const GirlsavatarScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const rawAvatars = useSelector(
    state => state.avatars.avatars || [],
  );

  const userState = useSelector(state => state.user);

  const success = userState?.success;
  const message = userState?.message;

  /* ---------------------------- Avatar List ---------------------------- */
useEffect(() => {
  console.log(
    'Boys avatars',
    JSON.stringify(rawAvatars, null, 2),
  );
}, [rawAvatars]);
  const avatars = useMemo(() => {
    return rawAvatars.map((item, index) => ({
      ...item,
      _uniqueKey: `${item.avatar_id}_${index}`,
    }));
  }, [rawAvatars]);

  /* ---------------------------- State ---------------------------- */

  const [selectedAvatar, setSelectedAvatar] =
    useState(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isResponseHandled, setIsResponseHandled] =
    useState(false);

  /* ---------------------------- Continue ---------------------------- */

  const handleContinue = useCallback(() => {
    if (!selectedAvatar) {
      return;
    }

    setIsSubmitting(true);

    dispatch(
      newUserDataRequest({
        avatar_id: selectedAvatar.avatar_id,
      }),
    );
  }, [dispatch, selectedAvatar]);

  /* ---------------------------- API Response ---------------------------- */

  useEffect(() => {
    if (!message || isResponseHandled) {
      return;
    }

    setIsSubmitting(false);

    setIsResponseHandled(true);

    const alertMessage =
      typeof message === 'string'
        ? message
        : message?.message ||
          'Profile updated successfully';

    Alert.alert(
      success ? 'Success ✅' : 'Error ❌',
      alertMessage,
      [
        {
          text: 'OK',
          onPress: () => {
            if (success) {
              navigation.navigate(
                'AddYourPhotosScreen',
              );
            }
          },
        },
      ],
    );
  }, [
    message,
    success,
    navigation,
    isResponseHandled,
  ]);

  /* ---------------------------- Reset ---------------------------- */

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      'focus',
      () => {
        setIsResponseHandled(false);
      },
    );

    return unsubscribe;
  }, [navigation]);

  /* ---------------------------- Select Avatar ---------------------------- */

  const handleSelect = useCallback(item => {
    setSelectedAvatar(item);
  }, []);

  /* ---------------------------- Render Item ---------------------------- */

  const renderAvatar = useCallback(
    ({ item }) => {
      return (
        <AvatarItem
          item={item}
          isSelected={
            selectedAvatar?._uniqueKey ===
            item._uniqueKey
          }
          onPress={handleSelect}
        />
      );
    },
    [selectedAvatar, handleSelect],
  );
    return (
    <WelcomeScreenbackgroundgpage>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        {/* ---------------- Header ---------------- */}

        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon
              name="chevron-back"
              size={24}
              color="#000"
            />
          </TouchableOpacity>

          <Text style={styles.title}>
            Select Your Avatar
          </Text>
        </View>

        {/* ---------------- Avatar List ---------------- */}

     <FlatList
  data={avatars}
  renderItem={renderAvatar}
  keyExtractor={item => item._uniqueKey}
  numColumns={3}
  extraData={selectedAvatar?._uniqueKey}
  showsVerticalScrollIndicator={false}
  columnWrapperStyle={styles.columnWrapper}
  contentContainerStyle={styles.listContent}
  removeClippedSubviews={false}
  initialNumToRender={20}
  maxToRenderPerBatch={20}
  updateCellsBatchingPeriod={0}
  windowSize={21}
/>

        {/* ---------------- Continue Button ---------------- */}

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
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    marginTop: height * 0.01,
    marginBottom: 12,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  title: {
    color: '#090909',
    fontSize: width * 0.045,
    fontWeight: '600',
    marginLeft: width * 0.02,
  },

  listContent: {
    paddingBottom: height * 0.15,
  },

  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  avatarWrapper: {
  width: ITEM_SIZE,
  height: ITEM_SIZE,
  borderRadius: 10,
  backgroundColor: '#E8E8E8',
  justifyContent: 'center',
  alignItems: 'center',
},

  avatarSelected: {
    borderWidth: 3,
    borderColor: '#d62edc',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },

  missingImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#E8E8E8',
  },

  bottomFixed: {
    position: 'absolute',
    bottom: height * 0.025,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});