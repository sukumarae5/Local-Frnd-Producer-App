// screens/ChatScreen.js
// Full ChatScreen with Chat Options: Mute, Block, Clear Chat, Report
// + WhatsApp-style voice notes: hold-to-record, slide-left-to-cancel,
//   slide-up-to-lock, auto-upload on release (no preview screen),
//   optimistic sending, single shared audio player across all bubbles.
//
// Recording AND playback both go through react-native-nitro-sound's
// singleton (`Sound`) — the same package already working in this app for
// the message-tone sound effect. No react-native-live-audio-stream, no
// react-native-audio-recorder-player (deprecated in favor of nitro-sound,
// which has the identical API).

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
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  PermissionsAndroid,
  Alert,
  Modal,
  ActivityIndicator,
  Pressable,
  Linking,
  useWindowDimensions,
  FlatList,
  PanResponder,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import Voice from '@react-native-voice/voice';
import { launchCamera } from 'react-native-image-picker';
import { pick } from '@react-native-documents/picker';
import Video from 'react-native-video';
import { useDispatch, useSelector } from 'react-redux';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Sound from 'react-native-nitro-sound';

import { SocketContext } from '../socket/SocketProvider';
import { friendCallRequest } from '../features/calls/callAction';
import {
  chatFileUploadRequest,
  chatMessageAdd,
  chatMessageRemove,
} from '../features/chat/chatAction';

import {
  chatHistoryRequest,
  chatUnreadClear,
  chatSetActive,
  chatClearActive,
} from '../features/chat/chatAction';

import {
  chatMuteRequest,
  chatBlockRequest,
  chatClearHistoryRequest,
  chatReportRequest,
  chatOptionsStatusRequest,
} from '../features/chat/chatOptionsAction';

import { useAppTheme } from '../theme';
import { AppText } from '../components';
import AudioMessageBubble from '../components/AudioMessageBubble';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

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

const formatDuration = totalSeconds => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

/* ── Voice-note recording constants ─────────────────────────────────────── */
const MAX_RECORD_SECONDS = 300; // item 14 — 5 minute cap
const MIN_RECORD_SECONDS = 1;   // item 15 — discard if shorter than this
const CANCEL_THRESHOLD = -90;   // px dragged left -> cancel (item 16)
const LOCK_THRESHOLD = -90;     // px dragged up   -> lock   (item 18)

/* ── Chat palette — now theme-aware instead of fixed ────────────────────────
   Light mode keeps the original pink/purple romantic identity.
   Dark mode swaps to a deep purple/charcoal palette that keeps the same
   brand hue family but respects the user's theme choice. ─────────────────── */

const getChatPalette = theme => {
  if (theme.isDark) {
    return {
      screenGradient: ['#1A0F22', '#1A0F22', '#2E1A3D'],
      headerGradient: ['#241530', '#2B1838'],
      heartTint: ['rgba(255,255,255,0.08)', 'rgba(152,50,248,0.12)'],
      headerAccent: '#C026F8',
      headerBorder: '#C026F8',
      headerNameColor: theme.colors.text,
      headerStatusColor: theme.colors.textMuted,
      backIconColor: theme.colors.text,
      menuDotsColor: theme.colors.textMuted,
      dateBg: 'rgba(255,255,255,0.08)',
      dateText: theme.colors.textMuted,
      myBubble: '#8C37F8',
      otherBubble: theme.colors.card,
      otherBubbleText: theme.colors.text,
      timeText: theme.colors.textMuted,
      myTimeText: 'rgba(255,255,255,0.75)',
      bottomWrapBg: '#1A0F22',
      inputPillBg: theme.colors.card,
      inputBorder: theme.colors.border,
      inputText: theme.colors.text,
      inputPlaceholder: theme.colors.placeholder,
      leftIconColor: theme.colors.iconMuted,
      accentIconColor: '#C026F8',
      micBg: '#8C37F8',
      blockedBannerBg: `${theme.colors.error}1F`,
      blockedBannerText: theme.colors.error,
      errorText: theme.colors.text,
    };
  }

  return {
    screenGradient: ['#fdf2fa', '#fdf2fa', '#b470f3'],
    headerGradient: ['#F3E7FF', '#FCE6F6'],
    heartTint: ['rgba(255,255,255,0.5)', 'rgba(152,50,248,0.15)'],
    headerAccent: '#C026F8',
    headerBorder: '#C026F8',
    headerNameColor: '#111',
    headerStatusColor: '#6A6A6A',
    backIconColor: '#222',
    menuDotsColor: '#555',
    dateBg: 'rgba(255,255,255,0.85)',
    dateText: '#666',
    myBubble: '#B829F4',
    otherBubble: '#fff',
    otherBubbleText: '#222',
    timeText: '#777',
    myTimeText: '#eee',
    bottomWrapBg: '#FCE6F6',
    inputPillBg: '#fff',
    inputBorder: '#E6E6E6',
    inputText: '#222',
    inputPlaceholder: '#8F8F8F',
    leftIconColor: '#8F8F8F',
    accentIconColor: '#C026F8',
    micBg: '#B829F4',
    blockedBannerBg: '#FFF0F0',
    blockedBannerText: '#E53935',
    errorText: '#222',
  };
};

/* ── Decorative hearts — tinted per palette ─────────────────────────────── */

