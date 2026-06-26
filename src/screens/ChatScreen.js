// screens/ChatScreen.js
// Full ChatScreen with Chat Options: Mute, Block, Clear Chat, Report

import React, {
  useEffect,
  useContext,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';

import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  Dimensions,
  PermissionsAndroid,
  Alert,
  Modal,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { NitroSound } from 'react-native-nitro-sound';
import Voice from '@react-native-voice/voice';
import { launchCamera } from 'react-native-image-picker';
import { pick } from '@react-native-documents/picker';
import { Linking } from 'react-native';
import Video from 'react-native-video';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { SocketContext } from '../socket/SocketProvider';
import { friendCallRequest } from '../features/calls/callAction';
import { chatFileUploadRequest } from '../features/chat/chatAction';

import {
  chatHistoryRequest,
  chatUnreadClear,
  chatSetActive,
  chatClearActive,
} from '../features/chat/chatAction';

// ── Chat Options actions ────────────────────────────────────────────────────
import {
  chatMuteRequest,
  chatBlockRequest,
  chatClearHistoryRequest,
  chatReportRequest,
  chatOptionsStatusRequest,
} from '../features/chat/chatOptionsAction';

const { width } = Dimensions.get('window');
const isSmall = width < 360;

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const createAudioRecorder = () => {
  try {
    return new NitroSound();
  } catch {
    return null;
  }
};

const requestPermission = async permission => {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(permission);
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

const getDayLabel = dateStr => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (same(d, today)) return 'Today';
  if (same(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getLastSeenText = dateStr => {
  if (!dateStr) return 'Offline';
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return 'Last seen just now';
  if (diff < 3600) return `Last seen ${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `Last seen ${Math.floor(diff / 3600)} hr ago`;
  return `Last seen on ${d.toLocaleDateString()}`;
};

/* ── Decorative hearts ───────────────────────────────────────────────────── */

const GradientHeart = ({ size, style, opacity = 1 }) => (
  <View pointerEvents="none" style={[{ position: 'absolute', opacity }, style]}>
    <MaskedView
      maskElement={<Ionicons name="heart" size={size} color="black" />}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.5)', 'rgba(152,50,248,0.15)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ width: size, height: size }}
      />
    </MaskedView>
  </View>
);

const HeartsBackground = () => (
  <View pointerEvents="none" style={styles.heartsLayer}>
    <GradientHeart size={100} opacity={0.9} style={{ top: 90, right: -15 }} />
    <GradientHeart size={85} opacity={0.85} style={{ top: 260, left: -25 }} />
    <GradientHeart size={90} opacity={0.9} style={{ top: 380, right: 50 }} />
    <GradientHeart size={100} opacity={0.75} style={{ top: 500, left: -30 }} />
    <GradientHeart
      size={30}
      opacity={0.9}
      style={{ position: 'absolute', bottom: 100, alignSelf: 'center' }}
    />
    <GradientHeart size={80} opacity={1} style={{ bottom: 120, right: 100 }} />
  </View>
);

/* ══════════════════════════════════════════════════════════════════════════
   CHAT OPTIONS MENU — 3-dot dropdown
   ══════════════════════════════════════════════════════════════════════════ */

const REPORT_REASONS = [
  { key: 'abuse', label: 'Abuse or harassment' },
  { key: 'spam', label: 'Spam' },
  { key: 'fake_profile', label: 'Fake profile' },
];

const ChatOptionsMenu = ({
  visible,
  onClose,
  isMuted,
  isBlocked,
  muteLoading,
  blockLoading,
  clearLoading,
  reportLoading,
  reportSubmitted,
  onMute,
  onBlock,
  onClearChat,
  onReport,
}) => {
  const [view, setView] = useState('menu'); // 'menu' | 'reportPicker' | 'reportDone'
  const [selectedReason, setSelectedReason] = useState(null);

  // Reset to menu when modal opens
  useEffect(() => {
    if (visible) {
      setView('menu');
      setSelectedReason(null);
    }
  }, [visible]);

  // Auto-advance to done after report succeeds
  useEffect(() => {
    if (reportSubmitted && view === 'reportPicker') {
      setView('reportDone');
    }
  }, [reportSubmitted]);

  const submitReport = useCallback(() => {
    if (!selectedReason) return;
    onReport(selectedReason);
  }, [selectedReason, onReport]);

  /* ── Confirm helpers ──────────────────────────────────────────── */

  const confirmBlock = useCallback(() => {
    const action = isBlocked ? 'Unblock' : 'Block';
    const msg = isBlocked
      ? 'Unblocking will allow them to message and call you again.'
      : 'Blocking will prevent them from messaging or calling you.';
    Alert.alert(action, msg, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: action,
        style: isBlocked ? 'default' : 'destructive',
        onPress: onBlock,
      },
    ]);
  }, [isBlocked, onBlock]);

  const confirmClear = useCallback(() => {
    Alert.alert(
      'Clear Chat',
      'This will delete all messages for you only. The other person will still see the conversation.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: onClearChat },
      ],
    );
  }, [onClearChat]);

  /* ── Render ───────────────────────────────────────────────────── */

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Dimmed backdrop */}
      <Pressable style={styles.menuBackdrop} onPress={onClose}>
        {/* Stop propagation so tapping inside the card doesn't close */}
        <Pressable style={styles.menuCard} onPress={() => {}}>
          {/* ─── MAIN MENU ────────────────────────────────────────── */}
          {view === 'menu' && (
            <>
              <Text style={styles.menuTitle}>Chat Options</Text>

              {/* MUTE */}
              <TouchableOpacity
                style={styles.menuRow}
                onPress={onMute}
                disabled={muteLoading}
              >
                <View style={[styles.menuIcon, { backgroundColor: '#F3E7FF' }]}>
                  <Ionicons
                    name={
                      isMuted
                        ? 'notifications-outline'
                        : 'notifications-off-outline'
                    }
                    size={20}
                    color="#8B2FC9"
                  />
                </View>
                <View style={styles.menuTextBox}>
                  <Text style={styles.menuLabel}>
                    {isMuted ? 'Unmute Chat' : 'Mute Chat'}
                  </Text>
                  <Text style={styles.menuSub}>
                    {isMuted
                      ? 'Turn on notifications'
                      : 'Stop notifications from this chat'}
                  </Text>
                </View>
                {muteLoading && (
                  <ActivityIndicator size="small" color="#8B2FC9" />
                )}
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              {/* BLOCK */}
              <TouchableOpacity
                style={styles.menuRow}
                onPress={confirmBlock}
                disabled={blockLoading}
              >
                <View style={[styles.menuIcon, { backgroundColor: '#FFF0F0' }]}>
                  <Ionicons name="ban-outline" size={20} color="#E53935" />
                </View>
                <View style={styles.menuTextBox}>
                  <Text style={[styles.menuLabel, { color: '#E53935' }]}>
                    {isBlocked ? 'Unblock User' : 'Block User'}
                  </Text>
                  <Text style={styles.menuSub}>
                    {isBlocked
                      ? 'Allow messages and calls again'
                      : 'Prevent messages and calls'}
                  </Text>
                </View>
                {blockLoading && (
                  <ActivityIndicator size="small" color="#E53935" />
                )}
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              {/* CLEAR CHAT */}
              <TouchableOpacity
                style={styles.menuRow}
                onPress={confirmClear}
                disabled={clearLoading}
              >
                <View style={[styles.menuIcon, { backgroundColor: '#FFF8E1' }]}>
                  <Ionicons name="trash-outline" size={20} color="#F9A825" />
                </View>
                <View style={styles.menuTextBox}>
                  <Text style={[styles.menuLabel, { color: '#F9A825' }]}>
                    Clear Chat
                  </Text>
                  <Text style={styles.menuSub}>
                    Delete messages only for you
                  </Text>
                </View>
                {clearLoading && (
                  <ActivityIndicator size="small" color="#F9A825" />
                )}
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              {/* REPORT */}
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => setView('reportPicker')}
              >
                <View style={[styles.menuIcon, { backgroundColor: '#FFF0F0' }]}>
                  <Ionicons name="flag-outline" size={20} color="#E53935" />
                </View>
                <View style={styles.menuTextBox}>
                  <Text style={[styles.menuLabel, { color: '#E53935' }]}>
                    Report User
                  </Text>
                  <Text style={styles.menuSub}>Flag for admin review</Text>
                </View>
              </TouchableOpacity>

              {/* CANCEL */}
              <TouchableOpacity style={styles.menuCancel} onPress={onClose}>
                <Text style={styles.menuCancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ─── REPORT REASON PICKER ─────────────────────────────── */}
          {view === 'reportPicker' && (
            <>
              <TouchableOpacity
                style={styles.menuBack}
                onPress={() => setView('menu')}
              >
                <Ionicons name="chevron-back" size={18} color="#444" />
                <Text style={styles.menuBackText}>Back</Text>
              </TouchableOpacity>

              <Text style={styles.menuTitle}>Report Reason</Text>
              <Text
                style={[
                  styles.menuSub,
                  { marginBottom: 12, textAlign: 'center', color: '#666' },
                ]}
              >
                Select the reason for your report
              </Text>

              {REPORT_REASONS.map(r => (
                <TouchableOpacity
                  key={r.key}
                  style={[
                    styles.reasonRow,
                    selectedReason === r.key && styles.reasonRowActive,
                  ]}
                  onPress={() => setSelectedReason(r.key)}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      selectedReason === r.key && styles.radioOuterActive,
                    ]}
                  >
                    {selectedReason === r.key && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.reasonLabel}>{r.label}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[
                  styles.reportSubmitBtn,
                  (!selectedReason || reportLoading) &&
                    styles.reportSubmitDisabled,
                ]}
                onPress={submitReport}
                disabled={!selectedReason || reportLoading}
              >
                {reportLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.reportSubmitText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* ─── REPORT DONE ──────────────────────────────────────── */}
          {view === 'reportDone' && (
            <View style={styles.reportDoneBox}>
              <Ionicons name="checkmark-circle" size={52} color="#4CAF50" />
              <Text style={styles.reportDoneTitle}>Report Submitted</Text>
              <Text style={styles.reportDoneSub}>
                Our team will review this report. Thank you for keeping the
                community safe.
              </Text>
              <TouchableOpacity style={styles.menuCancel} onPress={onClose}>
                <Text style={styles.menuCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   MAIN CHAT SCREEN
   ══════════════════════════════════════════════════════════════════════════ */

const ChatScreen = ({ route, navigation }) => {
  const user = route?.params?.user || {};
  const userId = user?.user_id;

  const { socketRef } = useContext(SocketContext);
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const flatRef = useRef(null);
  const audioRecorderRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  /* ── Selectors ─────────────────────────────────────────────────── */

  const conversationId = useSelector(s =>
    userId ? s.chat.conversationIds?.[userId] : null,
  );
  const myId = useSelector(s => s.user.userdata?.user?.user_id);

  const messages =
    useSelector(s => (userId ? s.chat.conversations?.[userId] : [])) || [];

  // Chat options state
  const chatOptions = useSelector(s => s.chatOptions) ?? {};
  const isMuted = !!chatOptions.muted?.[conversationId];
  const isBlocked = !!chatOptions.blocked?.[userId];
  const muteLoading = chatOptions.muteLoading;
  const blockLoading = chatOptions.blockLoading;
  const clearLoading = chatOptions.clearLoading;
  const reportLoading = chatOptions.reportLoading;
  const reportSubmitted = chatOptions.reportSubmitted;

  /* ── Init ──────────────────────────────────────────────────────── */

  useEffect(() => {
    audioRecorderRef.current = createAudioRecorder();

    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechResults = ev => {
      const spoken = ev?.value?.[0];
      if (spoken) setText(spoken);
      setIsListening(false);
    };
    Voice.onSpeechError = () => setIsListening(false);

    return () => {
      audioRecorderRef.current?.stopRecorder?.();
      audioRecorderRef.current?.removeRecordBackListener?.();
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    dispatch(chatSetActive(userId));
    return () => dispatch(chatClearActive());
  }, [dispatch, userId]);

  useEffect(() => {
    if (!userId) return;
    dispatch(chatHistoryRequest(userId));
  }, [userId]);

  useEffect(() => {
    if (!conversationId) return;
    socketRef.current?.emit('chat_read_all', { conversationId });
  }, [conversationId]);

  useEffect(() => {
    if (!userId) return;
    dispatch(chatUnreadClear(userId));
  }, [userId]);

  useEffect(() => {
    if (!userId || !myId) return;
    socketRef.current?.emit('chat_open', {
      userId: myId,
      chattingWith: userId,
    });
    return () => socketRef.current?.emit('chat_close', { userId: myId });
  }, [myId, userId, socketRef]);

  // Load mute + block status once conversationId is known
  useEffect(() => {
    if (!conversationId || !userId) return;
    dispatch(chatOptionsStatusRequest(conversationId, userId));
  }, [conversationId, userId, dispatch]);

  useEffect(() => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  /* ── Blocked banner ────────────────────────────────────────────── */
  // Show a banner at the bottom when the chat is blocked
  const renderBlockedBanner = () => (
    <View style={styles.blockedBanner}>
      <Ionicons name="ban-outline" size={16} color="#E53935" />
      <Text style={styles.blockedBannerText}>
        You have blocked this user. Unblock to send messages.
      </Text>
    </View>
  );

  /* ── Chat Options handlers ─────────────────────────────────────── */

  const handleMute = useCallback(() => {
    if (!conversationId) return;
    dispatch(chatMuteRequest(conversationId));
  }, [dispatch, conversationId]);

  const handleBlock = useCallback(() => {
    if (!userId) return;
    dispatch(chatBlockRequest(userId));
    setMenuVisible(false);
  }, [dispatch, userId]);

  const handleClearChat = useCallback(() => {
    if (!conversationId || !userId) return;
    dispatch(chatClearHistoryRequest(conversationId, userId));
    setMenuVisible(false);
  }, [dispatch, conversationId, userId]);

  const handleReport = useCallback(
    reason => {
      if (!userId) return;
      dispatch(chatReportRequest(userId, reason));
      // menu stays open to show loading → done state
    },
    [dispatch, userId],
  );

  /* ── Messages list ─────────────────────────────────────────────── */

  const messagesWithDate = useMemo(() => {
    const map = new Map();
    messages.forEach(item => {
      const msg = item.message ?? item;
      if (msg?.message_id) map.set(String(msg.message_id), msg);
    });

    const sorted = [...map.values()].sort(
      (a, b) => new Date(a.sent_at) - new Date(b.sent_at),
    );

    const out = [];
    let last = null;

    sorted.forEach(msg => {
      const label = getDayLabel(msg.sent_at);
      if (label && label !== last) {
        out.push({ type: 'date', id: `d-${label}-${msg.message_id}`, label });
        last = label;
      }
      out.push({ type: 'msg', ...msg });
    });

    return out;
  }, [messages]);

  /* ── Send / Media ──────────────────────────────────────────────── */

  const sendMessage = useCallback(() => {
    if (!text.trim() || !userId) return;
    if (isBlocked) {
      Alert.alert('Blocked', 'You cannot send messages to a blocked user.');
      return;
    }
    socketRef.current?.emit('chat_send', {
      receiverId: userId,
      content: text.trim(),
      message_type: 'text',
    });
    setText('');
  }, [text, userId, isBlocked, socketRef]);

  const startVoiceRecognition = async () => {
    try {
      const ok = await requestPermission(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      if (!ok) {
        Alert.alert('Permission required', 'Allow microphone permission.');
        return;
      }
      if (isListening) {
        await Voice.stop();
        setIsListening(false);
        return;
      }
      setText('');
      setIsListening(true);
      await Voice.start('en-US');
    } catch (e) {
      console.log('voice error:', e);
      setIsListening(false);
    }
  };

  const openCamera = async () => {
    try {
      const ok = await requestPermission(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (!ok) {
        Alert.alert('Permission required', 'Allow camera permission.');
        return;
      }
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      });
      if (result?.didCancel) return;
      const asset = result?.assets?.[0];
      if (!asset?.uri || !userId) return;
      dispatch(
        chatFileUploadRequest({
          file: asset,
          receiverId: userId,
          message_type: 'image',
          socket: socketRef.current,
        }),
      );
    } catch (e) {
      console.log('camera error:', e);
    }
  };

  const openFileManager = async () => {
    try {
      const result = await pick({ type: ['*/*'] });
      const file = result[0];
      if (!file?.uri || !userId) return;
      dispatch(
        chatFileUploadRequest({
          file: {
            uri: file.uri,
            fileName: file.name,
            type: file.type || 'application/octet-stream',
          },
          receiverId: userId,
          message_type: 'file',
          socket: socketRef.current,
        }),
      );
    } catch (e) {
      console.log('file error:', e);
    }
  };

  const startRecording = async () => {
    try {
      if (!audioRecorderRef.current?.startRecorder) return;
      setIsRecording(true);
      await audioRecorderRef.current.startRecorder();
    } catch (e) {
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (!audioRecorderRef.current?.stopRecorder) {
        setIsRecording(false);
        return;
      }
      const path = await audioRecorderRef.current.stopRecorder();
      audioRecorderRef.current?.removeRecordBackListener?.();
      setIsRecording(false);
      if (!path || !userId) return;
      dispatch(
        chatFileUploadRequest({
          file: { uri: path, fileName: 'voice.mp3', type: 'audio/mpeg' },
          receiverId: userId,
          message_type: 'audio',
          socket: socketRef.current,
        }),
      );
    } catch (e) {
      setIsRecording(false);
    }
  };

  const startFriendCall = type => {
    if (!userId) return;
    dispatch({
      type: 'OUTGOING_CALL_STARTED',
      payload: {
        session_id: null,
        call_type: type,
        direction: 'OUTGOING',
        status: 'RINGING',
      },
    });
    dispatch(friendCallRequest({ friend_id: userId, call_type: type }));
    navigation.navigate('CallStatusScreen', {
      call_type: type,
      role: 'friend_caller',
      friend_id: userId,
    });
  };

  /* ── Render helpers ────────────────────────────────────────────── */

  const renderContent = item => {
    switch (item.message_type) {
      case 'image':
        return (
          <Image
            source={{ uri: item.content }}
            style={{ width: 200, height: 200, borderRadius: 10 }}
          />
        );
      case 'video':
        return (
          <Video
            source={{ uri: item.content }}
            style={{ width: 220, height: 200 }}
            controls
          />
        );
      case 'audio':
        return (
          <TouchableOpacity onPress={() => Linking.openURL(item.content)}>
            <Text style={{ color: '#222' }}>▶️ Play Audio</Text>
          </TouchableOpacity>
        );
      case 'file':
        return (
          <TouchableOpacity onPress={() => Linking.openURL(item.content)}>
            <Text style={{ color: '#222' }}>📎 Open File</Text>
          </TouchableOpacity>
        );
      default:
        return <Text style={{ color: '#222' }}>{item.content}</Text>;
    }
  };

  const renderItem = ({ item }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateWrap}>
          <Text style={styles.dateText}>{item.label}</Text>
        </View>
      );
    }

    const isMe = Number(item.sender_id) === Number(myId);
    const time = item.sent_at
      ? new Date(item.sent_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    return (
      <View
        style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}
      >
        <View>{renderContent(item)}</View>
        <View style={styles.metaRow}>
          {!!time && (
            <Text style={[styles.timeText, isMe && styles.myTimeText]}>
              {time}
            </Text>
          )}
          {isMe && (
            <Ionicons
              name={
                item.is_read
                  ? 'checkmark-done'
                  : item.delivered
                  ? 'checkmark-done'
                  : 'checkmark'
              }
              size={14}
              color={
                item.is_read ? '#34B7F1' : item.delivered ? '#999' : '#ddd'
              }
            />
          )}
        </View>
      </View>
    );
  };

  const avatarUri =
    user?.avatar ||
    user?.profile_pic ||
    user?.profile_image ||
    user?.image ||
    null;
  const lastSeenValue =
    user?.last_seen || user?.lastSeen || user?.last_active || null;

  if (!userId) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>User data not found</Text>
          <TouchableOpacity
            style={styles.errorBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* ── JSX ───────────────────────────────────────────────────────── */

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <LinearGradient
          colors={['#fdf2fa', '#fdf2fa', '#b470f3']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ flex: 1 }}
        >
          <HeartsBackground />

          {/* ── HEADER ─────────────────────────────────────────────── */}
          <LinearGradient
            colors={['#F3E7FF', '#FCE6F6']}
            style={[
              styles.chatHeader,
              {
                paddingTop:
                  Platform.OS === 'android' ? insets.top + 8 : insets.top + 4,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={26} color="#222" />
            </TouchableOpacity>

            <View style={styles.profileBox}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.headerAvatar}
                />
              ) : (
                <View style={styles.headerPlaceholder}>
                  <Text style={styles.headerPlaceholderText}>
                    {user?.name?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              <View style={styles.nameBox}>
                <Text style={styles.headerName} numberOfLines={1}>
                  {user?.name || 'User'}
                </Text>
                <Text style={styles.headerStatus} numberOfLines={1}>
                  {isMuted
                    ? '🔕 Muted'
                    : Number(user?.is_online) === 1
                    ? 'Active now'
                    : getLastSeenText(lastSeenValue)}
                </Text>
              </View>
            </View>

            <View style={styles.callIconsRow}>
              {/* Call buttons (disabled when blocked) */}
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => startFriendCall('AUDIO')}
                activeOpacity={0.75}
                disabled={isBlocked}
              >
                <Ionicons
                  name="call-outline"
                  size={28}
                  color={isBlocked ? '#ccc' : '#C026F8'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => startFriendCall('VIDEO')}
                activeOpacity={0.75}
                disabled={isBlocked}
              >
                <Ionicons
                  name="videocam-outline"
                  size={31}
                  color={isBlocked ? '#ccc' : '#C026F8'}
                />
              </TouchableOpacity>

              {/* ── 3-DOT MENU BUTTON ─────────────────────────────── */}
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => setMenuVisible(true)}
                activeOpacity={0.75}
              >
                <Ionicons name="ellipsis-vertical" size={22} color="#555" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* ── MESSAGE LIST ───────────────────────────────────────── */}
          <FlatList
            ref={flatRef}
            data={messagesWithDate}
            keyExtractor={i =>
              i.type === 'date' ? i.id : String(i.message_id)
            }
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          />

          {/* ── BLOCKED BANNER ─────────────────────────────────────── */}
          {isBlocked && renderBlockedBanner()}

          {/* ── INPUT BAR ──────────────────────────────────────────── */}
          {!isBlocked && (
            <View
              style={[
                styles.bottomWrap,
                { paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0 },
              ]}
            >
              <View style={styles.inputPill}>
                <TouchableOpacity style={styles.leftIcon} activeOpacity={0.7}>
                  <Ionicons name="happy-outline" size={26} color="#8F8F8F" />
                </TouchableOpacity>

                <TextInput
                  placeholder={isListening ? 'Listening...' : 'Type.....'}
                  value={text}
                  onChangeText={setText}
                  style={styles.input}
                  placeholderTextColor="#8F8F8F"
                  multiline={false}
                  returnKeyType="send"
                  onSubmitEditing={sendMessage}
                />

                <TouchableOpacity
                  style={styles.smallIconBtn}
                  onPress={openFileManager}
                  activeOpacity={0.7}
                >
                  <Ionicons name="attach-outline" size={28} color="#C026F8" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.smallIconBtn}
                  onPress={openCamera}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera-outline" size={30} color="#C026F8" />
                </TouchableOpacity>
              </View>

              {text.trim().length > 0 ? (
                <TouchableOpacity
                  style={styles.micBtn}
                  onPress={sendMessage}
                  activeOpacity={0.8}
                >
                  <Ionicons name="send" size={27} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.micBtn,
                    isRecording && styles.micRecording,
                    isListening && styles.micListening,
                  ]}
                  onPress={startVoiceRecognition}
                  onLongPress={startRecording}
                  onPressOut={() => {
                    if (isRecording) stopRecording();
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isListening ? 'mic' : 'mic-outline'}
                    size={34}
                    color="#fff"
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </LinearGradient>
      </KeyboardAvoidingView>

      {/* ── CHAT OPTIONS MODAL ─────────────────────────────────────── */}
      <ChatOptionsMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        isMuted={isMuted}
        isBlocked={isBlocked}
        muteLoading={muteLoading}
        blockLoading={blockLoading}
        clearLoading={clearLoading}
        reportLoading={reportLoading}
        reportSubmitted={reportSubmitted}
        onMute={handleMute}
        onBlock={handleBlock}
        onClearChat={handleClearChat}
        onReport={handleReport}
      />
    </SafeAreaView>
  );
};

export default ChatScreen;

/* ══════════════════════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════════════════════ */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FCE6F6' },
  flex: { flex: 1 },
  heartsLayer: { ...StyleSheet.absoluteFillObject },

  /* HEADER */
  chatHeader: {
    minHeight: 88,
    paddingBottom: 12,
    paddingHorizontal: isSmall ? 8 : 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    elevation: 4,
  },
  backBtn: {
    width: isSmall ? 28 : 34,
    height: 42,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  profileBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    marginRight: 4,
  },
  headerAvatar: {
    width: isSmall ? 34 : 40,
    height: isSmall ? 34 : 40,
    borderRadius: isSmall ? 17 : 20,
    marginRight: isSmall ? 6 : 9,
    borderWidth: 2,
    borderColor: '#C026F8',
  },
  headerPlaceholder: {
    width: isSmall ? 34 : 40,
    height: isSmall ? 34 : 40,
    borderRadius: isSmall ? 17 : 20,
    backgroundColor: '#C026F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmall ? 6 : 9,
  },
  headerPlaceholderText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  nameBox: { flex: 1, minWidth: 0 },
  headerName: { fontSize: isSmall ? 14 : 16, fontWeight: '800', color: '#111' },
  headerStatus: { fontSize: isSmall ? 10 : 11, color: '#6A6A6A', marginTop: 2 },
  callIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: isSmall ? 4 : 8,
  },
  headerIconBtn: {
    width: isSmall ? 34 : 40,
    height: isSmall ? 34 : 40,
    borderRadius: isSmall ? 17 : 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* MESSAGE LIST */
  list: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8 },
  dateWrap: { alignItems: 'center', marginVertical: 10 },
  dateText: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    fontSize: 12,
    color: '#666',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginVertical: 6,
    maxWidth: '78%',
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#B829F4',
    borderBottomRightRadius: 6,
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: { fontSize: 10, color: '#777', marginRight: 3 },
  myTimeText: { color: '#eee' },

  /* INPUT */
  bottomWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmall ? 7 : 10,
    paddingTop: 6,
    backgroundColor: '#FCE6F6',
  },
  inputPill: {
    flex: 1,
    height: isSmall ? 50 : 56,
    backgroundColor: '#fff',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: isSmall ? 10 : 12,
    paddingRight: isSmall ? 5 : 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    elevation: 2,
  },
  leftIcon: {
    width: 30,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  },
  input: {
    flex: 1,
    fontSize: isSmall ? 14 : 16,
    color: '#222',
    paddingVertical: 6,
    paddingHorizontal: 5,
  },
  smallIconBtn: {
    width: isSmall ? 28 : 34,
    height: isSmall ? 28 : 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: isSmall ? 1 : 3,
  },
  micBtn: {
    width: isSmall ? 50 : 56,
    height: isSmall ? 50 : 56,
    borderRadius: isSmall ? 25 : 28,
    backgroundColor: '#B829F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: isSmall ? 7 : 10,
    elevation: 5,
  },
  micRecording: { backgroundColor: '#ff2d55' },
  micListening: { backgroundColor: '#22C55E' },

  /* BLOCKED BANNER */
  blockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  blockedBannerText: {
    color: '#E53935',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  /* ERROR */
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 20,
  },
  errorBtn: {
    backgroundColor: '#B829F4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  errorBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  /* ── MENU MODAL ───────────────────────────────────────────────── */
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  menuCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextBox: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#111' },
  menuSub: { fontSize: 12, color: '#888', marginTop: 2 },
  menuDivider: { height: 1, backgroundColor: '#F2F2F2', marginVertical: 2 },
  menuCancel: {
    marginTop: 18,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  menuCancelText: { fontSize: 15, fontWeight: '600', color: '#555' },

  menuBack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  menuBackText: { fontSize: 14, color: '#444' },

  /* REPORT PICKER */
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 12,
  },
  reasonRowActive: { borderColor: '#B829F4', backgroundColor: '#F9F0FF' },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: { borderColor: '#B829F4' },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#B829F4',
  },
  reasonLabel: { fontSize: 14, color: '#222', flex: 1 },

  reportSubmitBtn: {
    marginTop: 20,
    backgroundColor: '#B829F4',
    paddingVertical: 13,
    borderRadius: 24,
    alignItems: 'center',
  },
  reportSubmitDisabled: { backgroundColor: '#DDD' },
  reportSubmitText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  /* REPORT DONE */
  reportDoneBox: { alignItems: 'center', paddingVertical: 16 },
  reportDoneTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginTop: 12,
    marginBottom: 8,
  },
  reportDoneSub: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
