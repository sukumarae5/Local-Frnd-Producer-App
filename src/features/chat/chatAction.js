import {
  CHAT_HISTORY_REQUEST,
  CHAT_HISTORY_SUCCESS,
  CHAT_HISTORY_FAILED,
  CHAT_MESSAGE_ADD,
  CHAT_LIST_REQUEST,
  CHAT_LIST_SUCCESS,
  CHAT_LIST_FAILED,
    CHAT_UNREAD_CLEAR,
CHAT_MARK_READ_REQUEST,
  CHAT_MARK_READ_SUCCESS,
  CHAT_MARK_READ_FAILED,
  CHAT_CLEAR,
  CHAT_SET_ACTIVE,
  CHAT_CLEAR_ACTIVE,
  CHAT_UNREAD_INCREASE ,
} from "./chatType";

export const chatHistoryRequest = (otherUserId) => ({
  type: CHAT_HISTORY_REQUEST,
  payload: { otherUserId },
});

export const chatHistorySuccess = (otherUserId, messages, conversationId) => ({
  type: CHAT_HISTORY_SUCCESS,
  payload: { otherUserId, messages, conversationId },
});


export const chatHistoryFailed = (error) => ({
  type: CHAT_HISTORY_FAILED,
  payload: error,
});

// export const chatMessageAdd = (message) => ({
//   type: CHAT_MESSAGE_ADD,
//   payload: message,
// });


export const chatListRequest = () => ({
  type: CHAT_LIST_REQUEST,
});

export const chatListSuccess = (data) => ({
  type: CHAT_LIST_SUCCESS,
  payload: data,
});

export const chatListFailed = (error) => ({
  type: CHAT_LIST_FAILED,
  payload: error,
});

export const chatMessageAdd = (otherUserId, message) => ({
  type: CHAT_MESSAGE_ADD,
  payload: { otherUserId, message },
});



export const chatMarkReadRequest = (otherUserId, conversationId) => ({
  type: CHAT_MARK_READ_REQUEST,
  payload: { otherUserId, conversationId },
});

export const chatMarkReadSuccess = (otherUserId) => ({
  type: CHAT_MARK_READ_SUCCESS,
  payload: {otherUserId},
});

export const chatMarkReadFailed = (error) => ({
  type: CHAT_MARK_READ_FAILED,
  payload: error,
});


export const chatClear = () => ({
  type: CHAT_CLEAR,
});

export const chatUnreadClear = (otherUserId) => ({
  type: CHAT_UNREAD_CLEAR,
  payload: otherUserId,
});

export const chatSetActive = (otherUserId) => ({
  type: CHAT_SET_ACTIVE,
  payload: otherUserId
});

export const chatClearActive = () => ({
  type: CHAT_CLEAR_ACTIVE
});

export const chatUnreadIncrease = (otherUserId) => ({
  type: CHAT_UNREAD_INCREASE,
  payload: otherUserId,
});

export const chatMessageReadBySocket = (messageId) => ({
  type: CHAT_MARK_READ_SUCCESS,
  payload: { messageId }
});