const GradientHeart = ({ size, style, opacity = 1, tint }) => (
  <View pointerEvents="none" style={[{ position: 'absolute', opacity }, style]}>
    <MaskedView
      maskElement={<Ionicons name="heart" size={size} color="black" />}
    >
      <LinearGradient
        colors={tint}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ width: size, height: size }}
      />
    </MaskedView>
  </View>
);

const HeartsBackground = ({ tint }) => (
  <View pointerEvents="none" style={heartsBackgroundStyles.heartsLayer}>
    <GradientHeart
      size={moderateScale(100)}
      opacity={0.9}
      tint={tint}
      style={{ top: moderateScale(90), right: -moderateScale(15) }}
    />
    <GradientHeart
      size={moderateScale(85)}
      opacity={0.85}
      tint={tint}
      style={{ top: moderateScale(260), left: -moderateScale(25) }}
    />
    <GradientHeart
      size={moderateScale(90)}
      opacity={0.9}
      tint={tint}
      style={{ top: moderateScale(380), right: moderateScale(50) }}
    />
    <GradientHeart
      size={moderateScale(100)}
      opacity={0.75}
      tint={tint}
      style={{ top: moderateScale(500), left: -moderateScale(30) }}
    />
    <GradientHeart
      size={moderateScale(30)}
      opacity={0.9}
      tint={tint}
      style={{
        position: 'absolute',
        bottom: moderateScale(100),
        alignSelf: 'center',
      }}
    />
    <GradientHeart
      size={moderateScale(80)}
      opacity={1}
      tint={tint}
      style={{ bottom: moderateScale(120), right: moderateScale(100) }}
    />
  </View>
);

const heartsBackgroundStyles = StyleSheet.create({
  heartsLayer: { ...StyleSheet.absoluteFillObject },
});

