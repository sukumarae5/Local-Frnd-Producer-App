import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  Dimensions,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import { useNavigation } from '@react-navigation/native';
import HomeHeader from '../components/HomeHeader';
import { getCoinsRequest } from '../features/conis/coinActions';
import OffersSectionScreen from './OffersSectionScreen';
import {
  createOrderRequest,
  resetPurchase,
} from '../features/purchase/purchaseActions';

const { width, height } = Dimensions.get('window');

const wp = val => (width * val) / 100;
const hp = val => (height * val) / 100;

const isSmallDevice = width < 360;

export default function PlanScreen() {
  const [isCreatingOrder, setIsCreatingOrder] = React.useState(false);
  const [selectedPackage, setSelectedPackage] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { userdata } = useSelector(state => state.user);
  const coins = useSelector(state => state.coins?.coins || []);
  const unread = useSelector(state => state.notification?.unread || 0);
  const { order, loading } = useSelector(state => state.purchase);

  const profilePhotoURL = userdata?.images?.profile_image;

  const imageUrl = profilePhotoURL
    ? { uri: profilePhotoURL }
    : require('../assets/boy2.jpg');

  useEffect(() => {
    dispatch(getCoinsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (order?.order_id && isCreatingOrder) {
      setIsCreatingOrder(false);

      navigation.navigate('PaymentScreen', {
        order,
        package: selectedPackage,
      });
    }
  }, [order, isCreatingOrder, navigation, selectedPackage]);

  const onRefresh = () => {
    setRefreshing(true);

    dispatch(getCoinsRequest());

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleClaim = item => {
    if (loading) return;

    setSelectedPackage(item);
    setIsCreatingOrder(true);

    dispatch(resetPurchase());
    dispatch(createOrderRequest(item.id));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.9} style={styles.cardWrapper}>
      <LinearGradient
        colors={['#7C3AED', '#D946EF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.newCard}
      >
        <Text style={styles.newTitle} numberOfLines={2}>
          Unlock {item?.discount_percent ?? 0}% Savings
        </Text>

        <Image
          source={require('../assets/multicoin.png')}
          style={styles.newCoin}
        />

        <Text style={styles.newPrice} numberOfLines={1}>
          Only <Text style={styles.rupee}>₹</Text>
          {item?.price_after_discount ?? 0}
        </Text>

        <TouchableOpacity
          style={[styles.claimBtn, loading && styles.disabledBtn]}
          activeOpacity={0.8}
          disabled={loading}
          onPress={() => handleClaim(item)}
        >
          {loading && selectedPackage?.id === item.id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.claimText} numberOfLines={1}>
                Claim {item?.coins ?? 0}
              </Text>
              <Image
                source={require('../assets/normalmulticoin.png')}
                style={styles.btnCoin}
              />
            </>
          )}
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View style={styles.bannerSection}>
      <View style={styles.offerWrapper}>
        <OffersSectionScreen />
      </View>

      {/* <Image
        source={require('../assets/blackfriday.png')}
        style={styles.blackBanner}
        resizeMode="contain"
      /> */}
    </View>
  );

  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />

        <View style={styles.headerContainer}>
          <HomeHeader
            withSpacing
            navigation={navigation}
            userdata={userdata}
            unread={unread}
            imageUrl={imageUrl}
            wp={wp}
            hp={hp}
          />
        </View>

        <View style={styles.titleWrapper}>
          <Text style={styles.lokalText}>Lokal frnd</Text>
          <Text style={styles.buyCoinsText}>Buy Coins</Text>
        </View>

        <FlatList
          data={coins}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item?.id ? item.id.toString() : index.toString()
          }
          numColumns={3}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={ListHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#D946EF']}
              tintColor="#D946EF"
            />
          }
        />
      </View>
    </WelcomeScreenbackgroungpage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerContainer: {
    paddingHorizontal: wp(4),
    paddingTop: hp(0.5),
  },

  titleWrapper: {
    alignItems: 'center',
    marginTop: hp(0.3),
    marginBottom: hp(0.5),
  },

  lokalText: {
    textAlign: 'center',
    color: '#9333EA',
    fontSize: isSmallDevice ? wp(6.4) : wp(6.8),
    fontWeight: '500',
  },

  buyCoinsText: {
    textAlign: 'center',
    color: '#A21CAF',
    fontSize: isSmallDevice ? wp(8.8) : wp(9.6),
    fontWeight: '800',
    marginTop: hp(0.2),
  },

  listContainer: {
    paddingBottom: hp(12),
  },

  bannerSection: {
    width: width,
    alignSelf: 'center',
    marginBottom: hp(1),
  },

  offerWrapper: {
    width: width,
    overflow: 'visible',
  },

  blackBanner: {
    width: width,
    height: hp(17),
    marginTop: hp(1),
    marginBottom: hp(1.5),
    alignSelf: 'center',
  },

  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: wp(2.5),
  },

  cardWrapper: {
    width: wp(29.5),
    marginBottom: hp(1.6),
  },

  newCard: {
    borderRadius: wp(5),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(1.8),
    height: isSmallDevice ? hp(24.5) : hp(25.5),
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },

  newTitle: {
    color: '#fff',
    fontSize: isSmallDevice ? wp(3.3) : wp(3.6),
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: isSmallDevice ? wp(4.1) : wp(4.4),
  },

  newCoin: {
    width: isSmallDevice ? wp(17) : wp(18.5),
    height: isSmallDevice ? wp(17) : wp(18.5),
    resizeMode: 'contain',
  },

  newPrice: {
    color: '#fff',
    fontSize: isSmallDevice ? wp(3.2) : wp(3.5),
    fontWeight: '800',
  },

  rupee: {
    color: '#FACC15',
    fontWeight: '900',
  },

  claimBtn: {
    minHeight: hp(4.2),
    backgroundColor: '#481162',
    borderRadius: wp(10),
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3.2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },

  disabledBtn: {
    opacity: 0.65,
  },

  claimText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: isSmallDevice ? wp(2.4) : wp(2.6),
  },

  btnCoin: {
    width: wp(4),
    height: wp(4),
    marginLeft: wp(0.8),
    resizeMode: 'contain',
  },
});