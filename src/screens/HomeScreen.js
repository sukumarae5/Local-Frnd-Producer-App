import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  FlatList,
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

import coinImg from '../assets/coin1.png';

const { width, height } = Dimensions.get('window');
const wp = v => (width * v) / 100;
const hp = v => (height * v) / 100;
const iconSize = v => wp(v);

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
          <BottomCallPills
            callingRandom={callingRandom}
            callingRandomVideo={callingRandomVideo}
            onRandomAudio={startRandomAudioCall}
            onRandomVideo={startRandomVideoCall}
          />
        );
      default:
        return null;
    }
  };

  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.root}>

        {/* HEADER */}
        <View style={styles.headerContainer}>

          <View style={styles.headerRow}>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('PlanScreen')}
            >
              <LinearGradient
                colors={['#FFA726', '#FF7043']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.coinBox}
              >
                <Image source={coinImg} style={styles.coinImage} />
                <Text style={styles.coinText}>
                  {userdata?.user?.coin_balance ?? 0}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.rightIcons}>

              <TouchableOpacity
                style={{ marginHorizontal: wp(2) }}
                onPress={() => navigation.navigate('MessagesScreen')}
              >
                <View style={styles.iconCircle}>
                  <Icon name="message-processing-outline" size={wp(5)} color="#fff" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bellWrap}
                onPress={() => navigation.navigate('NotificationScreen')}
              >
                <View style={styles.iconCircle}>
                  <Icon name="bell-outline" size={iconSize(6)} color="#fff" />
                </View>

                {unread > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unread}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('UplodePhotoScreen')}
              >
                <Image source={imageUrl} style={styles.profilePic} />
              </TouchableOpacity>

            </View>

          </View>

          {/* SEARCH */}
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={iconSize(8)} color="#999" />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#8E8E93"
              style={styles.searchInput}
            />
          </View>

        </View>

        {/* FLATLIST CONTENT */}
        <FlatList
          data={sections}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: hp(10) }}
        />

      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },

  headerContainer: {
    paddingHorizontal: wp(3),
    marginTop: hp(4),
    zIndex: 10,
    elevation: 10,
  },

  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },

  coinBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    height: hp(4.8),
    borderRadius: wp(10),
    marginRight: 'auto',
    elevation: 4,
  },

  coinImage: {
    width: wp(8),
    height: wp(8),
    resizeMode: 'contain',
  },

  coinText: {
    marginLeft: wp(2),
    fontSize: wp(3.8),
    fontWeight: '800',
    color: '#fff',
  },

  bellWrap: {
    marginHorizontal: wp(2),
    position: 'relative',
  },

  profilePic: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    borderWidth: 2,
    borderColor: '#A35DFE',
  },

  iconCircle: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(5.5),
    backgroundColor: '#ce17fc',
    justifyContent: 'center',
    alignItems: 'center',
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff0044',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C084FC',
    borderRadius: wp(6),
    paddingHorizontal: wp(4),
    height: hp(5.5),
    marginTop: hp(1),
    backgroundColor: '#fff',
  },

  searchInput: {
    flex: 1,
    fontSize: wp(4),
    marginLeft: wp(2),
    color: '#000',
  },
});