/* ══════════════════════════════════════════════════════════════════════════
   CHAT OPTIONS MENU — 3-dot dropdown (themed, standard system sheet)
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
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const menuStyles = useMemo(() => createMenuStyles(theme), [theme]);

  const [view, setView] = useState('menu');
  const [selectedReason, setSelectedReason] = useState(null);

  useEffect(() => {
    if (visible) {
      setView('menu');
      setSelectedReason(null);
    }
  }, [visible]);

  useEffect(() => {
    if (reportSubmitted && view === 'reportPicker') {
      setView('reportDone');
    }
  }, [reportSubmitted]);

  const submitReport = useCallback(() => {
    if (!selectedReason) return;
    onReport(selectedReason);
  }, [selectedReason, onReport]);

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

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={menuStyles.menuBackdrop} onPress={onClose}>
        <Pressable style={menuStyles.menuCard} onPress={() => {}}>
          {view === 'menu' && (
            <>
              <AppText variant="h4" style={menuStyles.menuTitle}>
                Chat Options
              </AppText>

              <TouchableOpacity
                style={menuStyles.menuRow}
                onPress={onMute}
                disabled={muteLoading}
              >
                <View
                  style={[
                    menuStyles.menuIcon,
                    { backgroundColor: `${colors.secondary}1F` },
                  ]}
                >
                  <Ionicons
                    name={
                      isMuted
                        ? 'notifications-outline'
                        : 'notifications-off-outline'
                    }
                    size={moderateScale(20)}
                    color={colors.secondary}
                  />
                </View>
                <View style={menuStyles.menuTextBox}>
                  <AppText variant="subtitle">
                    {isMuted ? 'Unmute Chat' : 'Mute Chat'}
                  </AppText>
                  <AppText
                    variant="caption"
                    color="textMuted"
                    style={menuStyles.menuSub}
                  >
                    {isMuted
                      ? 'Turn on notifications'
                      : 'Stop notifications from this chat'}
                  </AppText>
                </View>
                {muteLoading && (
                  <ActivityIndicator size="small" color={colors.secondary} />
                )}
              </TouchableOpacity>

              <View style={menuStyles.menuDivider} />

              <TouchableOpacity
                style={menuStyles.menuRow}
                onPress={confirmBlock}
                disabled={blockLoading}
              >
                <View
                  style={[
                    menuStyles.menuIcon,
                    { backgroundColor: `${colors.error}1A` },
                  ]}
                >
                  <Ionicons
                    name="ban-outline"
                    size={moderateScale(20)}
                    color={colors.error}
                  />
                </View>
                <View style={menuStyles.menuTextBox}>
                  <AppText variant="subtitle" color="error">
                    {isBlocked ? 'Unblock User' : 'Block User'}
                  </AppText>
                  <AppText
                    variant="caption"
                    color="textMuted"
                    style={menuStyles.menuSub}
                  >
                    {isBlocked
                      ? 'Allow messages and calls again'
                      : 'Prevent messages and calls'}
                  </AppText>
                </View>
                {blockLoading && (
                  <ActivityIndicator size="small" color={colors.error} />
                )}
              </TouchableOpacity>

              <View style={menuStyles.menuDivider} />

              <TouchableOpacity
                style={menuStyles.menuRow}
                onPress={confirmClear}
                disabled={clearLoading}
              >
                <View
                  style={[
                    menuStyles.menuIcon,
                    { backgroundColor: `${colors.warning}1F` },
                  ]}
                >
                  <Ionicons
                    name="trash-outline"
                    size={moderateScale(20)}
                    color={colors.warning}
                  />
                </View>
                <View style={menuStyles.menuTextBox}>
                  <AppText variant="subtitle" color="warning">
                    Clear Chat
                  </AppText>
                  <AppText
                    variant="caption"
                    color="textMuted"
                    style={menuStyles.menuSub}
                  >
                    Delete messages only for you
                  </AppText>
                </View>
                {clearLoading && (
                  <ActivityIndicator size="small" color={colors.warning} />
                )}
              </TouchableOpacity>

              <View style={menuStyles.menuDivider} />

              <TouchableOpacity
                style={menuStyles.menuRow}
                onPress={() => setView('reportPicker')}
              >
                <View
                  style={[
                    menuStyles.menuIcon,
                    { backgroundColor: `${colors.error}1A` },
                  ]}
                >
                  <Ionicons
                    name="flag-outline"
                    size={moderateScale(20)}
                    color={colors.error}
                  />
                </View>
                <View style={menuStyles.menuTextBox}>
                  <AppText variant="subtitle" color="error">
                    Report User
                  </AppText>
                  <AppText
                    variant="caption"
                    color="textMuted"
                    style={menuStyles.menuSub}
                  >
                    Flag for admin review
                  </AppText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={menuStyles.menuCancel} onPress={onClose}>
                <AppText variant="subtitle" color="textSecondary">
                  Cancel
                </AppText>
              </TouchableOpacity>
            </>
          )}

          {view === 'reportPicker' && (
            <>
              <TouchableOpacity
                style={menuStyles.menuBack}
                onPress={() => setView('menu')}
              >
                <Ionicons
                  name="chevron-back"
                  size={moderateScale(18)}
                  color={colors.icon}
                />
                <AppText variant="bodySmall" color="textSecondary">
                  Back
                </AppText>
              </TouchableOpacity>

              <AppText variant="h4" style={menuStyles.menuTitle}>
                Report Reason
              </AppText>
              <AppText
                variant="caption"
                color="textMuted"
                style={menuStyles.reportSubTitle}
              >
                Select the reason for your report
              </AppText>

              {REPORT_REASONS.map(r => (
                <TouchableOpacity
                  key={r.key}
                  style={[
                    menuStyles.reasonRow,
                    selectedReason === r.key && menuStyles.reasonRowActive,
                  ]}
                  onPress={() => setSelectedReason(r.key)}
                >
                  <View
                    style={[
                      menuStyles.radioOuter,
                      selectedReason === r.key && menuStyles.radioOuterActive,
                    ]}
                  >
                    {selectedReason === r.key && (
                      <View style={menuStyles.radioInner} />
                    )}
                  </View>
                  <AppText variant="bodySmall" style={menuStyles.reasonLabel}>
                    {r.label}
                  </AppText>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[
                  menuStyles.reportSubmitBtn,
                  (!selectedReason || reportLoading) &&
                    menuStyles.reportSubmitDisabled,
                ]}
                onPress={submitReport}
                disabled={!selectedReason || reportLoading}
              >
                {reportLoading ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <AppText
                    variant="button"
                    style={{ color: colors.textInverse }}
                  >
                    Submit Report
                  </AppText>
                )}
              </TouchableOpacity>
            </>
          )}

          {view === 'reportDone' && (
            <View style={menuStyles.reportDoneBox}>
              <Ionicons
                name="checkmark-circle"
                size={moderateScale(52)}
                color={colors.success}
              />
              <AppText variant="h4" style={menuStyles.reportDoneTitle}>
                Report Submitted
              </AppText>
              <AppText
                variant="bodySmall"
                color="textMuted"
                style={menuStyles.reportDoneSub}
              >
                Our team will review this report. Thank you for keeping the
                community safe.
              </AppText>
              <TouchableOpacity style={menuStyles.menuCancel} onPress={onClose}>
                <AppText variant="subtitle" color="textSecondary">
                  Close
                </AppText>
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
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const chat = useMemo(() => getChatPalette(theme), [theme]);
  const styles = useMemo(
    () => createStyles(theme, width, chat),
    [theme, width, chat],
  );

  const flatRef = useRef(null);
  const timerRef = useRef(null);

  // Refs mirror the "recording state machine" synchronously, since the
  // PanResponder handlers are created once (via useRef) and would otherwise
  // close over stale state values from the first render.
  const isRecordingRef = useRef(false);
  const isLockedRef = useRef(false);
  const cancelledRef = useRef(false);
  const gestureHandledRef = useRef(false);
  const recordDurationRef = useRef(0);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingLocked, setRecordingLocked] = useState(false);
  const [slideX, setSlideX] = useState(0);
  const [slideY, setSlideY] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);

  const [onlineStatus, setOnlineStatus] = useState({
  is_online: user?.is_online || 0,
  last_seen: user?.last_seen || null,
});

useEffect(() => {
  const socket = socketRef.current;
  if (!socket) return;

  const onPresenceUpdate = data => {
    if (Number(data.user_id) !== Number(userId)) return;

    setOnlineStatus({
      is_online: data.is_online,
      last_seen: data.last_seen,
    });
  };

  socket.on('presence_update', onPresenceUpdate);

  return () => {
    socket.off('presence_update', onPresenceUpdate);
  };
}, [userId]);

  const fileUploading = useSelector(s => s.chat.fileUploading);

  const conversationId = useSelector(s =>
    userId ? s.chat.conversationIds?.[userId] : null,
  );
  const myId = useSelector(s => s.user.userdata?.user?.user_id);

  const messages =
    useSelector(s => (userId ? s.chat.conversations?.[userId] : [])) || [];

  const chatOptions = useSelector(s => s.chatOptions) ?? {};
  const isMuted = !!chatOptions.muted?.[conversationId];
  const isBlocked = !!chatOptions.blocked?.[userId];
  const muteLoading = chatOptions.muteLoading;
  const blockLoading = chatOptions.blockLoading;
  const clearLoading = chatOptions.clearLoading;
  const reportLoading = chatOptions.reportLoading;
  const reportSubmitted = chatOptions.reportSubmitted;

  useEffect(() => {
    recordDurationRef.current = recordDuration;
  }, [recordDuration]);

  useEffect(() => {
    // Stop any in-flight recording if the screen unmounts mid-way.
    return () => {
      clearInterval(timerRef.current);
      if (isRecordingRef.current) {
        Sound.stopRecorder().catch(() => {});
      }
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

  useEffect(() => {
    if (!conversationId || !userId) return;
    dispatch(chatOptionsStatusRequest(conversationId, userId));
  }, [conversationId, userId, dispatch]);

  useEffect(() => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const renderBlockedBanner = () => (
    <View style={styles.blockedBanner}>
      <Ionicons
        name="ban-outline"
        size={moderateScale(16)}
        color={chat.blockedBannerText}
      />
      <AppText variant="bodySmall" style={styles.blockedBannerText}>
        You have blocked this user. Unblock to send messages.
      </AppText>
    </View>
  );

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
    },
    [dispatch, userId],
  );

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

  /* ── VOICE NOTE RECORDING (react-native-nitro-sound) ─────────────────── */

  const resetRecordingUI = () => {
    clearInterval(timerRef.current);
    isRecordingRef.current = false;
    isLockedRef.current = false;
    setIsRecording(false);
    setRecordingLocked(false);
    setSlideX(0);
    setSlideY(0);
    setRecordDuration(0);
  };

  const startRecording = async () => {
    if (isRecordingRef.current) return;

    if (fileUploading) {
      // nitro-sound reuses the same default file path for every recording.
      // Starting a new one while the previous upload is still reading that
      // file would corrupt/overwrite it mid-upload.
      Alert.alert('Please wait', 'Your last voice note is still sending.');
      return;
    }

    const granted = await requestPermission(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
    if (!granted) {
      Alert.alert('Microphone permission required');
      return;
    }

    try {
      cancelledRef.current = false;
      gestureHandledRef.current = false;

      // No filename passed here on purpose. A bare relative filename like
      // `voice_123.m4a` gets opened relative to the OS root ("/"), which is
      // read-only on Android -> EROFS. Calling startRecorder() with no
      // argument makes nitro-sound use its own safe, writable default path
      // ({cacheDir}/sound.mp4), and it returns that resolved absolute path.
      console.log('[voice] starting recorder');
      const uri = await Sound.startRecorder();
      console.log('[voice] recorder started at', uri);

      isRecordingRef.current = true;
      isLockedRef.current = false;
      setIsRecording(true);
      setRecordingLocked(false);
      setRecordDuration(0);
      setSlideX(0);
      setSlideY(0);

      timerRef.current = setInterval(() => {
        setRecordDuration(prev => {
          const next = prev + 1;
          if (next >= MAX_RECORD_SECONDS) {
            // Hit the cap — auto-stop and send, same as releasing normally.
            finishRecording();
          }
          return next;
        });
      }, 1000);
    } catch (e) {
      console.log('[voice] record start error', e);
      Alert.alert('Could not start recording', String(e?.message || e));
      resetRecordingUI();
    }
  };

  const cancelRecording = async () => {
    console.log('[voice] cancel recording (slide-to-cancel)');
    cancelledRef.current = true;
    try {
      await Sound.stopRecorder();
    } catch (e) {
      // fine — recorder may already be stopped
    }
    resetRecordingUI();
  };

  const lockRecording = () => {
    console.log('[voice] recording locked (slide-up)');
    isLockedRef.current = true;
    setRecordingLocked(true);
    setSlideX(0);
    setSlideY(0);
  };

  const uploadVoiceMessage = (uri, durationSeconds) => {
    if (!userId) return;
    if (isBlocked) {
      Alert.alert('Blocked', 'You cannot send messages to a blocked user.');
      return;
    }

    const tempId = `temp-audio-${Date.now()}`;

    // Optimistic bubble — appears instantly for the sender, before the
    // upload even starts (item 20).
    dispatch(
      chatMessageAdd({
        otherUserId: userId,
        message: {
          message_id: tempId,
          conversation_id: conversationId,
          sender_id: myId,
          message_type: 'audio',
          content: uri, // local file — playable by the sender immediately
          duration_seconds: durationSeconds,
          sent_at: new Date().toISOString(),
          is_read: 0,
          delivered: 0,
          uploading: true,
        },
      }),
    );

    dispatch(
      chatFileUploadRequest({
        file: {
          uri,
          fileName: `voice_${Date.now()}.mp4`,
type: 'audio/mp4',
        },
        receiverId: userId,
        message_type: 'audio',
        socket: socketRef.current,
        tempId,
        duration: durationSeconds,
      }),
    );
  };

  // Stops the recorder and either uploads (normal release / lock-send /
  // max-duration reached) or discards (cancelled / too short).
  const finishRecording = async () => {
    if (!isRecordingRef.current) return;
    clearInterval(timerRef.current);

    const finalDuration = recordDurationRef.current;

    try {
      const resultPath = await Sound.stopRecorder();
      console.log('[voice] stopRecorder ->', resultPath);

      if (cancelledRef.current) {
        resetRecordingUI();
        return;
      }

      if (finalDuration < MIN_RECORD_SECONDS) {
        // item 15 — too short, silently discard like WhatsApp's tap-guard.
        console.log('[voice] recording under 1s, discarding');
        resetRecordingUI();
        return;
      }

      const uri = resultPath.startsWith('file://')
        ? resultPath
        : `file://${resultPath}`;

      resetRecordingUI();
      uploadVoiceMessage(uri, finalDuration);
    } catch (e) {
      console.log('[voice] stopRecorder error', e);
      Alert.alert('Recording failed', String(e?.message || e));
      resetRecordingUI();
    }
  };

  const retryVoiceMessage = item => {
    dispatch(chatMessageRemove(userId, item.message_id));
    uploadVoiceMessage(item.content, item.duration_seconds);
  };

  // The PanResponder below is created exactly once (useRef). Its handlers
  // would otherwise permanently close over this render's versions of
  // startRecording/cancelRecording/lockRecording/finishRecording — meaning
  // if userId, isBlocked, or conversationId ever changed while this screen
  // stayed mounted, the gesture would keep using stale values. Routing
  // every call through this ref, updated on every render, keeps it correct
  // regardless of when the PanResponder itself was constructed.
  const latestFns = useRef({});
  latestFns.current = {
    startRecording,
    cancelRecording,
    lockRecording,
    finishRecording,
  };

  // Gesture handling for hold-to-record / slide-to-cancel / slide-up-to-lock.
  // Created once via useRef; all decision logic reads from refs (not state)
  // so it always sees the latest values regardless of render timing.
  const micPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        latestFns.current.startRecording();
      },
      onPanResponderMove: (evt, gesture) => {
        if (!isRecordingRef.current || isLockedRef.current || gestureHandledRef.current) {
          return;
        }
        setSlideX(gesture.dx);
        setSlideY(gesture.dy);

        if (gesture.dx < CANCEL_THRESHOLD) {
          gestureHandledRef.current = true;
          latestFns.current.cancelRecording();
          return;
        }
        if (gesture.dy < LOCK_THRESHOLD) {
          gestureHandledRef.current = true;
          latestFns.current.lockRecording();
        }
      },
      onPanResponderRelease: () => {
        if (!isRecordingRef.current) {
          gestureHandledRef.current = false;
          return;
        }
        if (isLockedRef.current || gestureHandledRef.current) {
          // Locked: stays recording until the user taps send/cancel.
          // Already-cancelled: nothing more to do.
          gestureHandledRef.current = false;
          return;
        }
        latestFns.current.finishRecording();
      },
      onPanResponderTerminate: () => {
        if (isRecordingRef.current && !isLockedRef.current && !gestureHandledRef.current) {
          latestFns.current.cancelRecording();
        }
        gestureHandledRef.current = false;
      },
    }),
  ).current;

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

  const renderContent = (item, isMe) => {
    switch (item.message_type) {
      case 'image':
        return (
          <Image source={{ uri: item.content }} style={styles.imageMessage} />
        );
      case 'video':
        return (
          <Video
            source={{ uri: item.content }}
            style={styles.videoMessage}
            controls
          />
        );
      case 'audio':
        return (
          <AudioMessageBubble
            item={item}
            isMe={isMe}
            chat={chat}
            onRetry={() => retryVoiceMessage(item)}
          />
        );
      case 'file':
        return (
          <TouchableOpacity onPress={() => Linking.openURL(item.content)}>
            <AppText variant="bodySmall" style={styles.mediaLinkText}>
              📎 Open File
            </AppText>
          </TouchableOpacity>
        );
      default:
        return (
          <AppText variant="bodySmall" style={styles.mediaLinkText}>
            {item.content}
          </AppText>
        );
    }
  };

  const renderItem = ({ item }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateWrap}>
          <AppText variant="caption" style={styles.dateText}>
            {item.label}
          </AppText>
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
        <View>{renderContent(item, isMe)}</View>
        <View style={styles.metaRow}>
          {!!time && (
            <AppText
              variant="caption"
              style={[styles.timeText, isMe && styles.myTimeText]}
            >
              {time}
            </AppText>
          )}
          {isMe && (
            item.uploading ? (
              <ActivityIndicator
                size="small"
                color={chat.myTimeText}
                style={styles.tickSpinner}
              />
            ) : item.failed ? (
              <Ionicons
                name="alert-circle"
                size={moderateScale(14)}
                color={chat.blockedBannerText}
              />
            ) : (
              <Ionicons
                name={
                  item.is_read
                    ? 'checkmark-done'
                    : item.delivered
                    ? 'checkmark-done'
                    : 'checkmark'
                }
                size={moderateScale(14)}
                color={
                  item.is_read ? '#34B7F1' : item.delivered ? '#999' : '#ddd'
                }
              />
            )
          )}
        </View>
      </View>
    );
  };

  const avatarUri =
    user?.display_profile_image ||
    user?.avatar ||
    user?.profile_pic ||
    user?.profile_image ||
    user?.image ||
    null;

  const isOnline = Number(onlineStatus.is_online) === 1;

