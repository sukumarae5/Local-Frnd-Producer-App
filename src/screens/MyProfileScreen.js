import React from 'react';
import {
  View,
  Text,
 ImageBackground,
  ScrollView,
  TouchableOpacity,
 StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';

import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HEADER_HEIGHT = 440;
const CURVE_HEIGHT = 105;

const MyProfileScreen = () => {
  const navigation = useNavigation();
  const { userdata } = useSelector(state => state.user);

  const user = userdata?.user || {};
  const images = userdata?.images || {};
  const location = userdata?.location || {};
  const lifestyles = userdata?.lifestyles || [];
  const interests = userdata?.interests || [];

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

  const name = user?.name || 'avinash';
  const username = user?.username;
  const gender = user?.gender || 'Single';
  const age = getAge(user?.date_of_birth) || '23';
  const language = userdata?.language?.native_name || 'English';

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
    <View style={styles.main}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.headerWrap}>
          <ImageBackground
            source={avatarSource}
            style={styles.bgImage}
            imageStyle={styles.imageStyle}
          >
            {/* BACK BUTTON */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Icon
                name="chevron-back"
                size={26}
                color="#111"
              />
            </TouchableOpacity>

            {/* GLASS CARD */}
            <View style={styles.overlayPanel}>
              <Text style={styles.nameText}>{name}</Text>

              <View style={styles.distanceRow}>
                <Icon
                  name="location-outline"
                  size={11}
                  color="#d300ff"
                />

                <Text style={styles.distanceText}>
                  6 KM away from you
                </Text>
              </View>

              <TouchableOpacity style={styles.followBtn}>
                <Icon
                  name="add-circle-outline"
                  size={17}
                  color="#fff"
                />

                <Text style={styles.followText}>
                  follow
                </Text>
              </TouchableOpacity>
            </View>

            {/* FLOATING EDIT BUTTON */}
            <TouchableOpacity
              style={styles.floatingEditBtn}
              onPress={() =>
                navigation.navigate('EditProfileScreen')
              }
            >
              <Icon
                name="create-outline"
                size={30}
                color="#fff"
              />
            </TouchableOpacity>

            {/* SAME ORIGINAL CURVE */}
            <Svg
              width={width}
              height={CURVE_HEIGHT}
              style={styles.curveSvg}
            >
              <Path
                d={`M0 62 C ${width * 0.26} 5, ${
                  width * 0.48
                } 30, ${width * 0.63} 50 C ${
                  width * 0.82
                } 78, ${width * 0.95} 38, ${
                  width
                } 8 L ${width} ${CURVE_HEIGHT} L 0 ${CURVE_HEIGHT} Z`}
                fill="#fff"
              />
            </Svg>
          </ImageBackground>
        </View>

        {/* BODY */}
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.tagRow}>
            <View style={styles.chip}>
              <Icon
                name="male-female-outline"
                size={12}
                color="#333"
              />

              <Text style={styles.chipText}>
                {gender}
              </Text>
            </View>

            <View style={styles.chip}>
              <Icon
                name="calendar-outline"
                size={12}
                color="#333"
              />

              <Text style={styles.chipText}>
                {age} Year
              </Text>
            </View>

            <View style={styles.chip}>
              <Icon
                name="location-outline"
                size={12}
                color="#333"
              />

              <Text style={styles.chipText}>
                {locationText ||
                  'Berlin, United Kingdom'}
              </Text>
            </View>

            <View style={styles.chip}>
              <Icon
                name="language-outline"
                size={12}
                color="#333"
              />

              <Text style={styles.chipText}>
                {language}
              </Text>
            </View>

            {username ? (
              <View style={styles.chip}>
                <Icon
                  name="person-outline"
                  size={12}
                  color="#333"
                />

                <Text style={styles.chipText}>
                  @{username}
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.bioText}>
            {typeof user.bio === 'string' &&
            user.bio.trim()
              ? user.bio
              : 'No bio available'}
          </Text>

          {/* LIFESTYLE */}
          <Text style={styles.sectionTitle}>
            Lifestyle
          </Text>

          <View style={styles.tagRow}>
            {lifestyles.length ? (
              lifestyles.map((l, i) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>
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

          {/* INTERESTS */}
          <Text style={styles.sectionTitle}>
            Interests
          </Text>

          <View style={styles.tagRow}>
            {interests.length ? (
              interests.map((item, index) => (
                <View key={index} style={styles.chip}>
                  <Text style={styles.chipText}>
                    {item?.name || ''}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>
                None
              </Text>
            )}
          </View>

          {/* GALLERY */}
          <Text style={styles.sectionTitle}>
            Gallery
          </Text>

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
              <Text style={styles.empty}>
                No Photos
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default MyProfileScreen;

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
    backgroundColor: 'rgba(255,255,255,0.85)',
  },

  overlayPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 130,
    paddingLeft: 25,
    paddingTop: 20,
    top: 265,
    backgroundColor: 'rgba(70,70,70,0.74)',
    borderRadius: 25,
    zIndex: 8,
  },

  nameText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'lowercase',
  },

  distanceRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  distanceText: {
    color: '#fff',
    fontSize: 10,
    marginLeft: 3,
  },

  followBtn: {
    marginTop: 9,
    backgroundColor: '#1293ff',
    height: 25,
    paddingHorizontal: 8,
    borderRadius: 13,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },

  followText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },

  floatingEditBtn: {
    position: 'absolute',
    right: 18,
    bottom: 103,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#b72df3',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 40,
    elevation: 10,
  },

  curveSvg: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    zIndex: 20,
  },

  /* ONLY SPACE FIX */
  container: {
    paddingHorizontal: 18,
    paddingTop: 0,
    marginTop: -35,
    paddingBottom: 35,
    backgroundColor: '#fff',
    borderTopWidth: 0,
  },

  sectionTitle: {
    fontSize: 16,
    color: '#111',
    fontWeight: '700',
    marginTop: 0,
    marginBottom: 9,
  },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  chip: {
    minHeight: 26,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: '#ffeaf4',
    marginRight: 9,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: width - 36,
  },

  chipText: {
    fontSize: 12,
    color: '#222',
    marginLeft: 5,
    fontWeight: '500',
  },

  bioText: {
    marginTop: 2,
    fontSize: 14,
    color: '#444',
    lineHeight: 21,
  },

  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  galleryItem: {
    width: '48%',
    height: 125,
    borderRadius: 16,
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