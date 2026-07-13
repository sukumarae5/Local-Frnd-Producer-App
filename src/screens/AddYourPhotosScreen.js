import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Alert,
  PermissionsAndroid,
  ScrollView,
  InteractionManager,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { useDispatch } from 'react-redux';

import { userpostphotorequest } from '../features/photo/photoAction';

import WelcomeScreenbackgroundgpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import ContinueButton from '../components/Common/ContinueButton';

import { useAppTheme } from '../theme';
import { AppText } from '../components';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const AddYourPhotosScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();

  const { theme } = useAppTheme();

  const { colors, spacing, radius } = theme;

  const { height } = useWindowDimensions();

  const styles = useMemo(() => createStyles(theme, height), [theme, height]);

  const existingPhotos = route?.params?.existingPhotos || [];

  const from = route?.params?.from;

  const [newPhotos, setNewPhotos] = useState([]);

  const [uploading, setUploading] = useState(false);

  const totalPhotos = [...existingPhotos, ...newPhotos];

  /* ---------------- CAMERA PERMISSION ---------------- */

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  };

  /* ---------------- IMAGE VALIDATION ---------------- */

  const validateImage = asset => {
    if (!asset) return false;

    if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
      Alert.alert('Large Image', 'Please select an image smaller than 5 MB.');

      return false;
    }

    return true;
  };

  /* ---------------- CAMERA ---------------- */

  const openCamera = async () => {
    const granted = await requestCameraPermission();

    if (!granted) {
      Alert.alert('Permission', 'Camera permission denied.');

      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.6,
        maxWidth: 1080,
        maxHeight: 1080,
      },
      response => {
        if (response.didCancel || response.errorCode) return;

        const asset = response.assets?.[0];

        if (!validateImage(asset)) return;

        setNewPhotos(prev => [...prev, asset]);
      },
    );
  };

  /* ---------------- GALLERY ---------------- */

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.6,
        maxWidth: 1080,
        maxHeight: 1080,
      },
      response => {
        if (response.didCancel || response.errorCode) return;

        const asset = response.assets?.[0];

        if (!validateImage(asset)) return;

        setNewPhotos(prev => [...prev, asset]);
      },
    );
  };

  /* ---------------- PHOTO OPTION ---------------- */

  const openSelectOption = () => {
    if (totalPhotos.length >= 4) {
      Alert.alert('Limit Reached', 'Maximum 4 photos allowed.');

      return;
    }

    InteractionManager.runAfterInteractions(() => {
      Alert.alert('Upload Photo', 'Choose an option', [
        {
          text: 'Camera',
          onPress: openCamera,
        },
        {
          text: 'Gallery',
          onPress: openGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]);
    });
  };

  /* ---------------- UPLOAD ---------------- */

  const handleUploadPhotos = () => {
    if (newPhotos.length === 0) {
      Alert.alert('No Photos', 'Please select at least one photo.');
      return;
    }

    const formData = new FormData();

    newPhotos.forEach((photo, index) => {
      formData.append('photos', {
        uri: photo.uri,
        type: photo.type || 'image/jpeg',
        name: photo.fileName || `photo_${Date.now()}_${index}.jpg`,
      });
    });

    setUploading(true);

    dispatch(
      userpostphotorequest(formData, response => {
        setUploading(false);

        if (response.success) {
          Alert.alert('Success', response.message, [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('SelectYourIdealMatchScreen');
              },
            },
          ]);
        } else {
          Alert.alert('Upload Failed', response.message);
        }
      }),
    );
  };

  return (
    <WelcomeScreenbackgroundgpage>
      <SafeAreaView style={styles.flex} edges={[]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}

          <View style={styles.headerRow}>
            <TouchableOpacity
              hitSlop={theme.hitSlop}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={22} color={colors.icon} />
            </TouchableOpacity>

            <AppText variant="h4" style={styles.header}>
              Add Your Photos
            </AppText>
          </View>

          {/* Photo Grid */}

          <View style={styles.grid}>
            {Array.from({ length: 4 }).map((_, index) => {
              const photo = totalPhotos[index];

              if (photo?.photo_url) {
                return (
                  <View
                    key={`existing-${photo.photo_id}`}
                    style={styles.gridItem}
                  >
                    <Image
                      source={{
                        uri: photo.photo_url,
                      }}
                      style={styles.image}
                    />
                  </View>
                );
              }

              if (photo?.uri) {
                return (
                  <View key={`new-${index}`} style={styles.gridItem}>
                    <Image
                      source={{
                        uri: photo.uri,
                      }}
                      style={styles.image}
                    />
                  </View>
                );
              }

              if (index === totalPhotos.length) {
                return (
                  <TouchableOpacity
                    key={`add-${index}`}
                    activeOpacity={0.8}
                    style={styles.addBox}
                    onPress={openSelectOption}
                  >
                    <Ionicons name="add" size={40} color="#C56CF0" />
                  </TouchableOpacity>
                );
              }

              return (
                <View key={`empty-${index}`} style={styles.placeholderBox}>
                  <AppText variant="bodySmall" color="textMuted">
                    160 × 210
                  </AppText>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom */}

        <View style={styles.bottomFixed}>
          {uploading ? (
            <ActivityIndicator size="large" color="#d62edc" />
          ) : (
            <ContinueButton
              title="CONTINUE"
              disabled={newPhotos.length === 0}
              onPress={handleUploadPhotos}
            />
          )}

          <TouchableOpacity
            style={styles.skipWrap}
            onPress={() => navigation.navigate('SelectYourIdealMatchScreen')}
          >
            <AppText variant="subtitle" style={styles.skipText}>
              NOT NOW
            </AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </WelcomeScreenbackgroundgpage>
  );
};

export default AddYourPhotosScreen;

const createStyles = (theme, height) => {
  const { colors, spacing, radius } = theme;

  const ITEM_HEIGHT = height * 0.26;

  return StyleSheet.create({
    flex: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom: height * 0.18,
    },

    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      marginTop: spacing.sm,
    },

    header: {
      marginLeft: spacing.sm,
    },

    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      marginTop: spacing.md,
    },

    gridItem: {
      width: '48%',
      height: ITEM_HEIGHT,
      marginBottom: spacing.sm,
      borderRadius: radius.lg,
      overflow: 'hidden',
      backgroundColor: colors.surface,
    },

    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },

    addBox: {
      width: '48%',
      height: ITEM_HEIGHT,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: '#C56CF0',
      backgroundColor: '#FEEBFF',
      borderRadius: radius.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },

    placeholderBox: {
      width: '48%',
      height: ITEM_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
    },

    bottomFixed: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: spacing.md,
      alignItems: 'center',
    },

    skipWrap: {
      marginTop: spacing.sm,
    },

    skipText: {
      color: '#666',
    },
  });
};
