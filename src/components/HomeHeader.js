import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from "react-native-vector-icons/Ionicons";

const HomeHeader = ({
  navigation,
  userdata,
  unread,
  imageUrl,
  withSpacing,
  
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
          <TouchableOpacity onPress={() => navigation.navigate('MessagesScreen')}>
            <LinearGradient
              colors={["#D51BF9", "#8C37F8"]} // Standard Purple Gradient
              style={styles.iconCircle}
            >
              {/* Exact icon match for image_bcee61.png */}
              <Icon name="chatbubbles-outline" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('NotificationScreen')}>
            <LinearGradient
              colors={["#D51BF9", "#8C37F8"]}
              style={styles.iconCircle}
            >
              <Icon name="notifications-outline" size={22} color="#fff" />
            </LinearGradient>

            {unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unread > 99 ? '99+' : unread}
                </Text>
              </View>
            )}
          </TouchableOpacity>

         <TouchableOpacity onPress={() => navigation.navigate('MyProfileScreen')}>
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
    borderRadius: 20, // Pill shape
  },
  coinImage: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  coinText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '800',
    color: '#f7efd9', // Gold text to match image_bd5777.png
    textShadowColor: '#634011',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38, // Slightly larger to match TabIcon scale
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  profilePic: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginLeft: 10,
    borderWidth: 2,
    borderColor: '#D51BF9',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B3B',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
