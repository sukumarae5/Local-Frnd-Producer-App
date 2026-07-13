import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { moderateScale } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import {
  createStatusRequest,
  getMyStatusRequest,
  getFriendStatusRequest,
} from '../features/Status/statusActions';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const StoriesScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing } = theme;
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const { myStatus, friendStatus } = useSelector(state => state.status);

  const stories = myStatus?.data || [];

  const friendStories = Array.isArray(friendStatus)
    ? friendStatus
    : friendStatus?.data || [];

  const groupedFriendStories = Object.values(
    (friendStories || []).reduce((acc, item) => {
      if (!item?.user_id) return acc;

      if (!acc[item.user_id]) {
        acc[item.user_id] = {
          user_id: item.user_id,
          user_name: item.name,
          stories: [],
        };
      }

      acc[item.user_id].stories.push(item);
      return acc;
    }, {}),
  );

  useEffect(() => {
    dispatch(getMyStatusRequest());
    dispatch(getFriendStatusRequest());
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const openCamera = async () => {
    const permitted = await requestCameraPermission();
    if (!permitted) return Alert.alert('Permission Denied');

    launchCamera({ mediaType: 'photo' }, res => {
      const img = res.assets?.[0];
      if (!img) return;

      dispatch(
        createStatusRequest({
          uri: img.uri,
          type: img.type,
          name: img.fileName || 'story.jpg',
        }),
      );
    });
  };

  const openGallery = () => {
    launchImageLibrary({ mediaType: 'photo' }, res => {
      const img = res.assets?.[0];
      if (!img) return;

      dispatch(
        createStatusRequest({
          uri: img.uri,
          type: img.type,
          name: img.fileName || 'story.jpg',
        }),
      );
    });
  };

  const openSelectOption = () => {
    Alert.alert('Add Story', 'Choose', [
      { text: 'Camera', onPress: openCamera },
      { text: 'Gallery', onPress: openGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.storyContainer}
          onPress={openSelectOption}
        >
          <LinearGradient
            colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            useAngle
            angle={75.05}
            style={styles.addCircle}
          >
            <Icon
              name="plus"
              size={moderateScale(30)}
              color={colors.textInverse}
            />
          </LinearGradient>
          <AppText variant="caption" style={styles.storyName}>
            Add Story
          </AppText>
        </TouchableOpacity>

        {stories.length > 0 && (
          <TouchableOpacity
            style={styles.storyContainer}
            onPress={() =>
              navigation.navigate('StoryViewer', {
                stories,
                index: 0,
                isMyStatus: true,
              })
            }
          >
            <LinearGradient
              colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              useAngle
              angle={75.05}
              style={styles.storyRing}
            >
              <Image
                source={{ uri: stories[0]?.media_url }}
                style={styles.storyAvatar}
              />
            </LinearGradient>
            <AppText variant="caption" style={styles.storyName}>
              Your Story
            </AppText>
          </TouchableOpacity>
        )}

        {groupedFriendStories.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.storyContainer}
            onPress={() =>
              navigation.navigate('StoryViewer', {
                stories: item.stories,
                index: 0,
                isMyStatus: false,
              })
            }
          >
            <LinearGradient
              colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              useAngle
              angle={75.05}
              style={styles.storyRing}
            >
              <Image
                source={{ uri: item.stories?.[0]?.media_url }}
                style={styles.storyAvatar}
              />
            </LinearGradient>
            <AppText
              variant="caption"
              style={styles.storyName}
              numberOfLines={1}
            >
              {item.user_name || 'Friend'}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default StoriesScreen;

const createStyles = theme => {
  const { colors, spacing } = theme;

  return StyleSheet.create({
    container: {
      paddingHorizontal: spacing.lg,
    },

    storyContainer: {
      alignItems: 'center',
      marginRight: spacing.md,
      maxWidth: moderateScale(72),
    },

    addCircle: {
      width: moderateScale(60),
      height: moderateScale(60),
      borderRadius: moderateScale(30),
      justifyContent: 'center',
      alignItems: 'center',
    },

    storyRing: {
      width: moderateScale(66),
      height: moderateScale(66),
      borderRadius: moderateScale(33),
      justifyContent: 'center',
      alignItems: 'center',
      padding: moderateScale(3),
    },

    storyAvatar: {
      width: moderateScale(60),
      height: moderateScale(60),
      borderRadius: moderateScale(30),
    },

    storyName: {
      marginTop: spacing.xs,
      color: colors.text,
      textAlign: 'center',
    },
  });
};