const lastSeenValue =
  onlineStatus.last_seen ||
  user?.last_seen ||
  user?.lastSeen ||
  user?.last_active;

  if (!userId) {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <View style={styles.errorBox}>
          <AppText variant="h4" style={styles.errorText}>
            User data not found
          </AppText>
          <TouchableOpacity
            style={styles.errorBtn}
            onPress={() => navigation.goBack()}
          >
            <AppText variant="button" style={styles.errorBtnText}>
              Go Back
            </AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const micTranslateX = Math.min(0, Math.max(slideX, CANCEL_THRESHOLD * 1.3));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <LinearGradient
          colors={chat.screenGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.flex}
        >
          <HeartsBackground tint={chat.heartTint} />

          <LinearGradient
            colors={chat.headerGradient}
            style={[styles.chatHeader]}
          >
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={moderateScale(26)}
                color={chat.backIconColor}
              />
            </TouchableOpacity>

            <View style={styles.profileBox}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.headerAvatar}
                />
              ) : (
                <View style={styles.headerPlaceholder}>
                  <AppText
                    variant="subtitle"
                    style={styles.headerPlaceholderText}
                  >
                    {user?.name?.[0]?.toUpperCase() || '?'}
                  </AppText>
                </View>
              )}
              <View style={styles.nameBox}>
                <AppText
                  variant="subtitle"
                  style={styles.headerName}
                  numberOfLines={1}
                >
                  {user?.name || 'User'}
                </AppText>
                <AppText
                  variant="caption"
                  style={styles.headerStatus}
                  numberOfLines={1}
                >
                  {isMuted
                    ? '🔕 Muted'
                    : isOnline
                    ? 'Active now'
                    : getLastSeenText(lastSeenValue)}
                </AppText>
              </View>
            </View>

            <View style={styles.callIconsRow}>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => startFriendCall('AUDIO')}
                activeOpacity={0.75}
                disabled={isBlocked}
              >
                <Ionicons
                  name="call-outline"
                  size={moderateScale(28)}
                  color={isBlocked ? '#ccc' : chat.headerAccent}
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
                  size={moderateScale(31)}
                  color={isBlocked ? '#ccc' : chat.headerAccent}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => setMenuVisible(true)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={moderateScale(22)}
                  color={chat.menuDotsColor}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <FlatListMemo
            flatRef={flatRef}
            data={messagesWithDate}
            renderItem={renderItem}
            styles={styles}
          />

          {isBlocked && renderBlockedBanner()}

          {!isBlocked && (
            <View
              style={[
                styles.bottomWrap,
                { paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0 },
              ]}
            >
              {!isRecording && (
                <View style={styles.inputPill}>
                  <TouchableOpacity style={styles.leftIcon} activeOpacity={0.7}>
                    <Ionicons
                      name="happy-outline"
                      size={moderateScale(26)}
                      color={chat.leftIconColor}
                    />
                  </TouchableOpacity>

                  <TextInput
                    placeholder={isListening ? 'Listening...' : 'Type.....'}
                    value={text}
                    onChangeText={setText}
                    style={styles.input}
                    placeholderTextColor={chat.inputPlaceholder}
                    multiline={false}
                    returnKeyType="send"
                    onSubmitEditing={sendMessage}
                  />

                  <TouchableOpacity
                    style={styles.smallIconBtn}
                    onPress={openFileManager}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="attach-outline"
                      size={moderateScale(28)}
                      color={chat.accentIconColor}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.smallIconBtn}
                    onPress={openCamera}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={moderateScale(30)}
                      color={chat.accentIconColor}
                    />
                  </TouchableOpacity>
                </View>
              )}

              {isRecording && !recordingLocked && (
                <View style={styles.recordingBar}>
                  <View style={styles.recDotWrap}>
                    <View style={styles.recDot} />
                    <Text style={styles.recordingText}>
                      {formatDuration(recordDuration)}
                    </Text>
                  </View>
                  <View style={styles.slideHintWrap} pointerEvents="none">
                    <Ionicons name="chevron-back" size={16} color={chat.leftIconColor} />
                    <AppText variant="caption" style={styles.slideHintText}>
                      Slide to cancel
                    </AppText>
                  </View>
                </View>
              )}

              {isRecording && recordingLocked && (
                <View style={styles.lockedBar}>
                  <View style={styles.recDotWrap}>
                    <View style={styles.recDot} />
                    <Text style={styles.recordingText}>
                      {formatDuration(recordDuration)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={cancelRecording} style={styles.lockedCancelBtn}>
                    <Ionicons name="trash-outline" size={22} color={chat.blockedBannerText} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={finishRecording} style={styles.lockedSendBtn}>
                    <Ionicons name="send" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              {!isRecording && text.trim().length > 0 && (
                <TouchableOpacity
                  style={styles.micBtn}
                  onPress={sendMessage}
                  activeOpacity={0.8}
                >
                  <Ionicons name="send" size={moderateScale(27)} color="#fff" />
                </TouchableOpacity>
              )}

              {!recordingLocked && (isRecording || text.trim().length === 0) && (
                // IMPORTANT: this is a single persistent View covering both
                // idle and actively-recording states. It must NEVER unmount
                // between onPanResponderGrant and onPanResponderRelease —
                // doing so breaks the touch responder chain, which is why
                // release (and therefore upload) previously silently failed
                // on a normal hold-and-release.
                <View style={styles.micGestureWrap}>
                  {isRecording && slideY < -20 && (
                    <View style={styles.lockHint}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={16}
                        color={chat.accentIconColor}
                      />
                      <Ionicons
                        name="chevron-up"
                        size={12}
                        color={chat.accentIconColor}
                      />
                    </View>
                  )}
                  <View
                    style={[
                      styles.micBtn,
                      isRecording && styles.micRecording,
                      isRecording && { transform: [{ translateX: micTranslateX }] },
                    ]}
                    {...micPanResponder.panHandlers}
                  >
                    <Ionicons
                      name={isRecording ? 'mic' : 'mic-outline'}
                      size={moderateScale(34)}
                      color="#fff"
                    />
                  </View>
                </View>
              )}
            </View>
          )}
        </LinearGradient>
      </KeyboardAvoidingView>

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

const FlatListMemo = React.memo(({ flatRef, data, renderItem, styles }) => (
  <FlatList
    ref={flatRef}
    data={data}
    keyExtractor={i => (i.type === 'date' ? i.id : String(i.message_id))}
    renderItem={renderItem}
    contentContainerStyle={styles.list}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
    keyboardDismissMode="on-drag"
  />
));

export default ChatScreen;

/* ══════════════════════════════════════════════════════════════════════════
   STYLES — pull colors from the chat palette (theme-aware) instead of
   fixed hex, so the whole screen now flips with light/dark mode.
   ══════════════════════════════════════════════════════════════════════════ */

const createStyles = (theme, width, chat) => {
  const { spacing, radius } = theme;
  const isSmall = width < 360;

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: chat.bottomWrapBg },
    flex: { flex: 1 },

    chatHeader: {
      minHeight: moderateScale(68),
      paddingBottom: spacing.md,
      paddingHorizontal: isSmall ? spacing.sm : spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomLeftRadius: radius.xl,
      borderBottomRightRadius: radius.xl,
      elevation: 4,
    },
    backBtn: {
      width: isSmall ? moderateScale(28) : moderateScale(34),
      height: moderateScale(42),
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    profileBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
      marginRight: spacing.xxs,
    },
    headerAvatar: {
      width: isSmall ? moderateScale(34) : moderateScale(40),
      height: isSmall ? moderateScale(34) : moderateScale(40),
      borderRadius: isSmall ? moderateScale(17) : moderateScale(20),
      marginRight: isSmall ? spacing.xs : spacing.sm,
      borderWidth: 2,
      borderColor: chat.headerBorder,
    },
    headerPlaceholder: {
      width: isSmall ? moderateScale(34) : moderateScale(40),
      height: isSmall ? moderateScale(34) : moderateScale(40),
      borderRadius: isSmall ? moderateScale(17) : moderateScale(20),
      backgroundColor: chat.headerBorder,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isSmall ? spacing.xs : spacing.sm,
    },
    headerPlaceholderText: { color: '#fff', fontWeight: '800' },
    nameBox: { flex: 1, minWidth: 0 },
    headerName: { color: chat.headerNameColor, fontWeight: '800' },
    headerStatus: { color: chat.headerStatusColor, marginTop: spacing.xxs },
    callIconsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: isSmall ? spacing.xxs : spacing.xs,
    },
    headerIconBtn: {
      width: isSmall ? moderateScale(34) : moderateScale(40),
      height: isSmall ? moderateScale(34) : moderateScale(40),
      borderRadius: isSmall ? moderateScale(17) : moderateScale(20),
      justifyContent: 'center',
      alignItems: 'center',
    },

    list: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    dateWrap: { alignItems: 'center', marginVertical: spacing.sm },
    dateText: {
      backgroundColor: chat.dateBg,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      borderRadius: radius.md,
      color: chat.dateText,
    },
    bubble: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      marginVertical: spacing.xs,
      maxWidth: '78%',
    },
    myBubble: {
      alignSelf: 'flex-end',
      backgroundColor: chat.myBubble,
      borderBottomRightRadius: spacing.xs,
    },
    otherBubble: {
      alignSelf: 'flex-start',
      backgroundColor: chat.otherBubble,
      borderBottomLeftRadius: spacing.xs,
    },
    imageMessage: {
      width: moderateScale(200),
      height: moderateScale(200),
      borderRadius: radius.sm,
    },
    videoMessage: { width: moderateScale(220), height: moderateScale(200) },
    mediaLinkText: { color: chat.otherBubbleText },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: spacing.xxs,
    },
    timeText: { color: chat.timeText, marginRight: spacing.xxs },
    myTimeText: { color: chat.myTimeText },
    tickSpinner: { marginLeft: spacing.xxs },

    bottomWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: isSmall ? spacing.xs : spacing.sm,
      paddingTop: spacing.xs,
      backgroundColor: chat.bottomWrapBg,
      minHeight: isSmall ? moderateScale(66) : moderateScale(72),
    },
    inputPill: {
      flex: 1,
      height: isSmall ? moderateScale(50) : moderateScale(56),
      backgroundColor: chat.inputPillBg,
      borderRadius: radius.pill,
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: isSmall ? spacing.sm : spacing.md,
      paddingRight: isSmall ? spacing.xxs : spacing.sm,
      borderWidth: 1,
      borderColor: chat.inputBorder,
      elevation: 2,
    },
    leftIcon: {
      width: moderateScale(30),
      height: moderateScale(40),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.xxs,
    },
    input: {
      flex: 1,
      fontSize: isSmall ? theme.fontSizes.sm : theme.fontSizes.base,
      color: chat.inputText,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.xxs,
    },
    smallIconBtn: {
      width: isSmall ? moderateScale(28) : moderateScale(34),
      height: isSmall ? moderateScale(28) : moderateScale(34),
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: isSmall ? spacing.xxs : spacing.xxs,
    },
    micGestureWrap: {
      marginLeft: isSmall ? spacing.sm : spacing.md,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    micBtn: {
      width: isSmall ? moderateScale(50) : moderateScale(56),
      height: isSmall ? moderateScale(50) : moderateScale(56),
      borderRadius: isSmall ? moderateScale(25) : moderateScale(28),
      backgroundColor: chat.micBg,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
    },
    micRecording: { backgroundColor: '#ff2d55' },
    lockHint: {
      backgroundColor: '#fff',
      borderRadius: 16,
      paddingVertical: 6,
      paddingHorizontal: 6,
      alignItems: 'center',
      marginBottom: 8,
      elevation: 4,
    },

    // Full-width recording bar (replaces the text input while recording).
    recordingBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: isSmall ? moderateScale(50) : moderateScale(56),
      paddingHorizontal: spacing.md,
    },
    recDotWrap: { flexDirection: 'row', alignItems: 'center' },
    recDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#ff2d55',
      marginRight: spacing.xs,
    },
    recordingText: {
      fontSize: 15,
      fontWeight: '600',
      color: chat.inputText,
    },
    slideHintWrap: { flexDirection: 'row', alignItems: 'center' },
    slideHintText: { color: chat.leftIconColor, marginLeft: 2 },

    // Locked-recording bar with explicit cancel/send controls.
    lockedBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: chat.inputPillBg,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: chat.inputBorder,
      height: isSmall ? moderateScale(50) : moderateScale(56),
      paddingHorizontal: spacing.md,
      justifyContent: 'space-between',
    },
    lockedCancelBtn: {
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    lockedSendBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: chat.micBg,
      justifyContent: 'center',
      alignItems: 'center',
    },

    blockedBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: chat.blockedBannerBg,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      gap: spacing.xxs,
    },
    blockedBannerText: {
      color: chat.blockedBannerText,
      fontWeight: '500',
      flex: 1,
    },

    errorBox: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    errorText: { color: chat.errorText, marginBottom: spacing.xl },
    errorBtn: {
      backgroundColor: chat.micBg,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: radius.xl,
    },
    errorBtnText: { color: '#fff' },
  });
};

