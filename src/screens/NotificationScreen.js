import React, { useEffect, useMemo, useContext, useState, useCallback } from 'react';
import { View, SectionList, StyleSheet, Image, StatusBar, TouchableOpacity } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationsRead } from '../features/notification/notificationAction';
import WelcomeScreenbackgroundgpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage.js';
import Icon from 'react-native-vector-icons/Ionicons';
import { FRIEND_ACCEPT_REQUEST, FRIEND_REJECT_REQUEST } from '../features/friend/friendType';
import { SocketContext } from '../socket/SocketProvider';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const parseDate = (dateString) => {
  if (!dateString) return new Date();
  const iso = dateString.replace(' ', 'T').replace(/(\d{2}:\d{2}:\d{2})$/, '$1Z');
  return new Date(iso);
};

const getDayLabel = (dateString) => {
  const date = parseDate(dateString);
  const now = new Date();

  const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  const diffMs = new Date(todayStr) - new Date(dateStr);
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return 'Earlier';
};

const formatTimeAgo = (dateString) => {
  const date = parseDate(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)} hr ago`;
  return `${Math.floor(diffMin / 1440)} d ago`;
};

const dedupNotifications = (list) => {
  const seen = new Map();
  const sorted = [...list].sort((a, b) => parseDate(b.created_at) - parseDate(a.created_at));

  sorted.forEach((item) => {
    const key = `${item.sender_id}_${item.type}_${item.session_id ?? 'none'}`;
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  });

  return Array.from(seen.values());
};

const NotificationScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { list = [], loading } = useSelector((state) => state.notification);
  const { socketRef } = useContext(SocketContext);
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [processingId, setProcessingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(() => {
    dispatch(fetchNotifications());
    dispatch(markNotificationsRead());
  }, [dispatch]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleDelete = () => dispatch(fetchNotifications());

    socket.on('notification_deleted', handleDelete);
    return () => socket.off('notification_deleted', handleDelete);
  }, [dispatch, socketRef]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadNotifications]);

  const sections = useMemo(() => {
    const deduped = dedupNotifications(list);

    const grouped = {};
    deduped.forEach((item) => {
      const label = getDayLabel(item.created_at);
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(item);
    });

    const ORDER = ['Today', 'Yesterday', 'Earlier'];
    return ORDER.filter((k) => grouped[k]).map((k) => ({ title: k, data: grouped[k] }));
  }, [list]);

  const handleAccept = (item) => {
    if (processingId) return;
    setProcessingId(item.id);
    dispatch({
      type: FRIEND_ACCEPT_REQUEST,
      payload: { sender_id: item.sender_id },
      meta: { notificationId: item.id },
    });
    setTimeout(() => setProcessingId(null), 1000);
  };

  const handleReject = (item) => {
    if (processingId) return;
    setProcessingId(item.id);
    dispatch({
      type: FRIEND_REJECT_REQUEST,
      payload: { sender_id: item.sender_id },
      meta: { notificationId: item.id },
    });
    setTimeout(() => setProcessingId(null), 1000);
  };

  // Notification-type icon colors are semantic (success/error/info-like), kept
  // as fixed values distinct from brand tokens — matching a status, not a brand accent.
  const getIcon = (type) => {
    switch (type) {
      case 'FRIEND_REQUEST':
        return { name: 'person-add', color: '#8A2DFF' };
      case 'FRIEND_ACCEPT':
        return { name: 'people', color: colors.success };
      case 'MISSED_CALL':
        return { name: 'call', color: colors.error };
      case 'CALL':
        return { name: 'call', color: colors.info };
      case 'MESSAGE':
        return { name: 'chatbubble', color: colors.warning };
      default:
        return { name: 'notifications', color: colors.textMuted };
    }
  };

  const renderItem = ({ item }) => {
    const icon = getIcon(item.type);

    return (
      <View style={styles.row}>
        <View style={styles.avatarContainer}>
          <LinearGradient colors={['#B620E0', '#7B2FF7']} style={styles.avatarBorder}>
            <Image
              source={{
                uri: item.display_profile_image || item.avatar_url || 'https://i.pravatar.cc/150?img=12',
              }}
              style={styles.avatar}
            />
          </LinearGradient>

          <View style={[styles.badge, { backgroundColor: icon.color }]}>
            <Icon name={icon.name} size={moderateScale(10)} color={colors.textInverse} />
          </View>
        </View>

        <View style={styles.textContainer}>
          <AppText variant="subtitle" numberOfLines={1}>{item.sender_name || 'Notification'}</AppText>
          <AppText variant="bodySmall" color="textSecondary" style={styles.subtitle} numberOfLines={2}>
            {item.message}
          </AppText>
          <AppText variant="caption" color="textMuted" style={styles.time}>{formatTimeAgo(item.created_at)}</AppText>
        </View>

        {item.type === 'FRIEND_REQUEST' && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.acceptBtn}
              disabled={processingId === item.id}
              onPress={() => handleAccept(item)}
              activeOpacity={0.8}
            >
              <AppText variant="caption" style={styles.acceptText}>
                {processingId === item.id ? '…' : 'Accept'}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rejectBtn}
              disabled={processingId === item.id}
              onPress={() => handleReject(item)}
              activeOpacity={0.8}
            >
              <AppText variant="caption" style={styles.rejectText}>
                {processingId === item.id ? '…' : 'Reject'}
              </AppText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <WelcomeScreenbackgroundgpage>
        <StatusBar barStyle={colors.statusBar} />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={theme.hitSlop}>
            <Icon name="chevron-back" size={moderateScale(26)} color={colors.icon} />
          </TouchableOpacity>
          <AppText variant="h3" style={styles.headerTitle}>Notifications</AppText>
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <AppText variant="h4" style={styles.sectionTitle}>{section.title}</AppText>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <AppText variant="body" color="textMuted" style={styles.empty}>
              {loading ? 'Loading…' : 'No notifications yet'}
            </AppText>
          }
        />
    </WelcomeScreenbackgroundgpage>
  );
};

export default NotificationScreen;

const createStyles = (theme) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    screen: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xxl },
    headerTitle: { marginLeft: spacing.sm },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.lg },
    sectionLine: {
      width: moderateScale(4),
      height: moderateScale(18),
      backgroundColor: '#8A2DFF',
      borderRadius: radius.xs,
      marginRight: spacing.sm,
    },
    sectionTitle: {},

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: spacing.md,
      borderRadius: radius.lg,
      marginBottom: spacing.md,
      ...theme.shadows.sm,
    },

    avatarContainer: { position: 'relative', marginRight: spacing.md },
    avatarBorder: { padding: 2, borderRadius: moderateScale(40) },
    avatar: { width: moderateScale(52), height: moderateScale(52), borderRadius: moderateScale(26) },
    badge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: moderateScale(18),
      height: moderateScale(18),
      borderRadius: moderateScale(9),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.card,
    },

    textContainer: { flex: 1 },
    subtitle: { marginTop: spacing.xxs },
    time: { marginTop: spacing.xxs },

    buttonContainer: { flexDirection: 'row', alignItems: 'center' },
    acceptBtn: {
      backgroundColor: '#B620E0',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
      marginRight: spacing.xs,
    },
    acceptText: { color: colors.textInverse, fontWeight: '600' },
    rejectBtn: {
      backgroundColor: colors.disabled,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
    },
    rejectText: { color: colors.textSecondary },

    listContent: { paddingBottom: spacing.xxl, paddingHorizontal: spacing.lg },
    empty: { textAlign: 'center', marginTop: spacing.xxxl },
  });
};