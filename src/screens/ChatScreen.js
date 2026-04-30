import React, { useEffect, useContext, useRef, useState, useMemo } from 'react';

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
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Voice from '@react-native-voice/voice';
import { launchCamera } from 'react-native-image-picker';
import DocumentPicker from '@react-native-documents/picker';

import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SocketContext } from '../socket/SocketProvider';
import { friendCallRequest } from '../features/calls/callAction';

import {
  chatHistoryRequest,
  chatUnreadClear,
  chatSetActive,
  chatClearActive,
} from '../features/chat/chatAction';

const { width } = Dimensions.get('window');
const isSmall = width < 360;

const createAudioRecorder = () => {
  const Recorder = AudioRecorderPlayer?.default || AudioRecorderPlayer;

  if (Recorder?.startRecorder) return Recorder;

  try {
    return new Recorder();
  } catch (e) {
    try {
      return Recorder();
    } catch (err) {
      console.log('AudioRecorderPlayer init error:', err);
      return null;
    }
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
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);

  if (diff < 60) return 'Last seen just now';
  if (diff < 3600) return `Last seen ${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `Last seen ${Math.floor(diff / 3600)} hr ago`;

  return `Last seen on ${d.toLocaleDateString()}`;
};

const GradientHeart = ({ size, style, opacity = 1 }) => (
  <View pointerEvents="none" style={[{ position: 'absolute', opacity }, style]}>
    <Ionicons name="heart" size={size} color="rgba(152, 50, 248, 0.22)" />
  </View>
);

const HeartsBackground = () => (
  <View pointerEvents="none" style={styles.heartsLayer}>
    <GradientHeart size={100} opacity={0.9} style={{ top: 90, right: -15 }} />
    <GradientHeart size={85} opacity={0.85} style={{ top: 260, left: -25 }} />
    <GradientHeart size={70} opacity={0.9} style={{ top: 380, right: 50 }} />
    <GradientHeart size={45} opacity={0.9} style={{ bottom: 60, left: 90 }} />
    <GradientHeart size={35} opacity={0.9} style={{ top: 200, right: 110 }} />
    <GradientHeart size={60} opacity={0.75} style={{ top: 470, left: 20 }} />
    <GradientHeart size={40} opacity={0.95} style={{ top: 310, right: 85 }} />
    <GradientHeart size={45} opacity={0.9} style={{ bottom: 150, right: 20 }} />
    <GradientHeart size={28} opacity={1} style={{ bottom: 120, left: 50 }} />
  </View>
);

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

  const conversationId = useSelector(s =>
    userId ? s.chat.conversationIds?.[userId] : null,
  );

  const myId = useSelector(s => s.user.userdata?.user?.user_id);

  const messages =
    useSelector(s => (userId ? s.chat.conversations?.[userId] : [])) || [];

  useEffect(() => {
    audioRecorderRef.current = createAudioRecorder();

    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);

    Voice.onSpeechResults = event => {
      const spokenText = event?.value?.[0];
      if (spokenText) {
        setText(spokenText);
      }
      setIsListening(false);
    };

    Voice.onSpeechError = error => {
      console.log('Voice error:', error);
      setIsListening(false);
    };

    return () => {
      audioRecorderRef.current?.stopRecorder?.();
      audioRecorderRef.current?.removeRecordBackListener?.();
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    dispatch(chatSetActive(userId));

    return () => {
      dispatch(chatClearActive());
    };
  }, [dispatch, userId]);

  useEffect(() => {
    if (!userId) return;
    dispatch(chatHistoryRequest(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    if (!conversationId) return;

    socketRef.current?.emit('chat_read_all', {
      conversationId,
    });
  }, [conversationId, socketRef]);

  useEffect(() => {
    if (!userId) return;
    dispatch(chatUnreadClear(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    if (!userId || !myId) return;

    socketRef.current?.emit('chat_open', {
      userId: myId,
      chattingWith: userId,
    });

    return () => {
      socketRef.current?.emit('chat_close', {
        userId: myId,
      });
    };
  }, [myId, userId, socketRef]);

  useEffect(() => {
    flatRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const messagesWithDate = useMemo(() => {
    const map = new Map();

    messages.forEach(item => {
      const msg = item.message ?? item;

      if (msg?.message_id) {
        map.set(String(msg.message_id), msg);
      }
    });

    const sorted = [...map.values()].sort(
      (a, b) => new Date(a.sent_at) - new Date(b.sent_at),
    );

    const out = [];
    let last = null;

    sorted.forEach(msg => {
      const label = getDayLabel(msg.sent_at);

      if (label && label !== last) {
        out.push({
          type: 'date',
          id: 'd-' + label + '-' + msg.message_id,
          label,
        });

        last = label;
      }

      out.push({ type: 'msg', ...msg });
    });

    return out;
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !userId) return;

    socketRef.current?.emit('chat_send', {
      receiverId: userId,
      content: text.trim(),
      message_type: 'text',
    });

    setText('');
  };

  const startVoiceRecognition = async () => {
    try {
      const hasPermission = await requestPermission(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );

      if (!hasPermission) {
        Alert.alert('Permission required', 'Please allow microphone permission.');
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
      console.log('startVoiceRecognition error:', e);
      setIsListening(false);
    }
  };

  const openCamera = async () => {
    try {
      const hasPermission = await requestPermission(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );

      if (!hasPermission) {
        Alert.alert('Permission required', 'Please allow camera permission.');
        return;
      }

      const result = await launchCamera({
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.8,
        saveToPhotos: false,
      });

      if (result?.didCancel) return;

      const asset = result?.assets?.[0];

      if (!asset?.uri || !userId) return;

      socketRef.current?.emit('chat_send', {
        receiverId: userId,
        content: asset.uri,
        message_type: 'image',
        file_name: asset.fileName || 'camera-image.jpg',
        file_type: asset.type || 'image/jpeg',
      });
    } catch (e) {
      console.log('openCamera error:', e);
    }
  };

const openFileManager = async () => {
  try {
    const result = await DocumentPicker.pick({
      allowMultiSelection: false,
    });

    const file = result[0];

    if (!file?.uri || !userId) return;

    socketRef.current?.emit('chat_send', {
      receiverId: userId,
      content: file.uri,
      message_type: 'file',
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
    });
  } catch (err) {
    if (DocumentPicker.isCancel(err)) return;
    console.log('File error:', err);
  }
};

  const startRecording = async () => {
    try {
      if (!audioRecorderRef.current?.startRecorder) {
        console.log('Audio recorder not initialized');
        return;
      }

      setIsRecording(true);
      await audioRecorderRef.current.startRecorder();
    } catch (e) {
      console.log('startRecording error:', e);
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

      socketRef.current?.emit('chat_send', {
        receiverId: userId,
        content: path,
        message_type: 'audio',
      });
    } catch (e) {
      console.log('stopRecording error:', e);
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

    dispatch(
      friendCallRequest({
        friend_id: userId,
        call_type: type,
      }),
    );

    navigation.navigate('CallStatusScreen');
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

    const getMessageLabel = () => {
      if (item.message_type === 'audio') return '🎤 Voice message';
      if (item.message_type === 'image') return '📷 Camera image';
      if (item.message_type === 'file') return `📎 ${item.file_name || 'File'}`;
      return item.content;
    };

    return (
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
        <Text style={[styles.msgText, isMe && styles.myMsgText]}>
          {getMessageLabel()}
        </Text>

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
              color={item.is_read ? '#34B7F1' : item.delivered ? '#999' : '#ddd'}
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

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={styles.container}>
          <HeartsBackground />

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
                <Image source={{ uri: avatarUri }} style={styles.headerAvatar} />
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
                  {Number(user?.is_online) === 1
                    ? 'Active now'
                    : getLastSeenText(lastSeenValue)}
                </Text>
              </View>
            </View>

            <View style={styles.callIconsRow}>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => startFriendCall('AUDIO')}
                activeOpacity={0.75}
              >
                <Ionicons name="call-outline" size={28} color="#C026F8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => startFriendCall('VIDEO')}
                activeOpacity={0.75}
              >
                <Ionicons name="videocam-outline" size={31} color="#C026F8" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

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
            onContentSizeChange={() =>
              flatRef.current?.scrollToEnd({ animated: true })
            }
          />

          <View
            style={[
              styles.bottomWrap,
              { paddingBottom: Platform.OS === 'ios' ? insets.bottom : 4 },
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
                activeOpacity={0.7}
                onPress={openFileManager}
              >
                <Ionicons name="attach-outline" size={28} color="#C026F8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.smallIconBtn}
                activeOpacity={0.7}
                onPress={openCamera}
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FCE6F6',
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fdeefe',
  },
  heartsLayer: {
    ...StyleSheet.absoluteFillObject,
  },
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
  headerPlaceholderText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  nameBox: {
    flex: 1,
    minWidth: 0,
  },
  headerName: {
    fontSize: isSmall ? 14 : 16,
    fontWeight: '800',
    color: '#111',
  },
  headerStatus: {
    fontSize: isSmall ? 10 : 11,
    color: '#6A6A6A',
    marginTop: 2,
  },
  callIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: isSmall ? 8 : 14,
  },
  headerIconBtn: {
    width: isSmall ? 36 : 42,
    height: isSmall ? 36 : 42,
    borderRadius: isSmall ? 18 : 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
  },
  dateWrap: {
    alignItems: 'center',
    marginVertical: 10,
  },
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
  msgText: {
    fontSize: 15,
    color: '#222',
  },
  myMsgText: {
    color: '#fff',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    color: '#777',
    marginRight: 3,
  },
  myTimeText: {
    color: '#eee',
  },
  bottomWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmall ? 8 : 12,
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
  micRecording: {
    backgroundColor: '#ff2d55',
  },
  micListening: {
    backgroundColor: '#22C55E',
  },
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
  errorBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});