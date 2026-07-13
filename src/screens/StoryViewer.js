import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  deleteStatusRequest,
  viewStatusRequest,
  getViewersRequest,
} from '../features/Status/statusActions';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

// Intentionally fixed dark palette — story viewers stay dark regardless of
// app theme, for image/video contrast, matching platform conventions.
const viewerColors = {
  background: '#000000',
  text: '#FFFFFF',
  textMuted: '#AAAAAA',
  textFaint: '#888888',
  sheet: '#111111',
  progressTrack: 'rgba(255,255,255,0.3)',
};

const formatTimeAgo = time => {
  if (!time) return '';

  const now = new Date();
  const viewedTime = new Date(time);
  const diff = Math.floor((now - viewedTime) / 1000);

  if (diff < 60) return 'Just now';

  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';

  return `${days} days ago`;
};

const StoryViewer = ({ route, navigation }) => {
  const { stories, index, isMyStatus } = route.params;

  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { spacing, radius } = theme;
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(
    () => createStyles(theme, width, height),
    [theme, width, height],
  );

  const viewers = useSelector(state => state.status.viewers);

  const [currentIndex, setCurrentIndex] = useState(index);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;
  const animation = useRef(null);
  const viewedStories = useRef(new Set());

  const handleDelete = () => {
    if (!isMyStatus) return;

    const currentStory = stories[currentIndex];

    Alert.alert('Delete', 'Delete this story?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => {
          dispatch(deleteStatusRequest(currentStory?.status_id));
          navigation.goBack();
        },
      },
    ]);
  };

  useEffect(() => {
    if (!stories.length) return;

    const currentStory = stories[currentIndex];
    if (isMyStatus) return;
    if (viewedStories.current.has(currentStory?.status_id)) return;

    viewedStories.current.add(currentStory?.status_id);
    dispatch(viewStatusRequest({ status_id: currentStory?.status_id }));
  }, [currentIndex]);

  const startAnimation = () => {
    animation.current = Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
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
    outputRange: ['0%', '100%'],
  });

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
      onPress={e => {
        const x = e.nativeEvent.locationX;
        if (x < width / 2) prevStory();
        else nextStory();
      }}
      onPressIn={() => setIsPaused(true)}
      onPressOut={() => setIsPaused(false)}
    >
      <View style={styles.container}>
        <View style={[styles.header, { top: insets.top + spacing.sm }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon
              name="arrow-left"
              size={moderateScale(26)}
              color={viewerColors.text}
            />
          </TouchableOpacity>

          {isMyStatus && (
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={handleViewers}
                style={styles.viewCountBtn}
              >
                <Icon
                  name="eye-outline"
                  size={moderateScale(26)}
                  color={viewerColors.text}
                />
                <AppText variant="bodySmall" style={styles.viewCountText}>
                  {viewers?.length || 0}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDelete}>
                <Icon
                  name="delete"
                  size={moderateScale(26)}
                  color={viewerColors.text}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View
          style={[styles.progressContainer, { top: insets.top - spacing.xs }]}
        >
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
                    { width: i < currentIndex ? '100%' : '0%' },
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        <Image
          source={{ uri: stories[currentIndex]?.media_url }}
          style={styles.image}
        />

        {showViewers && (
          <View
            style={[
              styles.viewerContainer,
              { paddingBottom: insets.bottom + spacing.md },
            ]}
          >
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                setShowViewers(false);
                setIsPaused(false);
              }}
            >
              <Icon
                name="close"
                size={moderateScale(26)}
                color={viewerColors.text}
              />
            </TouchableOpacity>

            <FlatList
              data={viewers || []}
              keyExtractor={(item, i) => i.toString()}
              renderItem={({ item }) => (
                <View style={styles.viewerItem}>
                  <Icon
                    name="account-circle"
                    size={moderateScale(40)}
                    color={viewerColors.text}
                  />
                  <View style={styles.viewerInfo}>
                    <AppText variant="body" style={styles.viewerName}>
                      {item?.name}
                    </AppText>
                    <AppText variant="bodySmall" style={styles.viewerUsername}>
                      @{item?.username}
                    </AppText>
                    <AppText variant="caption" style={styles.viewerTime}>
                      {formatTimeAgo(item?.viewed_at)}
                    </AppText>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <AppText variant="body" style={styles.emptyViewers}>
                  No viewers yet
                </AppText>
              }
            />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default StoryViewer;

const createStyles = (theme, width, height) => {
  const { spacing, radius } = theme;

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: viewerColors.background },

    image: { width, height, resizeMode: 'cover' },

    header: {
      position: 'absolute',
      width: '100%',
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 20,
    },

    headerRight: { flexDirection: 'row', alignItems: 'center' },

    viewCountBtn: {
      marginRight: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
    },

    viewCountText: { color: viewerColors.text, marginLeft: spacing.xs },

    progressContainer: {
      position: 'absolute',
      flexDirection: 'row',
      width: '100%',
      paddingHorizontal: spacing.sm,
      zIndex: 10,
    },

    progressBarBackground: {
      flex: 1,
      height: moderateScale(3),
      backgroundColor: viewerColors.progressTrack,
      marginHorizontal: spacing.xxs,
      borderRadius: radius.xs,
      overflow: 'hidden',
    },

    progressBarFill: { height: '100%', backgroundColor: viewerColors.text },

    viewerContainer: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      maxHeight: height * 0.5,
      backgroundColor: viewerColors.sheet,
      padding: spacing.lg,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
    },

    viewerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },

    viewerInfo: { marginLeft: spacing.sm },

    viewerName: { color: viewerColors.text },
    viewerUsername: { color: viewerColors.textMuted },
    viewerTime: { color: viewerColors.textFaint, marginTop: spacing.xxs },

    closeBtn: { alignSelf: 'flex-end', marginBottom: spacing.sm },

    emptyViewers: { color: viewerColors.text, textAlign: 'center' },
  });
};
