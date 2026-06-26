// screens/MessagesScreen.js
import React, { useMemo, useState, useCallback, useContext, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  StatusBar,
  RefreshControl,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { createSound } from 'react-native-nitro-sound';
import { chatListRequest } from '../features/chat/chatAction';
import { friendCallRequest } from '../features/calls/callAction';
import { SocketContext } from '../socket/SocketProvider';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';

// ── Pre-load the notification sound once at module level ────────────────────
// Place a file called "message_tone.mp3" in:
//   Android: android/app/src/main/res/raw/message_tone.mp3
//   iOS:     ios/<AppName>/message_tone.mp3  (add to Xcode bundle)
// Sound.setCategory('Playback', true); // true = mixWithOthers so it doesn't kill music

let msgSound = null;

const loadSound = async () => {
  try {
    msgSound = await createSound('message_tone.mp3');
  } catch (err) {
    console.log('Sound load error:', err);
  }
};

const playMessageSound = async () => {
  try {
    if (!msgSound) {
      await loadSound();
    }

    await msgSound?.stop();   // reset
    await msgSound?.play();   // play
  } catch (err) {
    console.log('Playback error:', err);
  }
};
// ────────────────────────────────────────────────────────────────────────────

const MessagesScreen = ({ navigation }) => {
  const dispatch      = useDispatch();
  const { socketRef } = useContext(SocketContext);

  const chatList = useSelector(state => state.chat.chatList)     ?? [];
  const unread   = useSelector(state => state.chat.unread)       ?? {};
  const myId     = useSelector(state => state.user.userdata?.user?.user_id);
  const userdata = useSelector(state => state.user.userdata);

  // Chat options state — muted[conversationId], blocked[userId]
  const mutedMap   = useSelector(state => state.chatOptions?.muted)   ?? {};
  const blockedMap = useSelector(state => state.chatOptions?.blocked) ?? {};

  // conversationIds map: otherUserId → conversationId (from chat reducer)
  const conversationIds = useSelector(state => state.chat.conversationIds) ?? {};

  const [search,     setSearch]     = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [callingId,  setCallingId]  = useState(null);

  // ── Load chat list on focus ────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      dispatch(chatListRequest());
    }, [dispatch]),
  );

  // ── Real-time socket refresh + in-app sound ────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    let timeout;
    const refreshChatList = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => dispatch(chatListRequest()), 500);
    };

    // Play sound when a new message arrives for this user (not sent by me)
    const onChatReceive = msg => {
      const senderId = msg.sender_id ?? msg.senderId;
      if (Number(senderId) !== Number(myId)) {
        playMessageSound();
      }
      refreshChatList();
    };

    socket.on('chat_receive',        onChatReceive);
    socket.on('chat_read_update',    refreshChatList);
    socket.on('chat_read_all_update',refreshChatList);
    socket.on('friend_accept',       refreshChatList);

    return () => {
      clearTimeout(timeout);
      socket.off('chat_receive',        onChatReceive);
      socket.off('chat_read_update',    refreshChatList);
      socket.off('chat_read_all_update',refreshChatList);
      socket.off('friend_accept',       refreshChatList);
    };
  }, [dispatch, socketRef, myId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(chatListRequest());
    setRefreshing(false);
  };

  const openChat = useCallback(
    item => navigation.navigate('ChatScreen', { user: item }),
    [navigation],
  );

  // ── Dedup + search filter ──────────────────────────────────────────────
  const uniqueChats = useMemo(() => {
    const map = new Map();
    chatList.forEach(item => map.set(item.user_id, item));
    const list = Array.from(map.values());

    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      item =>
        item.name?.toLowerCase().includes(q) ||
        item.last_message?.toLowerCase().includes(q),
    );
  }, [chatList, search]);

  const isEmpty = uniqueChats.length === 0;

  // ── Call handler ───────────────────────────────────────────────────────
  const startFriendCall = useCallback(
    async (item, type = 'AUDIO') => {
      if (callingId === item.user_id) return;
      setCallingId(item.user_id);
      dispatch(friendCallRequest({ friend_id: item.user_id, call_type: type }));
      setCallingId(null);
      navigation.navigate('CallStatusScreen', {
        call_type: type,
        role: 'friend_caller',
        friend_id: item.user_id,
      });
    },
    [dispatch, navigation, callingId],
  );

  // ── Row renderer ───────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }) => {
      const count    = unread[item.user_id] || 0;
      const avatar   = item.avatar || item.profile_pic || item.profile_image || item.image || null;
      const firstLetter = item.name?.[0]?.toUpperCase() || '?';

      // Look up mute/block status for this chat item
      const convId     = conversationIds[item.user_id];
      const isMuted    = convId ? !!mutedMap[convId]       : false;
      const isBlocked  = !!blockedMap[item.user_id];

      return (
        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.85}
          onPress={() => openChat(item)}
        >
          {/* ── AVATAR ── */}
          <View style={styles.avatarWrap}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Text style={styles.placeholderText}>{firstLetter}</Text>
              </View>
            )}

            {/* Online dot — hide when blocked */}
            {!isBlocked && Number(item.is_online) === 1 && (
              <View style={styles.onlineDot} />
            )}

            {/* Mute badge */}
            {isMuted && (
              <View style={styles.muteBadge}>
                <Ionicons name="notifications-off" size={9} color="#fff" />
              </View>
            )}

            {/* Block badge */}
            {isBlocked && (
              <View style={styles.blockBadge}>
                <Ionicons name="ban" size={9} color="#fff" />
              </View>
            )}
          </View>

          {/* ── CENTER TEXT ── */}
          <View style={styles.centerPart}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              {/* Mute label inline */}
              {isMuted && (
                <View style={styles.muteTag}>
                  <Ionicons name="notifications-off-outline" size={10} color="#8B2FC9" />
                  <Text style={styles.muteTagText}>Muted</Text>
                </View>
              )}
              {/* Block label inline */}
              {isBlocked && (
                <View style={styles.blockTag}>
                  <Ionicons name="ban-outline" size={10} color="#E53935" />
                  <Text style={styles.blockTagText}>Blocked</Text>
                </View>
              )}
            </View>

            {count > 0 && !isMuted ? (
              <Text style={styles.newMsgText}>
                {count} New Message{count > 1 ? 's' : ''}
              </Text>
            ) : (
              <Text style={styles.last} numberOfLines={1}>
                {isBlocked
                  ? 'You blocked this user'
                  : isMuted
                  ? item.last_message || ''
                  : item.last_message || ''}
              </Text>
            )}
          </View>

          {/* ── CALL ICONS — disabled when blocked ── */}
          <View style={styles.callSection}>
            <TouchableOpacity
              style={[styles.callBtn, isBlocked && styles.callBtnDisabled]}
              onPress={() => !isBlocked && startFriendCall(item, 'AUDIO')}
              disabled={callingId === item.user_id || isBlocked}
              activeOpacity={isBlocked ? 1 : 0.7}
            >
              <Ionicons
                name="call-outline"
                size={20}
                color={isBlocked ? '#ccc' : '#C51DAF'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.callBtn, isBlocked && styles.callBtnDisabled]}
              onPress={() => !isBlocked && startFriendCall(item, 'VIDEO')}
              disabled={callingId === item.user_id || isBlocked}
              activeOpacity={isBlocked ? 1 : 0.7}
            >
              <Ionicons
                name="videocam-outline"
                size={20}
                color={isBlocked ? '#ccc' : '#C51DAF'}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [unread, openChat, startFriendCall, callingId, mutedMap, blockedMap, conversationIds],
  );

  // ──────────────────────────────────────────────────────────────────────
  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        {/* HEADER */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#4A4A4A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>

        {/* SEARCH */}
        <View style={styles.searchRow}>
          <LinearGradient
            colors={['#D51BF9', '#8C37F8']}
            style={styles.searchGradientBorder}
          >
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#999" />
              <TextInput
                placeholder="Search"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
                placeholderTextColor="#999"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* EMPTY STATE */}
        {isEmpty ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={search ? 'search-outline' : 'chatbubble-outline'}
              size={60}
              color="#ccc"
            />
            <Text style={styles.emptyTitle}>
              {search ? 'No results found' : 'No Messages'}
            </Text>

            {!search && (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() =>
                  userdata?.user?.gender === 'male'
                    ? navigation.navigate('TrainersCallpage')
                    : navigation.navigate('GoOnlineScreen')
                }
              >
                <Text style={styles.primaryBtnText}>Find Friends</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={uniqueChats}
            keyExtractor={item => String(item.user_id)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default MessagesScreen;

/* ═══════════════════════════════ STYLES ═══════════════════════════════ */

const styles = StyleSheet.create({
  container:       { flex: 1, paddingHorizontal: 20 },

  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerTitle:     { fontSize: 22, fontWeight: '700', marginLeft: 12, color: '#000' },

  searchRow:            { marginBottom: 14 },
  searchGradientBorder: { borderRadius: 25, padding: 1.5 },
  searchBox: {
    height: 40, backgroundColor: '#fff', borderRadius: 25,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#000' },

  listContent: { paddingBottom: 20 },

  /* ROW */
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },

  /* AVATAR */
  avatarWrap:       { marginRight: 12, position: 'relative' },
  avatar:           { width: 48, height: 48, borderRadius: 24 },
  placeholderAvatar:{
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#C51DAF', justifyContent: 'center', alignItems: 'center',
  },
  placeholderText:  { color: '#fff', fontWeight: '700', fontSize: 18 },

  onlineDot: {
    position: 'absolute', right: 1, bottom: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#31D158', borderWidth: 2, borderColor: '#fff',
  },

  // Mute badge — purple, top-right corner of avatar
  muteBadge: {
    position: 'absolute', top: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#8B2FC9',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },

  // Block badge — red, top-right corner
  blockBadge: {
    position: 'absolute', top: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#E53935',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },

  /* CENTER */
  centerPart: { flex: 1 },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name:    { fontSize: 16, fontWeight: '700', color: '#000', flexShrink: 1 },

  muteTag: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: '#F3E7FF', borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  muteTagText: { fontSize: 10, color: '#8B2FC9', fontWeight: '600' },

  blockTag: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: '#FFF0F0', borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  blockTagText: { fontSize: 10, color: '#E53935', fontWeight: '600' },

  last:       { fontSize: 13, color: '#8E8E8E', marginTop: 4 },
  newMsgText: { fontSize: 13, marginTop: 4, color: '#C51DAF', fontWeight: '600' },

  /* CALL SECTION */
  callSection:    { flexDirection: 'row' },
  callBtn:        { padding: 6, marginLeft: 4 },
  callBtnDisabled:{ opacity: 0.4 },

  separator: { height: 1, backgroundColor: '#f2f2f2' },

  /* EMPTY */
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle:     { fontSize: 18, fontWeight: '600', marginTop: 10, marginBottom: 20, color: '#444' },
  primaryBtn:     { backgroundColor: '#C51DAF', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
});