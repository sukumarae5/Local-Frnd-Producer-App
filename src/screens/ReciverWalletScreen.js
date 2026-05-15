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
import ReceiverHeader from '../components/ReceiverHeader';
import ringImg from '../assets/ring.png';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import GoOnlineCard from '../components/GoOnlineCard';

const { width } = Dimensions.get('window');
const scale = size => (width / 375) * size;

const ReciverWalletScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { userdata } = useSelector(state => state.user);
const coins = userdata?.user?.rings_balance ?? 0;
  const avatar = userdata?.images?.avatar || userdata?.images?.profile_image;

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
          <ReceiverHeader
            navigation={navigation}
            coins={coins}
            avatar={avatar}
            unread={0}
          />

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
            <Text style={styles.conversionSmall}>Your Conversion Rate is</Text>

            <View style={styles.rateRow}>
              <Image source={ringImg} style={styles.ringIcon} />
              <Text style={styles.rateText}>1 Ring = 1.2 Rs</Text>
            </View>
          </LinearGradient>

          {/* REWARDS */}
          <Text style={styles.rewardsTitle}>Rewards</Text>

          <LinearGradient
            colors={['#D51BF9', '#7E22CE']}
            style={styles.rewardOuterBox}
          >
            <View style={styles.rewardInnerCard}>
              <Text style={styles.rewardMainText}>Total rings rewarded</Text>

              <View style={styles.rewardValueBadge}>
                <Image source={ringImg} style={styles.ringIcon} />
                <Text style={styles.rewardValueText}>{coins}</Text>
              </View>
            </View>

            <View style={styles.arrowWrapper}>
              <Icon name="repeat-outline" size={28} color="#6B21A8" />
            </View>

            <View style={styles.rewardInnerCard}>
              <Text style={styles.rewardMainText}>Total price converted</Text>

              <View style={styles.rewardValueBadge}>
                <Text style={styles.rewardValueText}>
                  ₹ {(coins * 1.2).toFixed(0)}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* CATEGORY PILLS */}
          {/* ================= CATEGORY PILLS ================= */}

          {/* GO ONLINE PREMIUM */}
          <View style={styles.goOnlineWrap}>
            <GoOnlineCard navigation={navigation} />
          </View>

          
        </ScrollView>
      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default ReciverWalletScreen;
const styles = StyleSheet.create({
  container: {
  flex: 1,
  paddingHorizontal: scale(16),   // ✅ SAME spacing everywhere
  paddingTop: scale(10),
  paddingBottom: scale(80),
},
topBar: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: scale(10),
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
  goOnlineWrap: {
  paddingBottom: scale(30),
  marginTop: scale(10),
},
  
});
