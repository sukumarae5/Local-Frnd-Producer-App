import React, { createContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSocket, destroySocket } from './globalSocket';
import { useDispatch, useStore } from 'react-redux';
import { useSelector } from "react-redux";
import {
  incomingCallAccept,
  incomingCallReject,
  incomingCallRinging
} from "../features/calls/callAction";

import { fetchUnreadCount } from '../features/notification/notificationAction';
import {
  chatMessageAdd,
  chatUnreadIncrease,
} from '../features/chat/chatAction';

import { CHAT_MARK_READ_SUCCESS } from '../features/chat/chatType';

export const SocketContext = createContext(null);

const SocketProvider = ({ children }) => {

  const dispatch = useDispatch();
  const store = useStore();
const token = useSelector(state => state.auth?.token);
console.log("SocketProvider token:", token);
  const socketRef = useRef(null);
  const appState = useRef(AppState.currentState);

  const [connected, setConnected] = useState(false);

  useEffect(() => {

    let socket;

    const init = async () => {

      // const token = await AsyncStorage.getItem('twittoke');

       if (!token) {
    console.log("❌ No token, socket not connecting");
    destroySocket();
    setConnected(false);
    return;
  }

       console.log("🔑 SOCKET TOKEN:", token);

  socket = createSocket(token);
  socketRef.current = socket;

  socket.on('connect', () => {
    console.log("✅ SOCKET CONNECTED");
    setConnected(true);
  });

  socket.on('disconnect', () => {
    console.log("❌ SOCKET DISCONNECTED");
    setConnected(false);
  });
      /* NOTIFICATIONS */
      socket.on("new_notification", () => {
        dispatch(fetchUnreadCount());
      });


socket.on('chat_receive', msg => {

  const state = store.getState();
  const myId = state.user.userdata?.user?.user_id;

  if (!myId) return;

  const senderId = msg.sender_id ?? msg.senderId;
  const receiverId = msg.receiver_id ?? msg.receiverId;

  if (senderId !== myId && receiverId !== myId) return;

  const otherUserId =
    Number(senderId) === Number(myId)
      ? receiverId
      : senderId;

const normalizedMsg = {
  ...(msg.message ?? msg),
  is_read: msg.is_read ?? 0,
  delivered: msg.delivered ?? 0, // ✅ ADD THIS
};
  // ✅ STEP 1: ADD MESSAGE TO CHAT
  dispatch(chatMessageAdd({
    otherUserId,
    message: normalizedMsg,
  }));

  const activeUser = state.chat.activeUser;

 if (Number(activeUser) === Number(otherUserId)) {

  // dispatch({
  //   type: CHAT_MARK_READ_SUCCESS,
  //   payload: { messageId: normalizedMsg.message_id },
  // });

  socket.emit('chat_read', {
    messageId: normalizedMsg.message_id,
  });

  return;
}
  // ✅ STEP 3: IF NOT OPEN → INCREASE UNREAD
  if (Number(receiverId) === Number(myId)) {
    dispatch(chatUnreadIncrease(senderId));
  }
});
      /* READ UPDATE */
      socket.on('chat_read_update', ({ messageId }) => {
        dispatch({
          type: CHAT_MARK_READ_SUCCESS,
          payload: { messageId },
        });
      });
socket.on('chat_delivered', ({ messageId }) => {
  dispatch({
    type: "CHAT_MESSAGE_DELIVERED",
    payload: { messageId }
  });
});
     socket.on("incoming_call", (data) => {

  const isFriend = data.call_mode === "FRIEND";

  // ✅ FRIEND → SHOW UI
  if (isFriend) {
    dispatch(incomingCallRinging({
      session_id: data.session_id,
      call_type: data.call_type,
      direction: "INCOMING",
      from_user: data.from,
      is_friend: true,
      status: "RINGING",
      call_mode: "FRIEND",
    }));
    return;
  }

  // RANDOM / DIRECT → AUTO ACCEPT
socket.emit("call_accept", {
  session_id: data.session_id,
});

// 🔥 IMPORTANT: update redux immediately
dispatch(incomingCallAccept({
  session_id: data.session_id,
  call_type: data.call_type,
  status: "ACCEPTED",
  is_friend: false,
  direction: "INCOMING",
  call_mode: data.call_mode || "RANDOM",
}));

});

// socket.on("call_accepted", (data) => {
//   console.log("CALL ACCEPTED EVENT:", data);
//   dispatch(incomingCallAccept(data));
// });

socket.on("call_accepted", (data) => {

  dispatch(incomingCallAccept({
    session_id: data.session_id,
    call_type: data.call_type,
    status: "ACCEPTED",
    is_friend: data.is_friend || false,
  }));

});
socket.on("call_rejected", (data) => {

  console.log("❌ CALL REJECTED:", data);

  dispatch(incomingCallReject({
    ...data,
    status: "REJECTED",
  }));

});
    };

    init();

    return () => {
      if (socket) {
        socket.disconnect();
      }
      destroySocket();
    };

  }, [token]);

  /* APP STATE RECONNECT */

  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {

      if (
        appState.current.match(/inactive|background/) &&
        next === 'active'
      ) {
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