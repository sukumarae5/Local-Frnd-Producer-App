// socket/SocketProvider.js
// Added: in-app sound on chat_receive (received message, not sent by me)
// No other changes from your existing version.

import React, { createContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
// ❌ remove
// import Sound from 'react-native-sound';

import { createSound } from 'react-native-nitro-sound';
import { createSocket, destroySocket } from './globalSocket';
import { useDispatch, useStore } from 'react-redux';
import { useSelector } from 'react-redux';
import {
  clearCall,
  incomingCallAccept,
  incomingCallReject,
  incomingCallRinging,
} from '../features/calls/callAction';
import { fetchUnreadCount } from '../features/notification/notificationAction';
import { chatMessageAdd } from '../features/chat/chatAction';
import { CHAT_MARK_READ_SUCCESS } from '../features/chat/chatType';
import callManager from '../utils/callManager';

export const SocketContext = createContext(null);

let providerSound = null;

const loadProviderSound = async () => {
  try {
    providerSound = await createSound('message_tone.mp3');
  } catch (e) {
    console.log('Provider sound load error:', e);
  }
};

const playMsgSound = async () => {
  try {
    if (!providerSound) {
      await loadProviderSound();
    }

    await providerSound?.stop();
    await providerSound?.play();
  } catch (e) {
    console.log('Provider sound play error:', e);
  }
};
const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const store = useStore();
  const token = useSelector(state => state.auth?.token);
  const socketRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const [connected, setConnected] = useState(false);
  const rejectedSessionsRef = useRef(new Set());

  useEffect(() => {
    let socket;

    const init = async () => {
      if (!token) {
        destroySocket();
        setConnected(false);
        return;
      }
      await loadProviderSound();
      socket = createSocket(token);
      socketRef.current = socket;

      socket.on('connect', () => {
        setConnected(true);
      });
      socket.on('disconnect', () => {
        setConnected(false);
      });

      /* ── NOTIFICATIONS ── */
      socket.on('new_notification', () => dispatch(fetchUnreadCount()));
      socket.on('new_message_notification', () => dispatch(fetchUnreadCount()));

      /* ── CHAT ── */
      socket.on('chat_receive', msg => {
        const state = store.getState();
        const myId = state.user.userdata?.user?.user_id;
        const senderId = msg.sender_id ?? msg.senderId;
        const receiverId = msg.receiver_id ?? msg.receiverId;
        const otherUserId =
          Number(senderId) === Number(myId) ? receiverId : senderId;

        // Play sound only for incoming messages (not our own sent messages)
        if (Number(senderId) !== Number(myId)) {
          playMsgSound();
        }

        dispatch(
          chatMessageAdd({
            otherUserId,
            message: {
              ...(msg.message ?? msg),
              is_read: msg.is_read ?? 0,
              delivered: msg.delivered ?? 0,
            },
          }),
        );
      });

      socket.on('chat_read_update', ({ messageId }) => {
        dispatch({ type: CHAT_MARK_READ_SUCCESS, payload: { messageId } });
      });
      socket.on('chat_delivered', ({ messageId }) => {
        dispatch({ type: 'CHAT_MESSAGE_DELIVERED', payload: { messageId } });
      });
      socket.on('chat_read_all_update', ({ otherUserId }) => {
        dispatch({ type: 'CHAT_MARK_READ_SUCCESS', payload: { otherUserId } });
      });

      /* ── INCOMING CALL ── */
      socket.on('incoming_call', data => {
        const isFriend = data.call_mode === 'FRIEND';
        if (isFriend) {
          dispatch(
            incomingCallRinging({
              session_id: data.session_id,
              call_type: data.call_type,
              direction: 'INCOMING',
              from_user: data.from,
              is_friend: true,
              status: 'RINGING',
              call_mode: 'FRIEND',
              caller_id: data.caller_id,
              receiver_id: data.receiver_id,
            }),
          );
          return;
        }
        socket.emit('call_accept', { session_id: data.session_id });
        dispatch(
          incomingCallAccept({
            session_id: data.session_id,
            call_type: data.call_type,
            status: 'ACCEPTED',
            is_friend: false,
            direction: 'INCOMING',
            call_mode: data.call_mode || 'RANDOM',
            caller_id: data.caller_id,
            receiver_id: data.receiver_id,
          }),
        );
      });

      socket.on('call_accepted', data => {
        dispatch(
          incomingCallAccept({
            session_id: data.session_id,
            call_type: data.call_type,
            status: 'ACCEPTED',
            is_friend: data.is_friend,
            caller_id: data.caller_id,
            receiver_id: data.receiver_id,
            call_mode: data.is_friend ? 'FRIEND' : 'RANDOM',
          }),
        );
      });

      socket.on('call_rejected', data => {
        if (rejectedSessionsRef.current.has(data.session_id)) return;
        rejectedSessionsRef.current.add(data.session_id);
        setTimeout(
          () => rejectedSessionsRef.current.delete(data.session_id),
          5000,
        );
        dispatch(incomingCallReject({ ...data, status: 'REJECTED' }));
        setTimeout(() => dispatch(clearCall()), 500);
      });

      socket.on('call_ended', () => {
        dispatch(clearCall());
        callManager.reset();
      });
    };

    init();
    return () => {
      if (socket) socket.disconnect();
      destroySocket();
    };
  }, [token]);

  /* ── APP STATE RECONNECT ── */
  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        if (socketRef.current && !socketRef.current.connected) {
          socketRef.current.connect();
        }
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  return (
    <SocketContext.Provider value={{ socketRef, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
