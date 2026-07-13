import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  TextInput,
  FlatList,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { moderateScale, verticalScale, scale } from 'react-native-size-matters';

import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { SocketContext } from '../socket/SocketProvider';
import { useAppTheme } from '../theme';
import LinearGradient from 'react-native-linear-gradient';
import { userDatarequest } from '../features/user/userAction';
import { randomUserRequest } from '../features/RandomUsers/randomuserAction';
import { fetchUnreadCount } from '../features/notification/notificationAction';
import { callRequest } from '../features/calls/callAction';
import StoriesScreen from './StoriesScreen';
import LikeMindedSectionScreen from './LikeMindedSectionScreen';
import MaleOffersScreen from './MaleOffersScreen';
import ActiveDostSectionScreen from './ActiveDostSectionScreen';
import BottomCallPills from '../components/BottomCallPills';
import HomeHeader from '../components/HomeHeader';

// Temporary shim only for HomeHeader's wp/hp props — remove once HomeHeader is themed.
const { width, height } = Dimensions.get('window');
const wp = value => (width * value) / 100;
const hp = value => (height * value) / 100;

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

  const { socketRef, connected } = useContext(SocketContext);
  const socket = socketRef?.current;

  const { userdata } = useSelector(state => state.user);
  const unread = useSelector(state => state.notification.unread);
  const coinBalance = userdata?.user?.coin_balance ?? 0;

  const [callingRandom, setCallingRandom] = useState(false);
  const [callingRandomVideo, setCallingRandomVideo] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refreshHomeData = useCallback(() => {
    dispatch(userDatarequest());
    dispatch(randomUserRequest());
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshHomeData();
    setTimeout(() => setRefreshing(false), 1000);
  }, [refreshHomeData]);

  const startRandomAudioCall = () => {
    if (!connected || callingRandom || callingRandomVideo) return;
    setCallingRandom(true);
    dispatch(callRequest({ call_type: 'AUDIO' }));
    navigation.navigate('CallStatusScreen', {
      call_type: 'AUDIO',
      role: 'male',
    });
  };

  const startRandomVideoCall = () => {
    if (!connected || callingRandom || callingRandomVideo) return;
    setCallingRandomVideo(true);
    dispatch(callRequest({ call_type: 'VIDEO' }));
    navigation.navigate('CallStatusScreen', {
      call_type: 'VIDEO',
      role: 'male',
    });
  };

  useFocusEffect(
    useCallback(() => {
      setCallingRandom(false);
      setCallingRandomVideo(false);
    }, []),
  );

  useEffect(() => {
    refreshHomeData();
  }, [refreshHomeData]);

  useEffect(() => {
    if (!socket) return;
    const onPresence = data => {
      console.log('👤 Presence:', data);
    };
    socket.on('presence_update', onPresence);
    return () => socket.off('presence_update', onPresence);
  }, [socket]);

  const imageUrl = userdata?.images?.display_profile_image
    ? { uri: userdata.images.display_profile_image }
    : require('../assets/boy2.jpg');

  const sections = [
    { id: 'stories' },
    { id: 'offers' },
    { id: 'like' },
    { id: 'active' },
    { id: 'calls' },
  ];

  const styles = useMemo(
    () => createStyles(theme, width, height),
    [theme, width, height],
  );
  const renderItem = ({ item }) => {
    switch (item.id) {
      case 'stories':
        return <StoriesScreen />;
      case 'offers':
        return <MaleOffersScreen />;
      case 'like':
        return <LikeMindedSectionScreen />;
      case 'active':
        return <ActiveDostSectionScreen />;
      case 'calls':
        return (
          <View style={styles.callsWrapper}>
            <BottomCallPills
              callingRandom={callingRandom}
              callingRandomVideo={callingRandomVideo}
              onRandomAudio={startRandomAudioCall}
              onRandomVideo={startRandomVideoCall}
              coinBalance={coinBalance}
              navigation={navigation}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={colors.statusBar}
        />

        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <HomeHeader
              withSpacing
              navigation={navigation}
              userdata={userdata}
              unread={unread}
              imageUrl={imageUrl}
            />

            <LinearGradient
              colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              angle={75.05}
              useAngle
              style={styles.searchGradient}
            >
              <View style={styles.searchContainer}>
                <Icon
                  name="magnify"
                  size={moderateScale(22)}
                  color={colors.gradientPurpleStart}
                />

                <TextInput
                  placeholder="Search"
                  placeholderTextColor={colors.placeholder}
                  style={styles.searchInput}
                />
              </View>
            </LinearGradient>
          </View>

          <FlatList
            data={sections}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        </View>
      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default HomeScreen;

const createStyles = theme => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    container: { flex: 1 },

    headerContainer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },

    coinWrapper: {
      flex: 1,
      alignItems: 'flex-start',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },

    coinBox: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      height: verticalScale(42),
      borderRadius: radius.pill,
      minWidth: scale(90),
      maxWidth: scale(120),
      ...theme.shadows.sm,
    },

    coinImage: {
      width: moderateScale(24),
      height: moderateScale(24),
      resizeMode: 'contain',
    },

    coinText: {
      marginLeft: spacing.sm,
      fontWeight: '800',
      color: colors.textInverse,
    },

    rightIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flexShrink: 0,
    },

    iconButton: {
      marginLeft: spacing.sm,
      position: 'relative',
    },

    profileButton: {
      marginLeft: spacing.sm,
    },

    iconCircle: {
      width: moderateScale(38),
      height: moderateScale(38),
      borderRadius: moderateScale(19),
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },

    profilePic: {
      width: moderateScale(38),
      height: moderateScale(38),
      borderRadius: moderateScale(19),
      borderWidth: 2,
      borderColor: colors.secondary,
    },

    badge: {
      position: 'absolute',
      top: -verticalScale(4),
      right: -scale(4),
      backgroundColor: colors.error,
      borderRadius: radius.pill,
      minWidth: moderateScale(20),
      height: moderateScale(20),
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xxs,
    },

    badgeText: {
      color: colors.textInverse,
      fontWeight: '700',
    },

    searchGradient: {
      borderRadius: radius.lg,
      padding: 1, // Border thickness
    },

    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      height: verticalScale(46),
      backgroundColor: colors.card,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      color: colors.text,
      paddingVertical: 0,
      fontSize: theme.fontSizes.base,
    },

    listContent: {
      paddingBottom: spacing.xl,
    },

    callsWrapper: {
      marginBottom: spacing.xs,
    },
  });
};
