import React, { useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { SocketContext } from '../socket/SocketProvider';
import { userDatarequest } from '../features/user/userAction';
import coinImg from '../assets/coin1.png';

import StoriesScreen from './StoriesScreen';
import OffersSectionScreen from './OffersSectionScreen';
import ActiveDostSectionScreen from './ActiveDostSectionScreen';
import LikeMindedSectionScreen from '../screens/LikeMindedSectionScreen';
import GoOnlineCard from '../components/GoOnlineCard';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import { fetchUnreadCount } from '../features/notification/notificationAction';

/* ================= RESPONSIVE ================= */

const { width } = Dimensions.get('window');
const guidelineBaseWidth = 375;

const scale = size => (width / guidelineBaseWidth) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

/* ============================================= */

const GradientIcon = ({ name, size = 20 }) => {
  return (
    <LinearGradient
      colors={['#D51BF9', '#8C37F8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.outerGradient}
    >
      <Icon name={name} size={size} color="#fff" />
    </LinearGradient>
  );
};

const ReciverHomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { connected } = useContext(SocketContext);

  const { userdata } = useSelector(state => state.user);
  // const incoming = useSelector(state => state?.friends?.incoming || []);
const unread = useSelector(state => state.notification.unread);

  useEffect(() => {
    dispatch(userDatarequest());
  }, [dispatch]);
  useEffect(() => {
  dispatch(fetchUnreadCount());
}, []);

  const coins = userdata?.user?.coin_balance ?? 0;
const avatar =
  userdata?.images?.avatar ||
  userdata?.images?.profile_image ||
  null;
  return (
    <WelcomeScreenbackgroungpage>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ===== TOP BAR ===== */}
        <View style={styles.topBar}>
          <View style={styles.coinWrapper}>
            <LinearGradient
              colors={['#D51BF9', '#8C37F8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.coinGradient}
            >
              <Image
                source={coinImg}
                style={styles.coinImage}
                resizeMode="contain"
              />
              <Text style={styles.coinText}>
                {coins.toLocaleString()}
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.headerRightIcons}>
            <TouchableOpacity>
              <GradientIcon name="gift-outline" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('NotificationScreen')}
            >
              <View>
                <GradientIcon name="notifications-outline" />
                {/* {incoming.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {incoming.length}
                    </Text>
                  </View>
                )} */}
                {unread > 0 && (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>
      {unread}
    </Text>
  </View>
)}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('MessagesScreen')}
            >
              <GradientIcon name="chatbubble-ellipses-outline" />
            </TouchableOpacity>

            <TouchableOpacity
  onPress={() => navigation.navigate('UplodePhotoScreen')}
>
  {avatar ? (
    <Image
      source={{ uri: avatar }}
      style={styles.avatar}
    />
  ) : (
    <GradientIcon name="person-outline" />
  )}
</TouchableOpacity>
          </View>
        </View>

        {/* ===== SEARCH BAR ===== */}
        <View style={styles.searchWrapper}>
          <Icon
            name="search-outline"
            size={moderateScale(18)}
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>
        <StoriesScreen />
        <OffersSectionScreen />
        <LikeMindedSectionScreen />
        <ActiveDostSectionScreen />

        <View style={styles.goOnlineWrap}>
          <GoOnlineCard navigation={navigation} />
        </View>

      </ScrollView>
    </WelcomeScreenbackgroungpage>
  );
};

export default ReciverHomeScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  /* ===== TOP BAR ===== */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    marginTop: moderateScale(30),
    marginBottom: moderateScale(20),  // ✅ More space below topbar
  },

  /* ===== COIN BADGE ===== */
  coinWrapper: {
    borderRadius: moderateScale(30),
    overflow: 'hidden',
  },

  coinGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(18),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(30),
    shadowColor: '#8C37F8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
avatar: {
  width: moderateScale(40),
  height: moderateScale(40),
  borderRadius: moderateScale(20),
  borderWidth: 2,
  borderColor: '#D51BF9',
},
  coinImage: {
    width: moderateScale(24),
    height: moderateScale(24),
    marginRight: moderateScale(8),
  },

  coinText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: moderateScale(18),
  },

  /* ===== HEADER ICONS ===== */
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },

  outerGradient: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B3B',
    borderRadius: moderateScale(9),
    minWidth: moderateScale(16),
    height: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },

  badgeText: {
    color: '#fff',
    fontSize: moderateScale(10),
    fontWeight: '700',
  },

  /* ===== SEARCH BAR ===== */
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: moderateScale(16),
    marginBottom: moderateScale(22),  // ✅ Space below search
    paddingHorizontal: moderateScale(16),
    height: moderateScale(50),
    backgroundColor: '#FFFFFF',       // ✅ WHITE background
    borderWidth: 1.5,
    borderColor: '#D51BF9',
    borderRadius: moderateScale(16),
  },

  searchIcon: {
    marginRight: moderateScale(10),
  },

  searchInput: {
    flex: 1,
    fontSize: moderateScale(15),
    color: '#111827',
  },

  goOnlineWrap: {
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(30),
    marginTop: moderateScale(10),
  },
});