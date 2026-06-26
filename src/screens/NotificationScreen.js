import React, { useEffect, useMemo, useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markNotificationsRead,
} from '../features/notification/notificationAction';
import WelcomeScreenbackgroundgpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage.js';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  FRIEND_ACCEPT_REQUEST,
  FRIEND_REJECT_REQUEST,
} from '../features/friend/friendType';
import { SocketContext } from "../socket/SocketProvider";
/* ─────────────────────────────────────────
   TIME HELPERS — timezone-safe
───────────────────────────────────────── */
const parseDate = dateString => {
  if (!dateString) return new Date();
  // MySQL returns "2026-06-24T00:33:45.000Z" or "2026-06-24 00:33:45"
  // Normalise the space format to ISO so all environments parse correctly
  const iso = dateString
    .replace(' ', 'T')
    .replace(/(\d{2}:\d{2}:\d{2})$/, '$1Z');
  return new Date(iso);
};

const getDayLabel = dateString => {
  const date = parseDate(dateString);
  const now = new Date();

  // Compare calendar dates in LOCAL time
  const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  const diffMs = new Date(todayStr) - new Date(dateStr);
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return 'Earlier';
};

const formatTimeAgo = dateString => {
  const date = parseDate(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)} hr ago`;
  return `${Math.floor(diffMin / 1440)} d ago`;
};

/* ─────────────────────────────────────────
   DEDUP helper — keeps only the latest
   notification per (sender + type + session)
───────────────────────────────────────── */
const dedupNotifications = list => {
  const seen = new Map();

  // Sort newest-first so the first occurrence we see is the latest
  const sorted = [...list].sort(
    (a, b) => parseDate(b.created_at) - parseDate(a.created_at),
  );

  sorted.forEach(item => {
    // Key: sender + type + session_id (null-safe)
    const key = `${item.sender_id}_${item.type}_${item.session_id ?? 'none'}`;
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  });

  // Return in newest-first order
  return Array.from(seen.values());
};

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
const NotificationScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { list = [], loading } = useSelector(state => state.notification);
const { socketRef } = useContext(SocketContext);
  const [processingId, setProcessingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(() => {
    dispatch(fetchNotifications());
    dispatch(markNotificationsRead());
  }, [dispatch]);
useEffect(() => {
  const socket = socketRef.current;

  if (!socket) return;

  const handleDelete = () => {
    dispatch(fetchNotifications());
  };

  socket.on("notification_deleted", handleDelete);

  return () => {
    socket.off("notification_deleted", handleDelete);
  };
}, [dispatch, socketRef]);
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadNotifications]);

  /* ── Dedup then group by day ── */
  const sections = useMemo(() => {
    const deduped = dedupNotifications(list);

    const grouped = {};
    deduped.forEach(item => {
      const label = getDayLabel(item.created_at);
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(item);
    });

    // Preserve Today → Yesterday → Earlier order
    const ORDER = ['Today', 'Yesterday', 'Earlier'];
    return ORDER.filter(k => grouped[k]).map(k => ({
      title: k,
      data: grouped[k],
    }));
  }, [list]);

  /* ── Friend request actions ── */
  const handleAccept = item => {
    if (processingId) return;
    setProcessingId(item.id);
    dispatch({
      type: FRIEND_ACCEPT_REQUEST,
      payload: { sender_id: item.sender_id },
      meta: { notificationId: item.id },
    });
    setTimeout(() => setProcessingId(null), 1000);
  };

  const handleReject = item => {
    if (processingId) return;
    setProcessingId(item.id);
    dispatch({
      type: FRIEND_REJECT_REQUEST,
      payload: { sender_id: item.sender_id },
      meta: { notificationId: item.id },
    });
    setTimeout(() => setProcessingId(null), 1000);
  };

  /* ── Notification icon by type ── */
  const getIcon = type => {
    switch (type) {
      case 'FRIEND_REQUEST':
        return { name: 'person-add', color: '#8A2DFF' };
      case 'FRIEND_ACCEPT':
        return { name: 'people', color: '#22C55E' };
      case 'MISSED_CALL':
        return { name: 'call', color: '#EF4444' };
      case 'CALL':
        return { name: 'call', color: '#3B82F6' };
      case 'MESSAGE':
        return { name: 'chatbubble', color: '#F59E0B' };
      default:
        return { name: 'notifications', color: '#6B7280' };
    }
  };

  const renderItem = ({ item }) => {
    const icon = getIcon(item.type);

    return (
      <View style={styles.row}>
        {/* Avatar with gradient border */}
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={['#B620E0', '#7B2FF7']}
            style={styles.avatarBorder}
          >
            <Image
              source={{
                uri: item.avatar_url || 'https://i.pravatar.cc/150?img=12',
              }}
              style={styles.avatar}
            />
          </LinearGradient>

          {/* Type badge */}
          <View style={[styles.badge, { backgroundColor: icon.color }]}>
            <Icon name={icon.name} size={10} color="#fff" />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {item.sender_name || 'Notification'}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.time}>{formatTimeAgo(item.created_at)}</Text>
        </View>

        {/* Friend request buttons */}
        {item.type === 'FRIEND_REQUEST' && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.acceptBtn}
              disabled={processingId === item.id}
              onPress={() => handleAccept(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.acceptText}>
                {processingId === item.id ? '…' : 'Accept'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rejectBtn}
              disabled={processingId === item.id}
              onPress={() => handleReject(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.rejectText}>
                {processingId === item.id ? '…' : 'Reject'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <WelcomeScreenbackgroundgpage>
      <View style={styles.screen}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        <SectionList
          sections={sections}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {loading ? 'Loading…' : 'No notifications yet'}
            </Text>
          }
        />
      </View>
    </WelcomeScreenbackgroundgpage>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 25 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
    color: '#000',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  sectionLine: {
    width: 4,
    height: 18,
    backgroundColor: '#8A2DFF',
    borderRadius: 4,
    marginRight: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#222' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  avatarContainer: { position: 'relative', marginRight: 12 },
  avatarBorder: { padding: 2, borderRadius: 40 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  textContainer: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#222' },
  subtitle: { fontSize: 13, color: '#555', marginTop: 3 },
  time: { fontSize: 12, color: '#9A9A9A', marginTop: 3 },

  buttonContainer: { flexDirection: 'row', alignItems: 'center' },
  acceptBtn: {
    backgroundColor: '#B620E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 6,
  },
  acceptText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  rejectBtn: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  rejectText: { color: '#555', fontSize: 12, fontWeight: '500' },

  listContent: { paddingBottom: 30, paddingHorizontal: 16 },
  empty: { textAlign: 'center', marginTop: 40, color: '#666' },
});
