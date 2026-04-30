import React, { useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';

import ReceiverHeader from '../components/ReceiverHeader';
import StoriesScreen from './StoriesScreen';
import OffersSectionScreen from './OffersSectionScreen';
import LikeMindedSectionScreen from './LikeMindedSectionScreen';
import ActiveDostSectionScreen from './ActiveDostSectionScreen';
import GoOnlineCard from '../components/GoOnlineCard';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';

import { userDatarequest } from '../features/user/userAction';
import { fetchUnreadCount } from '../features/notification/notificationAction';
import coinImg from '../assets/coin1.png';

const { width, height } = Dimensions.get('window');

// 🔥 scale helper
const scale = size => (width / 375) * size;

const ReciverHomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { userdata } = useSelector(state => state.user);
  const unread = useSelector(state => state.notification.unread);

  useEffect(() => {
    dispatch(userDatarequest());
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const coins = userdata?.user?.rings_balance ?? 0;
  const avatar =
    userdata?.images?.avatar || userdata?.images?.profile_image;

  const sections = [
    { id: 'stories' },
    { id: 'offers' },
    { id: 'like' },
    { id: 'active' },
    { id: 'go' },
  ];

  const renderItem = useCallback(
    ({ item }) => {
      switch (item.id) {
        case 'stories':
          return <StoriesScreen />;
        case 'offers':
          return <OffersSectionScreen />;
        case 'like':
          return <LikeMindedSectionScreen />;
        case 'active':
          return <ActiveDostSectionScreen />;
        case 'go':
          return (
            <View style={{ paddingHorizontal: scale(16) }}>
              <GoOnlineCard navigation={navigation} />
            </View>
          );
        default:
          return null;
      }
    },
    [navigation],
  );

  return (
    <WelcomeScreenbackgroungpage>
      <View style={{ flex: 1 }}>

        {/* 🔥 HEADER */}
        <ReceiverHeader
          navigation={navigation}
          coins={coins}
          avatar={avatar}
          unread={unread}
          coinImg={coinImg}
        />

        {/* 🔥 SEARCH */}
        <View style={styles.searchWrapper}>
          <Icon name="search-outline" size={scale(18)} color="#999" />
          <TextInput placeholder="Search" style={styles.input} />
        </View>

        {/* 🔥 CONTENT */}
        <FlatList
          data={sections}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: scale(90), // 🔥 tab-safe spacing
          }}
        />

      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default ReciverHomeScreen;

const styles = StyleSheet.create({
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(16),
    marginBottom: scale(10),
    paddingHorizontal: scale(12),
    height: scale(48),
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#D51BF9',
    borderRadius: scale(12),
  },

  input: {
    flex: 1,
    marginLeft: scale(10),
    fontSize: scale(14),
  },
});