/* ── MENU MODAL STYLES — themed, standard system sheet ─────────────────────── */

const createMenuStyles = theme => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    menuBackdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    menuCard: {
      backgroundColor: colors.card,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingTop: spacing.xl,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxxl,
    },
    menuTitle: {
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    reportSubTitle: {
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    menuIcon: {
      width: moderateScale(44),
      height: moderateScale(44),
      borderRadius: moderateScale(22),
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuTextBox: { flex: 1 },
    menuSub: { marginTop: spacing.xxs },
    menuDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.divider,
      marginVertical: spacing.xxs,
    },
    menuCancel: {
      marginTop: spacing.lg,
      alignSelf: 'center',
      paddingHorizontal: spacing.xxl,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
    },
    menuBack: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
      gap: spacing.xxs,
    },

    reasonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
      marginBottom: spacing.xs,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: 'transparent',
      gap: spacing.md,
    },
    reasonRowActive: {
      borderColor: colors.secondary,
      backgroundColor: `${colors.secondary}14`,
    },
    radioOuter: {
      width: moderateScale(20),
      height: moderateScale(20),
      borderRadius: moderateScale(10),
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioOuterActive: { borderColor: colors.secondary },
    radioInner: {
      width: moderateScale(10),
      height: moderateScale(10),
      borderRadius: moderateScale(5),
      backgroundColor: colors.secondary,
    },
    reasonLabel: { flex: 1 },

    reportSubmitBtn: {
      marginTop: spacing.xl,
      backgroundColor: colors.secondary,
      paddingVertical: spacing.md,
      borderRadius: radius.xl,
      alignItems: 'center',
    },
    reportSubmitDisabled: { backgroundColor: colors.disabled },

    reportDoneBox: { alignItems: 'center', paddingVertical: spacing.md },
    reportDoneTitle: { marginTop: spacing.md, marginBottom: spacing.sm },
    reportDoneSub: { textAlign: 'center', lineHeight: moderateScale(20) },
  });
};