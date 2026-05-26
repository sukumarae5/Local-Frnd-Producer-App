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

  const rings = userdata?.user?.rings_balance ?? 0;
  const avatar = userdata?.images?.avatar || userdata?.images?.profile_image;
  const money = rings * 1.2;

  useEffect(() => {
    dispatch(userDatarequest());
  }, [dispatch]);

  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.main}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          <ReceiverHeader
            navigation={navigation}
            coins={rings}
            avatar={avatar}
            unread={0}
          />

          <View style={styles.bgCircleOne} />
          <View style={styles.bgCircleTwo} />

          {/* HERO SECTION */}
          <View style={styles.heroSection}>

            <Text style={styles.title}>Lokal Frnd Wallet</Text>

            <Text style={styles.subTitle}>
              Convert your rewarded rings into real money
            </Text>
          </View>

          {/* BALANCE CARD */}
          <LinearGradient
            colors={['#FF4FB8', '#B026FF', '#6D28D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={styles.balanceTopRow}>
              <View>
                <Text style={styles.balanceLabel}>Available Rings</Text>

                <View style={styles.ringBalanceRow}>
                  <Image source={ringImg} style={styles.bigRingIcon} />
                  <Text style={styles.balanceAmount}>{rings}</Text>
                </View>
              </View>

              <View style={styles.liveBadge}>
                <Icon
                  name="sparkles-outline"
                  size={14}
                  color="#FF4FB8"
                />
                <Text style={styles.liveBadgeText}>Live</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.conversionRow}>
              <View>
                <Text style={styles.conversionLabel}>
                  Conversion Rate
                </Text>

                <Text style={styles.conversionText}>
                  1 Ring = ₹1.20
                </Text>
              </View>

              <View style={styles.moneyBox}>
                <Text style={styles.moneyLabel}>You Earn</Text>

                <Text style={styles.moneyValue}>
                  ₹{money.toFixed(0)}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* SECTION HEADER */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              Rewards Summary
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.historyButton}
            >
              <Icon
                name="time-outline"
                size={15}
                color="#7C3AED"
              />

              <Text style={styles.historyText}>History</Text>
            </TouchableOpacity>
          </View>

          {/* SUMMARY CARD */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <View
                style={[
                  styles.summaryIconCircle,
                  { backgroundColor: '#FCE7F3' },
                ]}
              >
                <Image
                  source={ringImg}
                  style={styles.smallRingIcon}
                />
              </View>

              <View style={styles.summaryTextBox}>
                <Text style={styles.summaryLabel}>
                  Total Rings Rewarded
                </Text>

                <Text style={styles.summaryValue}>
                  {rings} Rings
                </Text>
              </View>
            </View>

            <View style={styles.centerConvertIcon}>
              <LinearGradient
                colors={['#FF4FB8', '#8B5CF6']}
                style={styles.convertGradient}
              >
                <Icon
                  name="swap-vertical-outline"
                  size={24}
                  color="#fff"
                />
              </LinearGradient>
            </View>

            <View style={styles.summaryItem}>
              <View
                style={[
                  styles.summaryIconCircle,
                  { backgroundColor: '#EDE9FE' },
                ]}
              >
                <Icon
                  name="cash-outline"
                  size={25}
                  color="#7C3AED"
                />
              </View>

              <View style={styles.summaryTextBox}>
                <Text style={styles.summaryLabel}>
                  Total Money Converted
                </Text>

                <Text style={styles.summaryValue}>
                  ₹{money.toFixed(0)}
                </Text>
              </View>
            </View>
          </View>

          {/* WITHDRAW BUTTON */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.withdrawButton}
          >
            <LinearGradient
              colors={['#FF4FB8', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.withdrawGradient}
            >
              <Icon
                name="card-outline"
                size={20}
                color="#fff"
              />

              <Text style={styles.withdrawText}>
                Convert Rings to Money
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* INFO CARD */}
          <View style={styles.infoCard}>
            <Icon
              name="information-circle-outline"
              size={21}
              color="#7C3AED"
            />

            <Text style={styles.infoText}>
              Your rings are calculated automatically based on
              your wallet balance.
            </Text>
          </View>

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
  main: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: scale(16),
    paddingTop: scale(10),
    paddingBottom: scale(80),
  },

  bgCircleOne: {
    position: 'absolute',
    width: scale(220),
    height: scale(220),
    borderRadius: scale(110),
    backgroundColor: 'rgba(255, 79, 184, 0.12)',
    top: scale(80),
    right: scale(-90),
  },

  bgCircleTwo: {
    position: 'absolute',
    width: scale(180),
    height: scale(180),
    borderRadius: scale(90),
    backgroundColor: 'rgba(139, 92, 246, 0.13)',
    top: scale(260),
    left: scale(-80),
  },

  heroSection: {
    alignItems: 'center',
    marginTop: scale(25),
    marginBottom: scale(22),
  },


  title: {
    marginTop: scale(5),
    fontSize: scale(30),
    fontWeight: '900',
    color: '#3B0764',
    textAlign: 'center',
  },

  subTitle: {
    marginTop: scale(8),
    fontSize: scale(14),
    color: '#7E6B8F',
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: scale(20),
    lineHeight: scale(20),
  },

  balanceCard: {
    borderRadius: scale(28),
    padding: scale(22),
    marginBottom: scale(24),
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },

  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  balanceLabel: {
    fontSize: scale(14),
    color: '#FCE7F3',
    fontWeight: '600',
  },

  ringBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(8),
  },

  bigRingIcon: {
    width: scale(34),
    height: scale(34),
    marginRight: scale(10),
  },

  balanceAmount: {
    fontSize: scale(38),
    fontWeight: '900',
    color: '#fff',
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: scale(11),
    paddingVertical: scale(6),
    borderRadius: scale(18),
  },

  liveBadgeText: {
    marginLeft: scale(4),
    fontSize: scale(12),
    fontWeight: '800',
    color: '#FF4FB8',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginVertical: scale(18),
  },

  conversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  conversionLabel: {
    fontSize: scale(13),
    color: '#FCE7F3',
    fontWeight: '600',
  },

  conversionText: {
    marginTop: scale(4),
    fontSize: scale(19),
    color: '#FFF7AD',
    fontWeight: '900',
  },

  moneyBox: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: scale(15),
    paddingVertical: scale(10),
    borderRadius: scale(18),
    alignItems: 'center',
  },

  moneyLabel: {
    fontSize: scale(11),
    color: '#FCE7F3',
    fontWeight: '600',
  },

  moneyValue: {
    marginTop: scale(2),
    fontSize: scale(22),
    color: '#fff',
    fontWeight: '900',
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12),
  },

  sectionTitle: {
    fontSize: scale(19),
    fontWeight: '900',
    color: '#3B0764',
  },

  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: scale(12),
    paddingVertical: scale(7),
    borderRadius: scale(18),
  },

  historyText: {
    marginLeft: scale(4),
    fontSize: scale(12),
    fontWeight: '800',
    color: '#7C3AED',
  },

  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: scale(26),
    padding: scale(18),
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },

  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
    borderRadius: scale(22),
    padding: scale(15),
  },

  summaryIconCircle: {
    width: scale(52),
    height: scale(52),
    borderRadius: scale(26),
    justifyContent: 'center',
    alignItems: 'center',
  },

  smallRingIcon: {
    width: scale(27),
    height: scale(27),
  },

  summaryTextBox: {
    marginLeft: scale(13),
    flex: 1,
  },

  summaryLabel: {
    fontSize: scale(13),
    color: '#7E6B8F',
    fontWeight: '600',
  },

  summaryValue: {
    marginTop: scale(4),
    fontSize: scale(22),
    fontWeight: '900',
    color: '#3B0764',
  },

  centerConvertIcon: {
    alignItems: 'center',
    marginVertical: scale(14),
  },

  convertGradient: {
    width: scale(46),
    height: scale(46),
    borderRadius: scale(23),
    justifyContent: 'center',
    alignItems: 'center',
  },

  withdrawButton: {
    marginTop: scale(20),
    borderRadius: scale(24),
    overflow: 'hidden',
  },

  withdrawGradient: {
    height: scale(54),
    borderRadius: scale(24),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  withdrawText: {
    marginLeft: scale(8),
    color: '#fff',
    fontSize: scale(16),
    fontWeight: '900',
  },

  infoCard: {
    marginTop: scale(14),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: scale(18),
    padding: scale(13),
  },

  infoText: {
    marginLeft: scale(8),
    flex: 1,
    fontSize: scale(12),
    color: '#6D5A7B',
    fontWeight: '600',
    lineHeight: scale(18),
  },

  goOnlineWrap: {
    paddingBottom: scale(30),
    marginTop: scale(16),
  },
});