import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  useWindowDimensions,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { moderateScale } from 'react-native-size-matters';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import { useNavigation } from '@react-navigation/native';
import HomeHeader from '../components/HomeHeader';
import { getCoinsRequest } from '../features/conis/coinActions';
import OffersSectionScreen from './OffersSectionScreen';
import {
  createOrderRequest,
  resetPurchase,
} from '../features/purchase/purchaseActions';
import { useAppTheme } from '../theme';
import { AppText } from '../components';
import MaskedView from '@react-native-masked-view/masked-view';

export default function PlanScreen() {
  const [isCreatingOrder, setIsCreatingOrder] = React.useState(false);
  const [selectedPackage, setSelectedPackage] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const { width, height } = useWindowDimensions();
  const styles = useMemo(
    () => createStyles(theme, width, height),
    [theme, width, height],
  );

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
    setTimeout(() => setRefreshing(false), 1000);
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
        <AppText style={styles.newTitle} numberOfLines={2}>
          Unlock {item?.discount_percent ?? 0}% Savings
        </AppText>

        <Image
          source={require('../assets/multicoin.png')}
          style={styles.newCoin}
        />

        <AppText style={styles.newPrice} numberOfLines={1}>
          Only <AppText style={styles.rupee}>₹</AppText>
          {item?.price_after_discount ?? 0}
        </AppText>

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
              <AppText style={styles.claimText} numberOfLines={1}>
                Claim {item?.coins ?? 0}
              </AppText>
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
    </View>
  );

  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.container}>
        <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" />

        <View style={styles.headerContainer}>
          <HomeHeader
            withSpacing
            navigation={navigation}
            userdata={userdata}
            unread={unread}
            imageUrl={imageUrl}
          />
        </View>

        <View style={styles.titleWrapper}>
          <MaskedView
            maskElement={<AppText style={styles.lokalMask}>Lokal frnd</AppText>}
          >
            <LinearGradient
              colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
              useAngle
              angle={75.05}
            >
              <AppText style={[styles.lokalMask, { opacity: 0 }]}>
                Lokal frnd
              </AppText>
            </LinearGradient>
          </MaskedView>

          <MaskedView
            maskElement={<AppText style={styles.buyMask}>Buy Coins</AppText>}
          >
            <LinearGradient
              colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
              useAngle
              angle={75.05}
            >
              <AppText style={[styles.buyMask, { opacity: 0 }]}>
                Buy Coins
              </AppText>
            </LinearGradient>
          </MaskedView>
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
              colors={[colors.secondary]}
              tintColor={colors.secondary}
            />
          }
        />
      </View>
    </WelcomeScreenbackgroungpage>
  );
}

const createStyles = (theme, width, height) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    container: { flex: 1 },

    headerContainer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xxs,
    },

    titleWrapper: {
      alignItems: 'center',
      marginBottom: spacing.md,
    },

    lokalMask: {
      fontSize: moderateScale(24),
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: moderateScale(30),
    },

    buyMask: {
      fontSize: moderateScale(32),
      fontWeight: '900',
      textAlign: 'center',
      lineHeight: moderateScale(40),
    },

    listContainer: {
      paddingBottom: height * 0.13,
    },

    // Screen-level width — legitimate window-dimension use.
    bannerSection: {
      width,
      alignSelf: 'center',
      marginTop: moderateScale(6),
      marginBottom: moderateScale(22),
    },

    offerWrapper: {
      width,
      overflow: 'visible',
    },

    columnWrapper: {
      justifyContent: 'space-between',
      paddingHorizontal: spacing.sm,
    },

    // Grid card: percentage of screen width for a fixed 3-column layout —
    // this is screen-level responsive sizing, correctly done via percentage
    // rather than a fixed moderateScale value (a fixed value would overflow
    // or leave gaps as device width changes).
    cardWrapper: {
      width: '31.8%',
      marginBottom: spacing.sm,
    },

    newCard: {
      borderRadius: radius.xl,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xs,
      height: verticalHeightFor(height),
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#7C3AED',
      shadowOpacity: 0.45,
      shadowRadius: 10,
      elevation: 8,
    },

    newTitle: {
      color: '#fff',
      fontSize: moderateScale(12),
      fontWeight: '800',
      textAlign: 'center',
      lineHeight: moderateScale(15),
    },

    newCoin: {
      width: moderateScale(72),
      height: moderateScale(72),
      resizeMode: 'contain',
    },

    newPrice: {
      color: '#fff',
      fontSize: moderateScale(12),
      fontWeight: '800',
    },

    rupee: {
      color: '#FACC15',
      fontWeight: '900',
    },

    claimBtn: {
      minHeight: moderateScale(34),
      backgroundColor: '#481162',
      borderRadius: radius.pill,
      paddingVertical: spacing.xxs,
      paddingHorizontal: spacing.sm,
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
      fontSize: moderateScale(9),
    },

    btnCoin: {
      width: moderateScale(14),
      height: moderateScale(14),
      marginLeft: spacing.xxs,
      resizeMode: 'contain',
    },
  });
};

// Card height scales with screen height, dampened to avoid tablets
// getting absurdly tall cards — clamp keeps it within a sane range.
const verticalHeightFor = screenHeight => {
  const raw = screenHeight * 0.245;
  return Math.min(Math.max(raw, moderateScale(190)), moderateScale(260));
};
