import React, { useContext, useRef, useState, useEffect, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Animated,
  StatusBar,
  ScrollView,
  Platform,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaskedView from '@react-native-masked-view/masked-view';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import {
  callRequest,
  searchingFemalesRequest,
  directCallRequest,
} from '../features/calls/callAction';
import HomeHeader from '../components/HomeHeader';
import { otherUserFetchRequest } from '../features/Otherusers/otherUserActions';
import { SocketContext } from '../socket/SocketProvider';
import BottomCallPills from '../components/BottomCallPills';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const WAVE_DISTANCE = moderateScale(10);

// One-off palette specific to this screen's purple/pink call-room design.
const trainersColors = {
  middleGradientStart: '#ee60f3',
  middleGradientEnd: '#8B2CE2',
  chipInactiveStart: '#EED4FF',
  chipInactiveEnd: '#F6ECFF',
  avatarBg: '#bb6acf',
  avatarShadow: '#ee6adc',
  onlineBadge: '#44b62d',
};

const FilterChip = ({
  active,
  onPress,
  icon,
  label,
  styles,
  colors,
  chipWidth,
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
    <LinearGradient
      colors={
        active
          ? [colors.gradientPurpleStart, colors.gradientPurpleEnd]
          : [trainersColors.chipInactiveStart, trainersColors.chipInactiveEnd]
      }
      style={[styles.chip, { width: chipWidth }]}
    >
      <MaterialIcons
        name={icon}
        size={moderateScale(15)}
        color={active ? '#fff' : colors.gradientPurpleEnd}
      />
      <AppText
        variant="caption"
        numberOfLines={1}
        style={[
          styles.chipText,
          { color: active ? '#fff' : colors.gradientPurpleEnd },
        ]}
      >
        {label}
      </AppText>
    </LinearGradient>
  </TouchableOpacity>
);

const TrainersCallPage = ({ navigation }) => {
  const dispatch = useDispatch();
  const socketCtx = useContext(SocketContext);
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, width), [theme, width]);

  const CELL_WIDTH = width / 3 - moderateScale(18);
  const CHIP_WIDTH = (width - moderateScale(48)) / 4;

  const { userdata } = useSelector(state => state.user);
  const users = useSelector(state => state.calls.searchingFemales || []);
  const coinBalance = userdata?.user?.coin_balance ?? 0;

  const imageUrl = userdata?.images?.display_profile_image
    ? { uri: userdata.images.display_profile_image }
    : require('../assets/boy1.jpg');

  const connected = socketCtx?.connected;
  const animRefs = useRef([]);

  const [callingRandom, setCallingRandom] = useState(false);
  const [callingRandomVideo, setCallingRandomVideo] = useState(false);
  const [callingDirect, setCallingDirect] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [filters, setFilters] = useState({
    online: 1,
    type: null,
    language: null,
    interest_id: null,
  });
  const [activeFilter, setActiveFilter] = useState('ONLINE');

  useEffect(() => {
    dispatch(searchingFemalesRequest(filters));

    const interval = setInterval(() => {
      dispatch(searchingFemalesRequest(filters));
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch, filters]);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(searchingFemalesRequest(filters));
    setTimeout(() => setRefreshing(false), 1000);
  };

  const setOnlineFilter = () => {
    setFilters({ online: 1, type: null, language: null, interest_id: null });
    setActiveFilter('ONLINE');
  };

  const setTypeFilter = type => {
    setFilters(prev => ({ ...prev, type, language: null, interest_id: null }));
    setActiveFilter(type);
  };

  const setLanguageFilter = () => {
    setFilters(prev => ({
      ...prev,
      type: null,
      language: userdata?.language_id || null,
      interest_id: null,
    }));
    setActiveFilter('LANGUAGE');
  };

  const setInterestFilter = () => {
    const interestId = userdata?.interest_ids?.[0] || null;
    setFilters(prev => ({
      ...prev,
      type: null,
      language: null,
      interest_id: interestId,
    }));
    setActiveFilter('INTEREST');
  };

  const resetFilters = () => {
    setFilters({ online: 1, type: null, language: null, interest_id: null });
    setActiveFilter('ONLINE');
  };

  useEffect(() => {
    animRefs.current = users.map(() => new Animated.Value(0));

    users.forEach((_, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animRefs.current[index], {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(animRefs.current[index], {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, [users]);

  const startRandomAudioCall = () => {
    if (!connected) return;
    setCallingRandom(true);
    dispatch(callRequest({ call_type: 'AUDIO' }));
    navigation.navigate('CallStatusScreen', {
      call_type: 'AUDIO',
      role: 'male',
    });
  };

  const startRandomVideoCall = () => {
    if (!connected) return;
    setCallingRandomVideo(true);
    dispatch(callRequest({ call_type: 'VIDEO' }));
    navigation.navigate('CallStatusScreen', {
      call_type: 'VIDEO',
      role: 'male',
    });
  };

  const startDirectCall = item => {
    if (!connected) return;
    setCallingDirect(true);
    dispatch(
      directCallRequest({ female_id: item.user_id, call_type: item.type }),
    );
    navigation.navigate('CallStatusScreen', {
      call_type: item.type,
      role: 'male',
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      setCallingRandom(false);
      setCallingRandomVideo(false);
      setCallingDirect(false);
    }, []),
  );

  return (
    <View style={styles.screen}>
      <View style={styles.topWhiteArea}>
        <HomeHeader
          navigation={navigation}
          userdata={userdata}
          unread={0}
          imageUrl={imageUrl}
          withSpacing
        />

        <MaskedView
          maskElement={
            <AppText variant="h3" style={styles.lookText}>
              Local frnd
            </AppText>
          }
        >
          <LinearGradient
            colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <AppText variant="h3" style={[styles.lookText, { opacity: 0 }]}>
              Local frnd
            </AppText>
          </LinearGradient>
        </MaskedView>

        <MaskedView
          maskElement={
            <AppText style={styles.pageTitle}>Connecting Room</AppText>
          }
        >
          <LinearGradient
            colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <AppText style={[styles.pageTitle, { opacity: 0 }]}>
              Connecting Room
            </AppText>
          </LinearGradient>
        </MaskedView>

        <View
          style={[styles.filterScrollBox, { width: width - moderateScale(32) }]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <FilterChip
              active={activeFilter === 'ONLINE'}
              onPress={setOnlineFilter}
              icon="wifi"
              label="Online"
              styles={styles}
              colors={colors}
              chipWidth={CHIP_WIDTH}
            />
            <FilterChip
              active={activeFilter === 'AUDIO'}
              onPress={() => setTypeFilter('AUDIO')}
              icon="call"
              label="Audio"
              styles={styles}
              colors={colors}
              chipWidth={CHIP_WIDTH}
            />
            <FilterChip
              active={activeFilter === 'VIDEO'}
              onPress={() => setTypeFilter('VIDEO')}
              icon="videocam"
              label="Video"
              styles={styles}
              colors={colors}
              chipWidth={CHIP_WIDTH}
            />
            <FilterChip
              active={activeFilter === 'LANGUAGE'}
              onPress={setLanguageFilter}
              icon="translate"
              label="Telugu"
              styles={styles}
              colors={colors}
              chipWidth={CHIP_WIDTH}
            />
            <FilterChip
              active={activeFilter === 'INTEREST'}
              onPress={setInterestFilter}
              icon="favorite"
              label="Party"
              styles={styles}
              colors={colors}
              chipWidth={CHIP_WIDTH}
            />
            <FilterChip
              active={false}
              onPress={resetFilters}
              icon="refresh"
              label="Reset"
              styles={styles}
              colors={colors}
              chipWidth={CHIP_WIDTH}
            />
          </ScrollView>
        </View>

        <View style={styles.sectionHeader}>
          <AppText variant="subtitle" style={styles.sectionText}>
            {activeFilter}
          </AppText>
        </View>
      </View>

      <LinearGradient
        colors={[
          trainersColors.middleGradientStart,
          trainersColors.middleGradientEnd,
        ]}
        style={styles.middlePurple}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridScrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.gradientPurpleStart]}
              tintColor={colors.gradientPurpleStart}
            />
          }
        >
          <View style={styles.gridWrapper}>
            {users.map((item, index) => {
              const translateY =
                animRefs.current[index]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -WAVE_DISTANCE],
                }) || 0;

              return (
                <Animated.View
                  key={item.session_id || `${item.user_id}-${index}`}
                  style={[
                    styles.itemCell,
                    { width: CELL_WIDTH, transform: [{ translateY }] },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.userCard}
                    onPress={() => startDirectCall(item)}
                    onLongPress={() => {
                      dispatch(otherUserFetchRequest(item.user_id));
                      navigation.navigate('AboutScreen', {
                        userId: item.user_id,
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.avatarOuter}>
                      <Image
                        source={
                          item.display_profile_image
                            ? { uri: item.display_profile_image }
                            : require('../assets/boy1.jpg')
                        }
                        style={styles.avatar}
                      />

                      <View style={styles.callBadge}>
                        <MaterialIcons
                          name={item.type === 'VIDEO' ? 'videocam' : 'call'}
                          size={moderateScale(12)}
                          color="#fff"
                        />
                      </View>
                    </View>

                    <AppText variant="caption" style={styles.userText}>
                      name: {item.name}
                    </AppText>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>
      </LinearGradient>

      <View style={styles.bottomPillsContainer}>
        <BottomCallPills
          callingRandom={callingRandom}
          callingRandomVideo={callingRandomVideo}
          onRandomAudio={startRandomAudioCall}
          onRandomVideo={startRandomVideoCall}
          coinBalance={coinBalance}
          navigation={navigation}
        />
      </View>
    </View>
  );
};

export default TrainersCallPage;

const createStyles = (theme, width) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    screen: { flex: 1, backgroundColor: colors.background },

    topWhiteArea: {
      backgroundColor: colors.background,
      paddingTop:
        Platform.OS === 'android'
          ? (StatusBar.currentHeight || 0) + spacing.xs
          : spacing.xs,
      paddingBottom: spacing.md,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.xxs,
      borderBottomLeftRadius: radius.xl,
      borderBottomRightRadius: radius.xl,
      zIndex: 5,
    },

    lookText: { textAlign: 'center', fontFamily: 'Lexend-SemiBold' },

    pageTitle: {
      textAlign: 'center',
      fontSize: moderateScale(30),
      lineHeight: moderateScale(38),
      fontFamily: 'Merienda-Bold',
      marginBottom: spacing.sm,
    },

    filterScrollBox: { height: moderateScale(44), overflow: 'hidden' },

    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: spacing.lg,
      paddingVertical: spacing.xxs,
    },

    chip: {
      height: moderateScale(35),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      marginRight: spacing.sm,
      paddingHorizontal: spacing.xs,
    },

    chipText: { fontWeight: '600', marginLeft: spacing.xxs },

    sectionHeader: { marginTop: spacing.md, alignItems: 'flex-start' },
    sectionText: { color: colors.text, fontWeight: '800' },

    middlePurple: { flex: 1, marginTop: -spacing.xxs, paddingTop: spacing.md },

    gridScrollContent: { paddingTop: spacing.xxs, paddingBottom: spacing.xl },

    gridWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
    },

    itemCell: { marginBottom: spacing.md },

    userCard: { paddingVertical: spacing.xl, alignItems: 'center' },

    avatarOuter: {
      width: moderateScale(76),
      height: moderateScale(76),
      borderRadius: moderateScale(38),
      backgroundColor: trainersColors.avatarBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xxs,
      shadowColor: trainersColors.avatarShadow,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 10,
      elevation: 10,
    },

    avatar: {
      width: moderateScale(56),
      height: moderateScale(56),
      borderRadius: moderateScale(28),
      backgroundColor: '#fff',
    },

    callBadge: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: moderateScale(18),
      height: moderateScale(18),
      borderRadius: moderateScale(9),
      backgroundColor: trainersColors.onlineBadge,
      alignItems: 'center',
      justifyContent: 'center',
    },

    userText: { color: '#fff', fontWeight: '700', textAlign: 'center' },

    bottomPillsContainer: {
      backgroundColor: colors.background,
      paddingTop: spacing.sm,
      paddingBottom: Platform.OS === 'android' ? spacing.sm : spacing.lg,
      alignItems: 'center',
    },
  });
};
