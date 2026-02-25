import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { userDatarequest } from '../features/user/userAction';
import coinImg from '../assets/coin1.png';
import ringImg from '../assets/ring.png';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import GoOnlineCard from '../components/GoOnlineCard';

const { width } = Dimensions.get('window');
const scale = size => (width / 375) * size;

const ReciverWalletScreen = ({navigation }) => {
  const dispatch = useDispatch();
  const { userdata } = useSelector(state => state.user);
  const coins = userdata?.user?.coin_balance ?? 0;

  useEffect(() => {
    dispatch(userDatarequest());
  }, [dispatch]);

  return (
    <WelcomeScreenbackgroungpage>
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >

          {/* TOP BAR */}
          <View style={styles.topBar}>
            <LinearGradient
              colors={['#E9D5FF', '#C084FC']}
              style={styles.coinBadge}
            >
              <Image source={coinImg} style={styles.coinImage} />
              <Text style={styles.coinText}>{coins}</Text>
            </LinearGradient>

            <View style={styles.iconRow}>
              <View style={styles.iconCircle}>
                <Icon name="chatbubble" size={18} color="#fff" />
              </View>
              <View style={styles.iconCircle}>
                <Icon name="notifications" size={18} color="#fff" />
              </View>
              <View style={styles.iconCircle}>
                <Icon name="person" size={18} color="#fff" />
              </View>
            </View>
          </View>

          {/* HEART BACKGROUND */}
          <View style={styles.heartsContainer}>
            <Text style={[styles.heart, { top: 20, left: 40 }]}>💜</Text>
            <Text style={[styles.heart, { top: 40, right: 60 }]}>💜</Text>
            <Text style={[styles.heart, { top: 110, left: 90 }]}>💜</Text>
            <Text style={[styles.heart, { top: 130, right: 100 }]}>💜</Text>
          </View>

          {/* TITLE */}
          <Text style={styles.smallTitle}>Lokal frnd</Text>
          <Text style={styles.bigTitle}>Connecting Room</Text>

          {/* CONVERSION CARD */}
          <LinearGradient
            colors={['#C026D3', '#7E22CE']}
            style={styles.conversionCard}
          >
            <Text style={styles.conversionSmall}>
              Your Conversion Rate is
            </Text>

            <View style={styles.rateRow}>
              <Image source={ringImg} style={styles.ringIcon} />
              <Text style={styles.rateText}>
                1 Ring = 1.2 Rs
              </Text>
            </View>
          </LinearGradient>

          {/* REWARDS */}
          <Text style={styles.rewardsTitle}>Rewards</Text>

          <LinearGradient
            colors={['#D51BF9', '#7E22CE']}
            style={styles.rewardOuterBox}
          >

            <View style={styles.rewardInnerCard}>
              <Text style={styles.rewardMainText}>
                Total rings rewarded
              </Text>

              <View style={styles.rewardValueBadge}>
                <Image source={ringImg} style={styles.ringIcon} />
                <Text style={styles.rewardValueText}>
                  {coins}
                </Text>
              </View>
            </View>

            <View style={styles.arrowWrapper}>
              <Icon name="repeat-outline" size={28} color="#6B21A8" />
            </View>

            <View style={styles.rewardInnerCard}>
              <Text style={styles.rewardMainText}>
                Total price converted
              </Text>

              <View style={styles.rewardValueBadge}>
                <Text style={styles.rewardValueText}>
                  ₹ {(coins * 1.2).toFixed(0)}
                </Text>
              </View>
            </View>

          </LinearGradient>

          {/* CATEGORY PILLS */}
          {/* ================= CATEGORY PILLS ================= */}
<View style={styles.pillRow}>

  <View style={styles.pill}>
    <Icon name="language-outline" size={16} color="#6B7280" />
    <Text style={styles.pillText}>Telugu</Text>
  </View>

  <View style={styles.pill}>
    <Icon name="wine-outline" size={16} color="#6B7280" />
    <Text style={styles.pillText}>Party</Text>
  </View>

  <View style={styles.pill}>
    <Icon name="location-outline" size={16} color="#6B7280" />
    <Text style={styles.pillText}>lokal</Text>
  </View>

</View>

          {/* GO ONLINE PREMIUM */}
          <View style={styles.goOnlineWrap}>
          <GoOnlineCard navigation={navigation} />
        </View>

          {/* CALL OPTIONS */}
          {/* ================= CALL OPTIONS ================= */}
<View style={styles.callRow}>

  <LinearGradient
    colors={['#C026D3', '#9333EA']}
    style={styles.callCard}
  >
    <Icon name="call-outline" size={18} color="#fff" />
    <Text style={styles.callCardText}>
      Random{'\n'}audio call
    </Text>
  </LinearGradient>

  <LinearGradient
    colors={['#C026D3', '#9333EA']}
    style={styles.callCard}
  >
    <Icon name="videocam-outline" size={18} color="#fff" />
    <Text style={styles.callCardText}>
      Random{'\n'}video call
    </Text>
  </LinearGradient>

  <LinearGradient
    colors={['#C026D3', '#9333EA']}
    style={styles.callCard}
  >
    <Icon name="location-outline" size={18} color="#fff" />
    <Text style={styles.callCardText}>
      Random{'\n'}lokal calls
    </Text>
  </LinearGradient>

</View>

        </ScrollView>
      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default ReciverWalletScreen;
const styles = StyleSheet.create({

  container: {
    padding: scale(20),
    paddingTop: scale(40),
    paddingBottom: scale(80),
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 25,
  },

  coinImage: {
    width: 22,
    height: 22,
    marginRight: 6,
  },

  coinText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6B21A8',
  },

  iconRow: {
    flexDirection: 'row',
    gap: 10,
  },

  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  smallTitle: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#9333EA',
  },

  bigTitle: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    color: '#7E22CE',
    marginBottom: 20,
  },

  heartsContainer: {
    position: 'absolute',
    top: scale(70),
    left: 0,
    right: 0,
    height: scale(200),
    zIndex: -1,
  },

  heart: {
    position: 'absolute',
    fontSize: scale(70),
    opacity: 0.07,
  },

  conversionCard: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
  },

  conversionSmall: {
    color: '#E9D5FF',
    fontSize: 14,
  },

  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  ringIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },

  rateText: {
    color: '#FDE68A',
    fontSize: 20,
    fontWeight: '800',
  },

  rewardsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },

  rewardOuterBox: {
    padding: 22,
    borderRadius: 26,
  },

  rewardInnerCard: {
    backgroundColor: '#D8B4FE',
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 3,
    borderColor: '#C084FC',
  },

  rewardMainText: {
    fontSize: 26,
    fontWeight: '600',
    color: '#4C1D95',
    marginBottom: 18,
  },

  rewardValueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C084FC',
    paddingHorizontal: 28,
    paddingVertical: 8,
    borderRadius: 30,
  },

  rewardValueText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FDE68A',
    marginLeft: 8,
  },

  arrowWrapper: {
    alignItems: 'center',
    marginBottom: 25,
  },

  pillRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginVertical: scale(20),
},

pill: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FCE7F3',   // soft pink like screenshot
  paddingHorizontal: scale(18),
  paddingVertical: scale(8),
  borderRadius: scale(25),
},

pillText: {
  marginLeft: scale(6),
  fontSize: scale(14),
  color: '#6B7280',
  fontWeight: '500',
},
goOnlineWrap: {
  paddingHorizontal: scale(16),
  paddingBottom: scale(30),
  marginTop: scale(10),
},
callRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: scale(30),
},
callCard: {
  flex: 1,
  marginHorizontal: scale(5),
  borderRadius: scale(15),
  paddingVertical: scale(14),
  alignItems: 'center',
  justifyContent: 'center',

  shadowColor: '#000',
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  elevation: 6,
},
callCardText: {
  color: '#fff',
  fontSize: scale(12),
  textAlign: 'center',
  marginTop: scale(5),
  fontWeight: '500',
},
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
  },

  callText: {
    color: '#6B21A8',
    fontWeight: '500',
  },

});