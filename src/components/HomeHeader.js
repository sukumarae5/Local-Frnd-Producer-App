import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HomeHeader = ({
  navigation,
  userdata,
  unread,
  imageUrl,
  withSpacing,
  isSmallDevice,
  wp,
  hp,
}) => {
  return (
    <View
      style={[styles.headerContainer, { paddingTop: withSpacing ? 10 : 0 }]}
    >
      
      <View style={styles.headerRow}>
        {/* Coin */}
        <TouchableOpacity onPress={() => navigation.navigate('PlanScreen')}>
          <LinearGradient
            colors={['#FFA726', '#FF7043']}
            style={styles.coinBox}
          >
            <Image
              source={require('../assets/coin1.png')}
              style={styles.coinImage}
            />
            <Text style={styles.coinText}>
              {userdata?.user?.coin_balance ?? 0}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Right icons */}
        <View style={styles.rightIcons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('MessagesScreen')}
          >
            <View style={styles.iconCircle}>
              <Icon name="message-processing-outline" size={22} color="#fff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('NotificationScreen')}
          >
            <View style={styles.iconCircle}>
              <Icon name="bell-outline" size={22} color="#fff" />
            </View>

            {unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unread > 99 ? '99+' : unread}
                </Text>
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
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  headerContainer: {
    paddingBottom: 10,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  coinBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
  },

  coinImage: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },

  coinText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },

  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconCircle: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: '#ce17fc',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  profilePic: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginLeft: 10,
    borderWidth: 2,
    borderColor: '#A35DFE',
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff0044',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  
});
