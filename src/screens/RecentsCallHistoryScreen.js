import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
  StatusBar,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';

import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import {
  recentCallRequest,
  friendCallRequest,
} from '../features/calls/callAction';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const RecentsCallHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const recentCalls = useSelector(state => state.calls?.recentCalls) || [];
  const loading = useSelector(state => state.calls?.loading) || false;
  const userdata = useSelector(state => state.user?.userdata) || null;

  const currentUserId = userdata?.user?.user_id;

  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [callingId, setCallingId] = useState(null);

  useEffect(() => {
    dispatch(recentCallRequest());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(recentCallRequest());
    setRefreshing(false);
  };

  const startFriendCall = useCallback(
    async (item, type = 'AUDIO') => {
      if (!item?.other_user_id) return;
      if (callingId === item.other_user_id) return;

      setCallingId(item.other_user_id);

      await dispatch(
        friendCallRequest({
          friend_id: item.other_user_id,
          call_type: type,
        }),
      );

      setCallingId(null);

      navigation.navigate('CallStatusScreen', {
        call_type: type,
        friend: item,
      });
    },
    [dispatch, navigation, callingId],
  );

  const filteredData = useMemo(() => {
    if (!search.trim()) return recentCalls;

    return recentCalls.filter(item =>
      item?.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, recentCalls]);

  const formatDuration = seconds => {
    if (!seconds || seconds === 0) return 'Missed call';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const renderItem = ({ item }) => {
    const isOutgoing = item.caller_id === currentUserId;
    const isMissed = item.status === 'MISSED' || item.duration_seconds === 0;

    const avatar =
      item.display_profile_image ||
      item.avatar ||
      'https://cdn-icons-png.flaticon.com/512/149/149071.png';

    return (
      <View style={styles.row}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          {Number(item.is_online) === 1 && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.centerPart}>
          <AppText variant="subtitle" numberOfLines={1}>
            {item.name || `User ${item.other_user_id}`}
          </AppText>

          <View style={styles.subtitleRow}>
            <Ionicons
              name={isOutgoing ? 'arrow-up' : 'arrow-down'}
              size={moderateScale(14)}
              color={isMissed ? colors.error : colors.gradientPurpleStart}
            />
            <AppText
              variant="bodySmall"
              color={isMissed ? 'error' : 'textMuted'}
              style={styles.subtitleText}
            >
              {' '}
              {isOutgoing ? 'Outgoing' : 'Incoming'} •{' '}
              {formatDuration(item.duration_seconds)}
            </AppText>
          </View>
        </View>

        <View style={styles.callSection}>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => startFriendCall(item, 'AUDIO')}
            disabled={callingId === item.other_user_id}
          >
            <Ionicons
              name="call-outline"
              size={moderateScale(20)}
              color={colors.gradientPurpleStart}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => startFriendCall(item, 'VIDEO')}
            disabled={callingId === item.other_user_id}
          >
            <Ionicons
              name="videocam-outline"
              size={moderateScale(20)}
              color={colors.gradientPurpleStart}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <WelcomeScreenbackgroungpage>
      <StatusBar barStyle={colors.statusBar} />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={theme.hitSlop}
          >
            <Ionicons
              name="chevron-back"
              size={moderateScale(22)}
              color={colors.icon}
            />
          </TouchableOpacity>

          <AppText variant="h3" style={styles.headerTitle}>
            Recent
          </AppText>
        </View>
        <LinearGradient
          colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
          style={styles.searchGradientBorder}
        >
          <View style={styles.searchBox}>
            <Ionicons
              name="search"
              size={moderateScale(18)}
              color={colors.gradientPurpleStart}
            />
            <TextInput
              placeholder="Search"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              placeholderTextColor={colors.placeholder}
            />
          </View>
        </LinearGradient>

        <FlatList
          data={filteredData}
          keyExtractor={item => String(item.other_user_id)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || loading}
              onRefresh={onRefresh}
              colors={[colors.secondary]}
              tintColor={colors.secondary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default RecentsCallHistoryScreen;

const createStyles = theme => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },

    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },

    headerTitle: {
      marginLeft: spacing.md,
    },

    searchBox: {
      height: moderateScale(40),
      backgroundColor: colors.card,
      borderRadius: radius.pill,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
    },
    searchGradientBorder: {
      borderRadius: radius.pill,
      padding: 1.5,
      marginBottom: spacing.md,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      fontSize: theme.fontSizes.sm,
      color: colors.text,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },

    avatarWrap: {
      marginRight: spacing.md,
    },

    avatar: {
      width: moderateScale(50),
      height: moderateScale(50),
      borderRadius: moderateScale(25),
    },

    onlineDot: {
      position: 'absolute',
      right: moderateScale(2),
      bottom: moderateScale(2),
      width: moderateScale(12),
      height: moderateScale(12),
      borderRadius: moderateScale(6),
      backgroundColor: colors.online,
      borderWidth: 2,
      borderColor: colors.card,
    },

    centerPart: {
      flex: 1,
    },

    subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.xxs,
    },

    subtitleText: {
      marginLeft: spacing.xxs,
    },

    callSection: {
      flexDirection: 'row',
    },

    callBtn: {
      padding: spacing.xs,
      marginLeft: spacing.xs,
    },

    listContent: {
      paddingBottom: spacing.xl,
    },
  });
};
