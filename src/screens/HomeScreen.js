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
  const { incoming } = useSelector(state => state.friends);

  const profilePhotoURL = userdata?.primary_image?.photo_url;
  const imageUrl = profilePhotoURL
    ? { uri: profilePhotoURL }
    : require('../assets/boy2.jpg');

  useEffect(() => {
    dispatch(userDatarequest());
    dispatch(randomUserRequest());
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
            <View style={styles.coinBox}>
              <Icon name="currency-eth" size={iconSize(5)} color="#FFD700" />
              <Text style={styles.coinText}>
                {userdata?.user?.coin_balance ?? 0}
              </Text>
            </View>

            {/* MESSAGE ICON */}
            <TouchableOpacity
              style={{ marginHorizontal: wp(2) }}
              onPress={() => navigation.navigate('MessagesScreen')}
            >
              <Icon
                name="message-text-outline"
                size={iconSize(6)}
                color="#000"
              />
            </TouchableOpacity>

            {/* BELL + BADGE */}
            <TouchableOpacity
              style={styles.bellWrap}
              onPress={() => navigation.navigate('NotificationScreen')}
            >
              <Icon name="bell-outline" size={iconSize(6)} color="#000" />
              {incoming?.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{incoming.length}</Text>
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
            <Icon name="magnify" size={iconSize(6)} color="#999" />
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

          {/* RANDOM CALL BUTTONS */}
          <View style={styles.bottomActionRow}>
            <TouchableOpacity
              style={styles.connectBox}
              onPress={() => navigation.navigate('TrainersCallpage')}
            >
              <Icon name="dice-5" size={iconSize(6)} color="#fff" />
              <Text style={styles.connectText}>Random Calls</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.connectBox}>
              <Icon name="map-marker" size={iconSize(6)} color="#fff" />
              <Text style={styles.connectText}>Local Calls</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.connectBoxActive}>
              <Icon name="account-multiple" size={iconSize(6)} color="#fff" />
              <Text style={styles.connectText}>Followed Calls</Text>
            </TouchableOpacity>
          </View>

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
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: hp(2),
    marginTop: 30,
  },

  coinBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5D8',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: wp(4),
    marginRight: wp(40),
  },

  coinText: {
    marginLeft: wp(2),
    fontSize: wp(4),
    fontWeight: '700',
    color: '#000',
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
    borderWidth: 1,
    borderColor: '#b678f5ff',
    borderRadius: wp(4),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    marginTop: hp(1),
    backgroundColor: '#faf8fbff',
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
