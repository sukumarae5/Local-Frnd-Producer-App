import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  FlatList,
  Platform,
  StatusBar,
} from 'react-native';

import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

import { SocketContext } from '../socket/SocketProvider';

import { userDatarequest } from '../features/user/userAction';
import { randomUserRequest } from '../features/RandomUsers/randomuserAction';
import { fetchUnreadCount } from '../features/notification/notificationAction';
import { callRequest } from '../features/calls/callAction';
import StoriesScreen from './StoriesScreen';
import LikeMindedSectionScreen from './LikeMindedSectionScreen';
import OffersSectionScreen from './OffersSectionScreen';
import ActiveDostSectionScreen from './ActiveDostSectionScreen';
import BottomCallPills from '../components/BottomCallPills';
import HomeHeader from '../components/HomeHeader';

const { width, height } = Dimensions.get('window');

const wp = value => (width * value) / 100;
const hp = value => (height * value) / 100;

const isSmallDevice = width < 360;

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { socketRef, connected } = useContext(SocketContext);
  const socket = socketRef?.current;

  const { userdata } = useSelector(state => state.user);
  const unread = useSelector(state => state.notification.unread);

  const [callingRandom, setCallingRandom] = useState(false);
  const [callingRandomVideo, setCallingRandomVideo] = useState(false);

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
    dispatch(userDatarequest());
    dispatch(randomUserRequest());
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;

    const onPresence = data => {
      console.log('👤 Presence:', data);
    };

    socket.on('presence_update', onPresence);

    return () => {
      socket.off('presence_update', onPresence);
    };
  }, [socket]);

  const imageUrl = userdata?.images?.profile_image
    ? { uri: userdata.images.profile_image }
    : require('../assets/boy2.jpg');

  const sections = [
    { id: 'stories' },
    { id: 'offers' },
    { id: 'like' },
    { id: 'active' },
    { id: 'calls' },
  ];

  const renderItem = ({ item }) => {
    switch (item.id) {
      case 'stories':
        return <StoriesScreen />;
      case 'offers':
        return <OffersSectionScreen />;
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
          barStyle="dark-content"
        />

        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <HomeHeader
              withSpacing
              navigation={navigation}
              userdata={userdata}
              unread={unread}
              imageUrl={imageUrl}
              wp={wp}
              hp={hp}
            />

            <View style={styles.searchContainer}>
              <Icon name="magnify" size={wp(5.5)} color="#999" />
              <TextInput
                placeholder="Search"
                placeholderTextColor="#8E8E93"
                style={styles.searchInput}
              />
            </View>
          </View>

          <FlatList
            data={sections}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerContainer: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(1.2),
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(1.5),
  },

  coinWrapper: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: wp(2),
  },

  coinBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? wp(3.2) : wp(4),
    height: isSmallDevice ? hp(5) : hp(5.2),
    borderRadius: wp(8),
    minWidth: isSmallDevice ? wp(24) : wp(26),
    maxWidth: isSmallDevice ? wp(30) : wp(35),
    elevation: 4,
  },

  coinImage: {
    width: isSmallDevice ? wp(6.2) : wp(7),
    height: isSmallDevice ? wp(6.2) : wp(7),
    resizeMode: 'contain',
  },

  coinText: {
    marginLeft: wp(2),
    fontSize: isSmallDevice ? wp(3.5) : wp(3.8),
    fontWeight: '800',
    color: '#fff',
  },

  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0,
  },

  iconButton: {
    marginLeft: isSmallDevice ? wp(1.5) : wp(2.2),
    position: 'relative',
  },

  profileButton: {
    marginLeft: isSmallDevice ? wp(1.5) : wp(2.2),
  },

  iconCircle: {
    width: isSmallDevice ? wp(9) : wp(10),
    height: isSmallDevice ? wp(9) : wp(10),
    borderRadius: isSmallDevice ? wp(4.5) : wp(5),
    backgroundColor: '#ce17fc',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profilePic: {
    width: isSmallDevice ? wp(9) : wp(10),
    height: isSmallDevice ? wp(9) : wp(10),
    borderRadius: isSmallDevice ? wp(4.5) : wp(5),
    borderWidth: 2,
    borderColor: '#A35DFE',
  },

  badge: {
    position: 'absolute',
    top: -hp(0.5),
    right: -wp(1),
    backgroundColor: '#ff0044',
    borderRadius: wp(3),
    minWidth: isSmallDevice ? wp(5) : wp(5.5),
    height: isSmallDevice ? wp(5) : wp(5.5),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(0.8),
  },

  badgeText: {
    color: '#fff',
    fontSize: isSmallDevice ? wp(2.2) : wp(2.4),
    fontWeight: '700',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C084FC',
    borderRadius: wp(4),
    paddingHorizontal: wp(4),
    height: hp(5.8),
    backgroundColor: '#fff',
  },

  searchInput: {
    flex: 1,
    fontSize: wp(3.8),
    marginLeft: wp(2),
    color: '#000',
    paddingVertical: 0,
  },

  listContent: {
    paddingBottom: hp(2),
  },

  callsWrapper: {
    marginBottom: hp(0.5),
  },
});
