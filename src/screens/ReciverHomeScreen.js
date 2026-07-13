import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { View, FlatList, TextInput, StyleSheet, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { moderateScale } from 'react-native-size-matters';

import ReceiverHeader from '../components/ReceiverHeader';
import StoriesScreen from './StoriesScreen';
import OffersSectionScreen from './OffersSectionScreen';
import LikeMindedSectionScreen from './LikeMindedSectionScreen';
import ActiveDostSectionScreen from './ActiveDostSectionScreen';
import GoOnlineCard from '../components/GoOnlineCard';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';

import { userDatarequest } from '../features/user/userAction';
import { fetchUnreadCount } from '../features/notification/notificationAction';
import { useAppTheme } from '../theme';

const ReciverHomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [refreshing, setRefreshing] = useState(false);

  const { userdata } = useSelector((state) => state.user);
  const unread = useSelector((state) => state.notification.unread);

  useEffect(() => {
    dispatch(userDatarequest());
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(userDatarequest());
    dispatch(fetchUnreadCount());
    setTimeout(() => setRefreshing(false), 1000);
  }, [dispatch]);

  const coins = userdata?.user?.rings_balance ?? 0;
  const avatar = userdata?.images?.display_profile_image;

  const sections = [
    { id: 'stories' },
    { id: 'offers' },
    { id: 'like' },
    { id: 'active' },
    { id: 'go' },
  ];

  const renderItem = useCallback(
    ({ item }) => {
      switch (item.id) {
        case 'stories':
          return <StoriesScreen />;
        case 'offers':
          return <OffersSectionScreen />;
        case 'like':
          return <LikeMindedSectionScreen />;
        case 'active':
          return <ActiveDostSectionScreen />;
        case 'go':
          return (
            <View style={styles.goOnlineWrap}>
              <GoOnlineCard navigation={navigation} />
            </View>
          );
        default:
          return null;
      }
    },
    [navigation, styles]
  );

  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.flex}>
        <View style={styles.headerContainer}>
          <ReceiverHeader
            navigation={navigation}
            coins={coins}
            avatar={avatar}
            unread={unread}
            userdata={userdata}
          />
        </View>

        <View style={styles.searchWrapper}>
          <Icon name="search-outline" size={moderateScale(18)} color={colors.iconMuted} />
          <TextInput
            placeholder="Search"
            style={styles.input}
            placeholderTextColor={colors.placeholder}
          />
        </View>

        <FlatList
          data={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.gradientPurpleStart]}
              tintColor={colors.gradientPurpleStart}
            />
          }
        />
      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default ReciverHomeScreen;

const createStyles = (theme) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    flex: { flex: 1 },

    headerContainer: {
      paddingHorizontal: spacing.lg,
    },

    searchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.md,
      height: moderateScale(48),
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.gradientPurpleStart,
      borderRadius: radius.md,
    },

    input: {
      flex: 1,
      marginLeft: spacing.sm,
      color: colors.text,
    },

    listContent: {
      paddingBottom: moderateScale(90),
    },

    goOnlineWrap: {
      marginHorizontal: spacing.lg,
    },
  });
};