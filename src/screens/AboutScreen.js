import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  StatusBar,
} from 'react-native';

import Svg, { Path } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  friendRequest,
  friendAcceptRequest,
  friendStatusRequest,
} from '../features/friend/friendAction';

import { otherUserFetchRequest } from '../features/Otherusers/otherUserActions';

const { width } = Dimensions.get('window');

const HEADER_HEIGHT = 450;
const CURVE_HEIGHT = 105;

const AboutScreen = ({ navigation, route }) => {
  const { userId: routeUserId, isMyProfile } = route.params || {};

  const dispatch = useDispatch();
  const [localPending, setLocalPending] = useState(false);

  const { userdata } = useSelector(state => state.user);
  const profileData = useSelector(state => state.otherUsers.profile);
  const friendStatus = useSelector(state => state.friends.friendStatus);
  const incoming = useSelector(state => state.friends.incoming);

  useEffect(() => {
    if (!isMyProfile && routeUserId) {
      dispatch(otherUserFetchRequest(routeUserId));
    }
  }, [routeUserId, isMyProfile, dispatch]);

  const profile = isMyProfile
    ? userdata
    : profileData?.profile || profileData || {};

  const user = profile?.user || {};
  const images = profile?.images || {};
  const location = profile?.location || {};
  const lifestyles = profile?.lifestyles || [];
  const interests = profile?.interests || [];
  const gallery = images?.gallery || [];

  const profileUserId = user?.user_id;

  useEffect(() => {
    if (profileUserId && !isMyProfile) {
      dispatch(friendStatusRequest(profileUserId));
    }
  }, [profileUserId, isMyProfile, dispatch]);

  useEffect(() => {
    if (profileUserId) {
      setLocalPending(false);
    }
  }, [friendStatus[profileUserId]?.state, profileUserId]);

  const getAge = dob => {
    if (!dob) return '';

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const name = user?.name || 'name not available';
  const username = user?.username || 'username not available';
  const gender = user?.gender || 'gender not specified';
  const age = getAge(user?.date_of_birth) || 'age not specified';
  const language = profile?.language?.native_name || 'language not specified';

  const locationText = [
    location?.city?.name || location?.city || 'city not specified',
    location?.state?.name || location?.state || 'state not specified',
    location?.country?.name || location?.country || 'country not specified',
  ]
    .filter(Boolean)
    .join(', ');

  const avatarSource = images?.display_profile_image
    ? { uri: images.display_profile_image }
    : images?.profile_image
    ? { uri: images.profile_image }
    : images?.avatar
    ? { uri: images.avatar }
    : require('../assets/boy1.jpg');

  const currentStatus = profileUserId
    ? friendStatus[profileUserId]?.state
    : null;

  const isFollowing = currentStatus === 'FRIEND';
  const isPending = currentStatus === 'PENDING_SENT' || localPending;
  const isReceived = currentStatus === 'PENDING_RECEIVED';

  const renderFollowingText = () => {
    // ✅ My Profile (Edit visible)
    if (isMyProfile) {
      return (
        <View style={styles.myProfileBadge}>
          <Text style={styles.myProfileText}>My Profile</Text>
        </View>
      );
    }

    // ✅ Heart visible → show +Follow
    if (!isFollowing && !isPending && !isReceived) {
      return (
        <View style={styles.followingTextOnly}>
          <Text style={styles.followingOnlyText}>+ Follow</Text>
        </View>
      );
    }

    // ✅ Following
    if (isFollowing) {
      return (
        <View style={styles.followingTextOnly}>
          <Text style={styles.followingOnlyText}>Following</Text>
        </View>
      );
    }

    // ✅ Pending
    if (isPending) {
      return (
        <View style={styles.followingTextOnly}>
          <Text style={styles.followingOnlyText}>Pending</Text>
        </View>
      );
    }

    // ✅ Accept request
    if (isReceived) {
      const req = incoming.find(r => r.sender_id === profileUserId);
      if (!req) return null;

      return (
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => {
            dispatch(friendAcceptRequest(req.request_id));
            setTimeout(() => dispatch(friendStatusRequest(profileUserId)), 300);
          }}
        >
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderFloatingAction = () => {
    if (isMyProfile) {
      return (
        <TouchableOpacity
          style={styles.floatingActionBtn}
          onPress={() => navigation.navigate('EditProfileScreen')}
        >
          <Icon name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>
      );
    }

    if (!profileUserId) return null;

    if (!isFollowing && !isPending && !isReceived) {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.floatingActionBtn}
          onPress={() => {
            setLocalPending(true);
            dispatch(friendRequest(profileUserId));
          }}
        >
          <Icon name="heart" size={20} color="#fff" />
        </TouchableOpacity>
      );
    }

    return null;
  };

  if (!profile || !user) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.main}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.headerWrap}>
          <ImageBackground
            source={avatarSource}
            style={styles.bgImage}
            imageStyle={styles.imageStyle}
          >
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Icon name="chevron-back" size={25} color="#111" />
            </TouchableOpacity>

            <View style={styles.overlayPanel}>
              <Text style={styles.nameText}>{name}</Text>

              <View style={styles.distanceRow}>
                <Icon name="location-outline" size={12} color="#d300ff" />
                <Text style={styles.distanceText}>{locationText}</Text>
              </View>

              {renderFollowingText()}
            </View>

            {renderFloatingAction()}

            <Svg width={width} height={CURVE_HEIGHT} style={styles.curveSvg}>
              <Path
                d={`M0 72 C ${width * 0.26} 10, ${width * 0.48} 40, ${
                  width * 0.63
                } 55 C ${width * 0.82} 80, ${
                  width * 0.95
                } 40, ${width} 10 L ${width} ${CURVE_HEIGHT} L 0 ${CURVE_HEIGHT} Z`}
                fill="#fff"
              />
            </Svg>
          </ImageBackground>
        </View>

        <View style={styles.container}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.tagRow}>
            <View style={styles.chip}>
              <Icon name="male-female-outline" size={12} color="#444" />
              <Text style={styles.chipText}>{gender}</Text>
            </View>

            <View style={styles.chip}>
              <Icon name="calendar-outline" size={12} color="#444" />
              <Text style={styles.chipText}>{age} Year</Text>
            </View>

            <View style={styles.chip}>
              <Icon name="location-outline" size={12} color="#444" />
              <Text style={styles.chipText}>{locationText}</Text>
            </View>

            <View style={styles.chip}>
              <Icon name="language-outline" size={12} color="#444" />
              <Text style={styles.chipText}>{language}</Text>
            </View>

            {username ? (
              <View style={styles.chip}>
                <Icon name="person-outline" size={12} color="#444" />
                <Text style={styles.chipText}>@{username}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.bioText}>
            {typeof user.bio === 'string' && user.bio.trim()
              ? user.bio
              : 'No bio available'}
          </Text>

          <Text style={styles.sectionTitle}>Life Style</Text>

          <View style={styles.tagRow}>
            {lifestyles.length ? (
              lifestyles.map((l, i) => (
                <View key={i} style={styles.chip}>
                  <Icon name="leaf-outline" size={12} color="#444" />
                  <Text style={styles.chipText}>
                    {l?.name ||
                      `${l?.category?.name || 'Name not specified'} :${
                        l?.subcategory?.name || 'Subcategory not specified'
                      }`}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>None</Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Interested</Text>

          <View style={styles.tagRow}>
            {interests.length ? (
              interests.map((item, index) => (
                <View key={index} style={styles.chip}>
                  <Text style={styles.chipTextNoIcon}>
                    {item?.name || 'Interest not specified'}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>None</Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Gallery</Text>

          <View style={styles.galleryGrid}>
            {gallery.length ? (
              gallery.map((img, i) => (
                <View key={i} style={styles.galleryItem}>
                  {img?.photo_url ? (
                    <ImageBackground
                      source={{ uri: img.photo_url }}
                      style={styles.galleryImage}
                    />
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={styles.empty}>No Photos</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerWrap: {
    width: '100%',
    height: HEADER_HEIGHT,
    backgroundColor: '#fff',
    position: 'relative',
  },

  bgImage: {
    width: '100%',
    height: '100%',
  },

  imageStyle: {
    resizeMode: 'cover',
  },

  backBtn: {
    position: 'absolute',
    top: 46,
    left: 15,
    zIndex: 50,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
  },

  overlayPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 150,
    top: 270,

    backgroundColor: 'rgba(0,0,0,0.35)', // 👈 darker glass
    borderTopLeftRadius: 30, // ✅ only top
    borderTopRightRadius: 30,
    paddingLeft: 20,
    paddingTop: 10,

    zIndex: 8,
  },

  nameText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
    textTransform: 'lowercase',
  },

  distanceRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  distanceText: {
    color: '#f4f4f4',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '500',
  },

  followingTextOnly: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#e6f4ff',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#4da3ff',
  },

  followingOnlyText: {
    color: '#1e88e5',
    fontSize: 12,
    fontWeight: '700',
  },

  acceptBtn: {
    marginTop: 10,
    backgroundColor: '#7e00ff',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },

  acceptText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  myProfileBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#eae0f1',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#6e14b8',
  },

  myProfileText: {
    color: '#6e14b8',
    fontSize: 12,
    fontWeight: '700',
  },

  floatingActionBtn: {
    position: 'absolute',
    right: 50,
    bottom: 102,
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 60,
    backgroundColor: '#c72cff',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 40,
    elevation: 14,
    shadowColor: '#c72cff',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },

  curveSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 40,
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 0,
    marginTop: -40, // 👈 PERFECT value for your curve
    paddingBottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: 40,
  },

  sectionTitle: {
    fontSize: 18,
    color: '#111',
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 12,
    marginLeft: 2,
  },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  chip: {
    minHeight: 28,
    borderRadius: 12, // 👈 smaller curve
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#ffeaf4',
    marginRight: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: width - 36,
  },

  chipText: {
    fontSize: 11,
    color: '#444',
    marginLeft: 3,
    fontWeight: '500',
  },

  chipTextNoIcon: {
    fontSize: 11,
    color: '#444',
    fontWeight: '500',
  },

  bioText: {
    marginTop: 3,
    fontSize: 13,
    color: '#444',
    lineHeight: 22,
    fontWeight: '400',
  },

  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  galleryItem: {
    width: '48%',
    height: 125,
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#f2f2f2',
  },

  galleryImage: {
    width: '100%',
    height: '100%',
  },

  empty: {
    color: '#777',
    fontSize: 13,
    marginBottom: 10,
  },
});
