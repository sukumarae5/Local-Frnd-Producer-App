import React, { useEffect, useMemo } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';

import {
  friendPendingRequest,
  friendAcceptRequest,
  friendUnfriendRequest,
  friendListRequest,
} from '../features/friend/friendAction';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const getDayLabel = (dateString) => {
  if (!dateString) return 'Earlier';

  const date = new Date(dateString);
  const today = new Date();

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = (startOfToday - startOfDate) / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return 'Earlier';
};

const FriendRequestsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { incoming, friends, loading } = useSelector((s) => s.friends);

  useEffect(() => {
    dispatch(friendPendingRequest());
    dispatch(friendListRequest());
  }, [dispatch]);

  const accept = (requestId) => {
    dispatch(friendAcceptRequest(requestId));
  };

  const reject = (senderId) => {
    dispatch(friendUnfriendRequest(senderId));
  };

  const unfriend = (userId) => {
    dispatch(friendUnfriendRequest(userId));
  };

  const groupedPending = useMemo(() => {
    const groups = { Today: [], Yesterday: [], Earlier: [] };

    incoming.forEach((item) => {
      const label = getDayLabel(item.created_at);
      groups[label].push(item);
    });

    return groups;
  }, [incoming]);

  const renderPendingItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <AppText variant="subtitle" style={styles.name}>{item.sender_name}</AppText>
        <AppText variant="caption" color="textMuted" style={styles.sub}>User ID: {item.sender_id}</AppText>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.accept]} onPress={() => accept(item.request_id)}>
          <AppText variant="caption" style={styles.btnText}>Accept</AppText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.remove]} onPress={() => reject(item.sender_id)}>
          <AppText variant="caption" style={styles.btnText}>Delete</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('ChatScreen', { user: item })}>
      <View style={[styles.card, styles.friend]}>
        <View>
          <AppText variant="subtitle" style={styles.name}>{item.name}</AppText>
          <AppText variant="caption" color="textMuted" style={styles.sub}>User ID: {item.user_id}</AppText>
        </View>

        <TouchableOpacity style={[styles.btn, styles.remove]} onPress={() => unfriend(item.user_id)}>
          <AppText variant="caption" style={styles.btnText}>Unfriend</AppText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppText variant="h3" style={styles.title}>Friend Requests</AppText>

      {['Today', 'Yesterday', 'Earlier'].map((section) =>
        groupedPending[section].length ? (
          <View key={section}>
            <AppText variant="subtitle" color="textMuted" style={styles.sectionTitle}>{section}</AppText>

            <FlatList
              data={groupedPending[section]}
              keyExtractor={(i) => String(i.request_id)}
              renderItem={renderPendingItem}
            />
          </View>
        ) : null
      )}

      {!incoming.length && (
        <AppText variant="body" color="textMuted" style={styles.empty}>
          {loading ? 'Loading…' : 'No pending requests'}
        </AppText>
      )}

      <AppText variant="h3" style={[styles.title, styles.friendsTitle]}>Friends</AppText>

      <FlatList
        data={friends}
        keyExtractor={(i) => String(i.user_id)}
        renderItem={renderFriendItem}
        ListEmptyComponent={
          <AppText variant="body" color="textMuted" style={styles.empty}>
            {loading ? 'Loading…' : 'No friends yet'}
          </AppText>
        }
      />
    </SafeAreaView>
  );
};

export default FriendRequestsScreen;

const createStyles = (theme) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
    },

    title: { color: colors.text, marginBottom: spacing.sm },
    friendsTitle: { marginTop: spacing.xxl },

    sectionTitle: { marginVertical: spacing.xs },

    empty: { textAlign: 'center', marginTop: spacing.xl },

    card: {
      backgroundColor: colors.card,
      padding: spacing.md,
      borderRadius: radius.lg,
      marginBottom: spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    friend: {
      borderColor: colors.secondary,
      borderWidth: 1,
    },

    name: { color: colors.text },
    sub: { marginTop: spacing.xxs },

    actions: { flexDirection: 'row', gap: spacing.sm },

    btn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
    },

    accept: { backgroundColor: colors.success },
    remove: { backgroundColor: colors.error },

    btnText: { color: colors.textInverse, fontWeight: '600' },
  });
};