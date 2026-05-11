import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const MyProfileScreen = () => {
  const navigation = useNavigation();
  const { userdata } = useSelector(state => state.user);

  const user = userdata?.user || {};
  const images = userdata?.images || {};
  const location = userdata?.location || {};
  const lifestyles = userdata?.lifestyles || [];
  const interests = userdata?.interests || [];

  /* AGE */
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

  /* DATA */
  const name = user?.name;
  const username = user?.username;
  const gender = user?.gender;
  const dob = user?.date_of_birth;
  const age = getAge(dob);

  const language = userdata?.language?.native_name;

  const locationText = [
    location?.city?.name,
    location?.state?.name,
    location?.country?.name,
  ]
    .filter(Boolean)
    .join(', ');

  const avatarSource = images?.avatar
    ? { uri: images.avatar }
    : require('../assets/boy1.jpg');

  if (!userdata || !user) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={{ height: 380 }}>
          <ImageBackground
            source={avatarSource}
            style={styles.bgImage}
            imageStyle={styles.imageStyle}
          >
          
            {/* EDIT BUTTON */}
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('EditProfileScreen')}
            >
              <Icon name="create-outline" size={20} color="#fff" />
            </TouchableOpacity>
            {/* NAME */}
            <View style={styles.profileInfo}>
              {/* 🔥 GLASS BACKGROUND */}
              <View style={styles.glassBox}>
                <Text style={styles.nameText}>
                  {name ? `${name}, ${age}` : 'User'}
                </Text>

                <Text style={styles.subText}>
                  📍 {locationText || 'No location'}
                </Text>
                <View style={styles.myProfileBtn}>
                  <Text style={styles.myProfileText}>My Profile</Text>
                </View>
              </View>
            </View>
            {/* CURVE */}
            <Svg
              width={width}
              height={100}
              style={{ position: 'absolute', bottom: -1 }}
            >
              <Path
                d={`M0 40 C ${width * 0.35} 120, ${
                  width * 0.65
                } -30, ${width} 40 L ${width} 100 L 0 100 Z`}
                fill="#fff"
              />
            </Svg>
          </ImageBackground>
        </View>

        {/* CONTENT */}
        <View style={styles.container}>
          {/* 🔥 ABOUT TITLE (TOP) */}
          <Text style={styles.sectionTitle}>About</Text>

          {/* 🔥 CHIPS */}
          <View style={styles.tagRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>@{username || 'username'}</Text>
            </View>

            <View style={styles.chip}>
              <Text style={styles.chipText}>{gender || 'Not set'}</Text>
            </View>

            <View style={styles.chip}>
              <Text style={styles.chipText}>🌐 {language || 'Unknown'}</Text>
            </View>

            <View style={styles.chip}>
              <Text style={styles.chipText}>
                📍 {locationText || 'No location'}
              </Text>
            </View>
          </View>

          {/* 🔥 BIO TEXT ONLY */}
          <Text style={styles.bioText}>
            {typeof user.bio === 'string' ? user.bio : 'No bio available'}
          </Text>
          {/* LIFESTYLE */}
          <Text style={styles.sectionTitle}>Lifestyle</Text>
          <View style={styles.tagContainer}>
            {lifestyles.length ? (
              lifestyles.map((l, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>
                    {(l.category?.name || '') +
                      ' : ' +
                      (l.subcategory?.name || '')}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>None</Text>
            )}
          </View>

          {/* INTEREST */}
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.tagContainer}>
            {interests.length ? (
              interests.map((i, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>
                    {typeof i.name === 'string' ? i.name : ''}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>None</Text>
            )}
          </View>

          {/* 🔥 GALLERY */}
          <Text style={styles.sectionTitle}>Gallery</Text>

          <View style={styles.galleryGrid}>
            {userdata?.images?.gallery?.length ? (
              userdata.images.gallery.map((img, i) => (
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

export default MyProfileScreen;

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  glassBox: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 14,
    borderRadius: 16,
  },

  bgImage: { width: '100%', height: '100%' },

  editBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  subText: {
    fontSize: 13,
    color: '#555',
    marginTop: 3,
  },
  frostPanel: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },

  usernameText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  extraText: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  followingBtn: {
    marginTop: 10,
    backgroundColor: '#e6f4ff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },

  followingText: {
    color: '#1e88e5',
    fontWeight: '700',
  },

  imageStyle: {
    resizeMode: 'cover', // keep full width
    alignSelf: 'flex-start', // 🔥 show image from TOP
  },

  container: {
    paddingHorizontal: 20,
    marginTop: -30, // 🔥 move content UP toward curve
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 15,
    marginBottom: 8,
  },

  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    elevation: 3,
  },

  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  tag: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  tagText: {
    color: '#7e00ff',
  },

  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  galleryItem: {
    width: '48%',
    height: 120,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },

  galleryImage: {
    width: '100%',
    height: '100%',
  },

  empty: {
    color: '#777',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  label: {
    fontSize: 13,
    color: '#888',
  },

  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  profileInfo: {
    position: 'absolute',
    bottom: 30, // 🔥 moved DOWN
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },

  nameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },

  chip: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginTop: 6,
  },

  chipText: {
    color: '#7e00ff',
    fontSize: 12,
    fontWeight: '500',
  },

  bioText: {
    marginTop: 12,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  myProfileBtn: {
    marginTop: 8,
    backgroundColor: '#e6f4ff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },

  myProfileText: {
    color: '#1e88e5',
    fontWeight: '700',
    fontSize: 13,
  },
});
