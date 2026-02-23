import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { chatListRequest } from '../features/chat/chatAction';
import { friendCallRequest } from '../features/calls/callAction';
import { useFocusEffect } from '@react-navigation/native';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';

const MessagesScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const chatList = useSelector(state => state.chat.chatList) ?? [];
  const unread = useSelector(state => state.chat.unread) ?? {};

  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [callingId, setCallingId] = useState(null);

  /* Fetch chat list when screen focused */
  useFocusEffect(
    useCallback(() => {
      dispatch(chatListRequest());
    }, [dispatch]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(chatListRequest());
    setRefreshing(false);
  };

  /* Open Chat */
  const openChat = useCallback(
    item => {
      navigation.navigate('ChatScreen', { user: item });
    },
    [navigation],
  );

  /* Start Friend Call */
  const startFriendCall = useCallback(
    async (item, type = 'AUDIO') => {
      if (callingId === item.user_id) return;

      setCallingId(item.user_id);

      await dispatch(
        friendCallRequest({
          friend_id: item.user_id,
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

  /* Search Filter */
  const filteredData = useMemo(() => {
    if (!search.trim()) return chatList;

    return chatList.filter(item =>
      item.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, chatList]);

  /* Render Each Row */
  const renderItem = useCallback(
    ({ item }) => {
      const count = unread[item.user_id] || 0;

      const avatar =
        item.avatar ||
        item.profile_pic ||
        item.profile_image ||
        item.image ||
        null;

      const firstLetter = item.name?.[0]?.toUpperCase() || '?';

      return (
        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.85}
          onPress={() => openChat(item)}
        >
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Text style={styles.placeholderText}>
                  {firstLetter}
                </Text>
              </View>
            )}

            {Number(item.is_online) === 1 && (
              <View style={styles.onlineDot} />
            )}
          </View>

          {/* Name + Last Message */}
          <View style={styles.centerPart}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>

            {count > 0 ? (
              <Text style={styles.newMsgText}>
                {count} New Message{count > 1 ? 's' : ''}
              </Text>
            ) : (
              <Text style={styles.last} numberOfLines={1}>
                {item.last_message || ''}
              </Text>
            )}
          </View>

          {/* Call Buttons */}
          <View style={styles.callSection}>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => startFriendCall(item, 'AUDIO')}
              disabled={callingId === item.user_id}
            >
              <Ionicons
                name="call-outline"
                size={20}
                color="#C51DAF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => startFriendCall(item, 'VIDEO')}
              disabled={callingId === item.user_id}
            >
              <Ionicons
                name="videocam-outline"
                size={20}
                color="#C51DAF"
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [unread, openChat, startFriendCall, callingId],
  );

  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* HEADER */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="chevron-back"
              size={22}
              color="#4A4A4A"
            />
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
            </View>
          </LinearGradient>
        </View>

        {/* LIST */}
        <FlatList
          data={filteredData}
          keyExtractor={item => String(item.user_id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ItemSeparatorComponent={() => (
            <View style={styles.separator} />
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default MessagesScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingHorizontal: 16,
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 12,
  },

  searchRow: {
    marginBottom: 14,
  },

  searchGradientBorder: {
    borderRadius: 25,
    padding: 1.5,
  },

  searchBox: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#000',
  },

  listContent: {
    paddingBottom: 20,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  avatarWrap: {
    marginRight: 12,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  placeholderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#C51DAF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },

  onlineDot: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#31D158',
    borderWidth: 2,
    borderColor: '#fff',
  },

  centerPart: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
  },

  last: {
    fontSize: 13,
    color: '#8E8E8E',
    marginTop: 4,
  },

  newMsgText: {
    fontSize: 13,
    marginTop: 4,
    color: '#C51DAF',
    fontWeight: '600',
  },

  callSection: {
    flexDirection: 'row',
  },

  callBtn: {
    padding: 6,
    marginLeft: 4,
  },

  separator: {
    height: 1,
    backgroundColor: '#f2f2f2',
  },
});