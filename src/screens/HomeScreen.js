import React, { useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { userDatarequest } from '../features/user/userAction';
import { SocketContext } from '../socket/SocketProvider';
import { randomUserRequest } from '../features/RandomUsers/randomuserAction';
import StoriesScreen from './StoriesScreen';
import LikeMindedSectionScreen from '../screens/LikeMindedSectionScreen';
import OffersSectionScreen from '../screens/OffersSectionScreen';
import ActiveDostSectionScreen from '../screens/ActiveDostSectionScreen';
import coinImg from '../assets/coin1.png';
import LinearGradient from 'react-native-linear-gradient';
import BottomCallPills from '../components/BottomCallPills';
import { callRequest } from '../features/calls/callAction';
import { useFocusEffect } from '@react-navigation/native';
import { fetchUnreadCount } from '../features/notification/notificationAction';

const { width, height } = Dimensions.get('window');
const wp = v => (width * v) / 100;
const hp = v => (height * v) / 100;
const iconSize = v => wp(v);

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { socketRef } = useContext(SocketContext);
  const socket = socketRef?.current;
  const { userdata } = useSelector(state => state.user);
  // const { incoming } = useSelector(state => state.friends);
  console.log(userdata);
  const unread = useSelector(state => state.notification.unread);
  console.log('Unread notifications:', unread);
  const profilePhotoURL = userdata?.images?.profile_image;
  const { connected } = useContext(SocketContext);

  const [callingRandom, setCallingRandom] = React.useState(false);
  const [callingRandomVideo, setCallingRandomVideo] = React.useState(false);

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
    React.useCallback(() => {
      setCallingRandom(false);
      setCallingRandomVideo(false);
    }, []),
  );

  const imageUrl = profilePhotoURL
    ? { uri: profilePhotoURL }
    : require('../assets/boy2.jpg');

 useEffect(() => {
  dispatch(userDatarequest());
  dispatch(randomUserRequest());
  dispatch(fetchUnreadCount()); // 👈 important
}, [dispatch]);

  useEffect(() => {
    if (!socket) return;

    const onPresence = data => console.log('👤 Presence:', data);
    socket.on('presence_update', onPresence);

    return () => socket.off('presence_update', onPresence);
  }, [socket]);

  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.root}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.headerRow}>
            {/* COIN BOX */}
            <LinearGradient
              colors={['#FFA726', '#FF7043']} // orange → reddish gradient (like image)
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.coinBox}
            >
              <Image source={coinImg} style={styles.coinImage} />
              <Text style={styles.coinText}>
                {userdata?.user?.coin_balance ?? 0}
              </Text>
            </LinearGradient>

            {/* MESSAGE ICON */}
            <TouchableOpacity
              style={{ marginHorizontal: wp(2) }}
              onPress={() => navigation.navigate('MessagesScreen')}
            >
              <View style={styles.iconCircle}>
                <Icon
                  name="message-processing-outline"
                  size={wp(5)}
                  color="#fff"
                  backgroundColor="#ce17fc"
                />
              </View>
            </TouchableOpacity>

            {/* BELL + BADGE */}
            <TouchableOpacity
              style={styles.bellWrap}
              onPress={() => navigation.navigate('NotificationScreen')}
            >
              <View style={styles.iconCircle}>
                <Icon name="bell-outline" size={iconSize(6)} color="#fff" />
              </View>
              {/* {incoming?.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{incoming.length}</Text>
                </View>
              )} */}
              {unread > 0 && (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>{unread}</Text>
  </View>
)}
            </TouchableOpacity>

            {/* PROFILE */}
            <TouchableOpacity
              onPress={() => navigation.navigate('UplodePhotoScreen')}
            >
              <Image source={imageUrl} style={styles.profilePic} />
            </TouchableOpacity>
          </View>

          {/* SEARCH */}
          <View style={styles.searchContainer}>
            <Icon
              name="magnify"
              size={iconSize(8)}
              color="#999"
              marginLeft="30"
            />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#8E8E93"
              style={styles.searchInput}
            />
          </View>

          {/* STORIES */}
          <StoriesScreen />

          {/* OFFERS SECTION */}
          <OffersSectionScreen />

          {/* LIKE MINDED SECTION */}
          <LikeMindedSectionScreen />

          {/* ACTIVE DOST SECTION */}
          <ActiveDostSectionScreen />

          <BottomCallPills
            callingRandom={callingRandom}
            callingRandomVideo={callingRandomVideo}
            onRandomAudio={startRandomAudioCall}
            onRandomVideo={startRandomVideoCall}
          />

          <View style={{ height: hp(12) }} />
        </ScrollView>
      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },

  container: {
    // paddingHorizontal: wp(5),
    // paddingTop: hp(2),
  },
  coinImage: {
    width: wp(8),
    height: wp(8),
    resizeMode: 'contain',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: hp(2),
    marginTop: hp(4),
    paddingHorizontal: wp(3),
  },

  coinBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    height: hp(4.8),
    borderRadius: wp(10), // fully rounded pill
    marginRight: 'auto', // push to left properly
    elevation: 4, // soft shadow (Android)
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
    borderColor: '#C084FC', // soft purple
    borderRadius: wp(6), // more rounded like image
    paddingHorizontal: wp(4),
    height: hp(5.5),
    marginTop: hp(2),
    marginHorizontal: wp(3), // 👈 Add this

    backgroundColor: '#fff',
  },

  searchInput: {
    flex: 1,
    fontSize: wp(4),
    marginLeft: wp(2),
    color: '#000',
  },

  bottomActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(4),
  },

  connectBox: {
    width: '30%',
    backgroundColor: '#8B5CF6',
    borderRadius: wp(4),
    alignItems: 'center',
    paddingVertical: hp(2),
  },

  connectBoxActive: {
    width: '30%',
    backgroundColor: '#7054e8',
    borderRadius: wp(4),
    alignItems: 'center',
    paddingVertical: hp(2),
  },

  connectText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: wp(3),
    marginTop: hp(0.7),
  },
});
