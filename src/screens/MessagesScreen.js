// screens/MessagesScreen.js
import React, {
  useMemo,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { createSound } from 'react-native-nitro-sound';
import { chatListRequest } from '../features/chat/chatAction';
import { friendCallRequest } from '../features/calls/callAction';
import { SocketContext } from '../socket/SocketProvider';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

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
    if (!msgSound) await loadSound();
    await msgSound?.stop();
    await msgSound?.play();
  } catch (err) {
    console.log('Playback error:', err);
  }
};

const MessagesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { socketRef } = useContext(SocketContext);
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const chatList = useSelector(state => state.chat.chatList) ?? [];
  const unread = useSelector(state => state.chat.unread) ?? {};
  const myId = useSelector(state => state.user.userdata?.user?.user_id);
  const userdata = useSelector(state => state.user.userdata);

  const mutedMap = useSelector(state => state.chatOptions?.muted) ?? {};
  const blockedMap = useSelector(state => state.chatOptions?.blocked) ?? {};
  const conversationIds =
    useSelector(state => state.chat.conversationIds) ?? {};

  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [callingId, setCallingId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      dispatch(chatListRequest());
    }, [dispatch]),
  );

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    let timeout;
    const refreshChatList = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => dispatch(chatListRequest()), 500);
    };

    const onChatReceive = msg => {
      const senderId = msg.sender_id ?? msg.senderId;
      if (Number(senderId) !== Number(myId)) {
        playMessageSound();
      }
      refreshChatList();
    };

    socket.on('chat_receive', onChatReceive);
    socket.on('chat_read_update', refreshChatList);
    socket.on('chat_read_all_update', refreshChatList);
    socket.on('friend_accept', refreshChatList);

    return () => {
      clearTimeout(timeout);
      socket.off('chat_receive', onChatReceive);
      socket.off('chat_read_update', refreshChatList);
      socket.off('chat_read_all_update', refreshChatList);
      socket.off('friend_accept', refreshChatList);
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

  const renderItem = useCallback(
    ({ item }) => {
      const count = unread[item.user_id] || 0;
      const avatar =
        item.display_profile_image ||
        item.avatar ||
        item.profile_image ||
        item.image ||
        'https://cdn-icons-png.flaticon.com/512/149/149071.png';

      const firstLetter = item.name?.[0]?.toUpperCase() || '?';

      const convId = conversationIds[item.user_id];
      const isMuted = convId ? !!mutedMap[convId] : false;
      const isBlocked = !!blockedMap[item.user_id];

      return (
        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.85}
          onPress={() => openChat(item)}
        >
          <View style={styles.avatarWrap}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <AppText variant="h4" style={styles.placeholderText}>
                  {firstLetter}
                </AppText>
              </View>
            )}

            {!isBlocked && Number(item.is_online) === 1 && (
              <View style={styles.onlineDot} />
            )}

            {isMuted && (
              <View style={styles.muteBadge}>
                <Ionicons
                  name="notifications-off"
                  size={moderateScale(9)}
                  color={colors.textInverse}
                />
              </View>
            )}

            {isBlocked && (
              <View style={styles.blockBadge}>
                <Ionicons
                  name="ban"
                  size={moderateScale(9)}
                  color={colors.textInverse}
                />
              </View>
            )}
          </View>

          <View style={styles.centerPart}>
            <View style={styles.nameRow}>
              <AppText variant="subtitle" style={styles.name} numberOfLines={1}>
                {item.name}
              </AppText>

              {isMuted && (
                <View style={styles.muteTag}>
                  <Ionicons
                    name="notifications-off-outline"
                    size={moderateScale(10)}
                    color={colors.secondary}
                  />
                  <AppText variant="overline" style={styles.muteTagText}>
                    Muted
                  </AppText>
                </View>
              )}

              {isBlocked && (
                <View style={styles.blockTag}>
                  <Ionicons
                    name="ban-outline"
                    size={moderateScale(10)}
                    color={colors.error}
                  />
                  <AppText variant="overline" style={styles.blockTagText}>
                    Blocked
                  </AppText>
                </View>
              )}
            </View>

            {count > 0 && !isMuted ? (
              <AppText variant="bodySmall" style={styles.newMsgText}>
                {count} New Message{count > 1 ? 's' : ''}
              </AppText>
            ) : (
              <AppText
                variant="bodySmall"
                color="textMuted"
                style={styles.last}
                numberOfLines={1}
              >
                {isBlocked ? 'You blocked this user' : item.last_message || ''}
              </AppText>
            )}
          </View>

          <View style={styles.callSection}>
            <TouchableOpacity
              style={[styles.callBtn, isBlocked && styles.callBtnDisabled]}
              onPress={() => !isBlocked && startFriendCall(item, 'AUDIO')}
              disabled={callingId === item.user_id || isBlocked}
              activeOpacity={isBlocked ? 1 : 0.7}
            >
              {isBlocked ? (
                <Ionicons
                  name="call-outline"
                  size={moderateScale(20)}
                  color={colors.disabled}
                />
              ) : (
                <MaskedView
                  maskElement={
                    <Ionicons
                      name="call-outline"
                      size={moderateScale(20)}
                      color="black"
                    />
                  }
                >
                  <LinearGradient
                    colors={[
                      colors.gradientPurpleStart,
                      colors.gradientPurpleEnd,
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    useAngle
                    angle={75.05}
                    style={{
                      width: moderateScale(20),
                      height: moderateScale(20),
                    }}
                  />
                </MaskedView>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.callBtn, isBlocked && styles.callBtnDisabled]}
              onPress={() => !isBlocked && startFriendCall(item, 'VIDEO')}
              disabled={callingId === item.user_id || isBlocked}
              activeOpacity={isBlocked ? 1 : 0.7}
            >
              {isBlocked ? (
                <Ionicons
                  name="videocam-outline"
                  size={moderateScale(20)}
                  color={colors.disabled}
                />
              ) : (
                <MaskedView
                  maskElement={
                    <Ionicons
                      name="videocam-outline"
                      size={moderateScale(20)}
                      color="black"
                    />
                  }
                >
                  <LinearGradient
                    colors={[
                      colors.gradientPurpleStart,
                      colors.gradientPurpleEnd,
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    useAngle
                    angle={75.05}
                    style={{
                      width: moderateScale(20),
                      height: moderateScale(20),
                    }}
                  />
                </MaskedView>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [
      unread,
      openChat,
      startFriendCall,
      callingId,
      mutedMap,
      blockedMap,
      conversationIds,
      colors,
      styles,
    ],
  );

  return (
    <WelcomeScreenbackgroungpage>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.background}
      />
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
            Messages
          </AppText>
        </View>

        <View style={styles.searchRow}>
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
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons
                    name="close-circle"
                    size={moderateScale(18)}
                    color={colors.iconMuted}
                  />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </View>

        {isEmpty ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={search ? 'search-outline' : 'chatbubble-outline'}
              size={moderateScale(60)}
              color={colors.border}
            />
            <AppText variant="h4" style={styles.emptyTitle}>
              {search ? 'No results found' : 'No Messages'}
            </AppText>

            {!search && (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() =>
                  userdata?.user?.gender === 'male'
                    ? navigation.navigate('TrainersCallpage')
                    : navigation.navigate('GoOnlineScreen')
                }
              >
                <AppText variant="button" style={styles.primaryBtnText}>
                  Find Friends
                </AppText>
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
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.magenta]}
                tintColor={colors.magenta}
              />
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

const createStyles = theme => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: spacing.lg, // 20-24dp
    },

    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    headerTitle: { marginLeft: spacing.md },

    searchRow: { marginBottom: spacing.md },
    searchGradientBorder: { borderRadius: radius.xl, padding: 1.5 },
    searchBox: {
      height: moderateScale(40),
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
    },
    searchInput: { flex: 1, marginLeft: spacing.sm, color: colors.text },

    listContent: { paddingBottom: spacing.xl },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },

    avatarWrap: { marginRight: spacing.md, position: 'relative' },
    avatar: {
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(24),
    },
    placeholderAvatar: {
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(24),
      backgroundColor: colors.magenta,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: { color: colors.textInverse },

    onlineDot: {
      position: 'absolute',
      right: 1,
      bottom: 1,
      width: moderateScale(12),
      height: moderateScale(12),
      borderRadius: moderateScale(6),
      backgroundColor: colors.online,
      borderWidth: 2,
      borderColor: colors.card,
    },

    muteBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: moderateScale(16),
      height: moderateScale(16),
      borderRadius: moderateScale(8),
      backgroundColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.card,
    },

    blockBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: moderateScale(16),
      height: moderateScale(16),
      borderRadius: moderateScale(8),
      backgroundColor: colors.error,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.card,
    },

    centerPart: { flex: 1 },

    nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
    name: { flexShrink: 1 },

    muteTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
      backgroundColor: `${colors.secondary}1F`,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.xxs,
      paddingVertical: 2,
    },
    muteTagText: { color: colors.secondary },

    blockTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
      backgroundColor: `${colors.error}1A`,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.xxs,
      paddingVertical: 2,
    },
    blockTagText: { color: colors.error },

    last: { marginTop: spacing.xxs },
    newMsgText: {
      marginTop: spacing.xxs,
      color: colors.magenta,
      fontWeight: '600',
    },

    callSection: { flexDirection: 'row' },
    callBtn: { padding: spacing.xs, marginLeft: spacing.xxs },
    callBtnDisabled: { opacity: 0.4 },

    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.divider,
    },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyTitle: { marginTop: spacing.sm, marginBottom: spacing.xl },
    primaryBtn: {
      backgroundColor: colors.magenta,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
      borderRadius: radius.xl,
    },
    primaryBtnText: { color: colors.textInverse },
  });
};
