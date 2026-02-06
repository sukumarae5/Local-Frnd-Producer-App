import React, { createContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSocket, destroySocket } from './globalSocket';
import { useDispatch, useStore } from 'react-redux';

import { friendPendingRequest } from '../features/friend/friendAction';

import {
  chatMessageAdd,
  chatUnreadIncrease,
} from '../features/chat/chatAction';

import { CHAT_MARK_READ_SUCCESS } from '../features/chat/chatType';

export const SocketContext = createContext(null);

const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const store = useStore();
  const socketRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    let socket;

    const init = async () => {
      const token = await AsyncStorage.getItem('twittoke');

      if (!token) {
        destroySocket();
        if (mounted) setConnected(false);
        return;
      }

      socket = createSocket(token);
      socketRef.current = socket;

      socket.on('connect', () => {
        if (mounted) setConnected(true);
      });

      socket.on('disconnect', () => {
        if (mounted) setConnected(false);
      });

      socket.on('friend_request', () => {
        dispatch(friendPendingRequest());
      });

      socket.on('friend_accept', () => {
        dispatch(friendPendingRequest());
      });

      socket.on('chat_receive', msg => {
        const state = store.getState();

        const myId = state.user.userdata?.user?.user_id;

        if (!myId) return;

        const senderId = msg.sender_id ?? msg.senderId;
        const receiverId = msg.receiver_id ?? msg.receiverId;

        if (senderId !== myId && receiverId !== myId) return;

        const otherUserId =
          Number(senderId) === Number(myId) ? receiverId : senderId;

        dispatch(
          chatMessageAdd(otherUserId, {
            ...msg,
            sender_id: senderId,
            receiver_id: receiverId,
          }),
        );

        if (Number(receiverId) !== Number(myId)) return;

        const activeChatUserId = state.chat.activeChatUserId;

        if (Number(activeChatUserId) === Number(senderId)) {
          socket.emit('chat_read', {
            messageId: msg.message_id,
          });

          return;
        }

        dispatch(chatUnreadIncrease(senderId));
      });

      socket.on('chat_read_update', ({ messageId }) => {
        if (!messageId) return;

        dispatch({
          type: CHAT_MARK_READ_SUCCESS,
          payload: { messageId },
        });
      });
    };

    init();

    return () => {
      mounted = false;

      if (socket) {
        socket.off('chat_receive');
        socket.off('chat_read_update');
        socket.disconnect();
      }

      destroySocket();
    };
  }, [dispatch, store]);

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
