import {
  CHAT_HISTORY_REQUEST,
  CHAT_HISTORY_SUCCESS,
  CHAT_HISTORY_FAILED,
  CHAT_MESSAGE_ADD,
  CHAT_MESSAGE_REMOVE,
  CHAT_MESSAGE_UPDATE,
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
  CHAT_UNREAD_INCREASE,
  CHAT_FILE_UPLOAD_REQUEST,
  CHAT_FILE_UPLOAD_SUCCESS,
  CHAT_FILE_UPLOAD_FAILED,
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



export const chatMessageAdd = (payload) => ({
  type: CHAT_MESSAGE_ADD,
  payload,
});

// NEW: remove a message (used to drop an optimistic temp bubble once the
// real message has arrived via socket, or after a discarded retry).
export const chatMessageRemove = (otherUserId, messageId) => ({
  type: CHAT_MESSAGE_REMOVE,
  payload: { otherUserId, messageId },
});

// NEW: patch fields on an existing message in place (used to flip a temp
// voice-note bubble from uploading -> failed without losing its position).
export const chatMessageUpdate = (otherUserId, messageId, changes) => ({
  type: CHAT_MESSAGE_UPDATE,
  payload: { otherUserId, messageId, changes },
});

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

export const chatFileUploadRequest = (fileData) => ({
  type: CHAT_FILE_UPLOAD_REQUEST,
  payload: fileData,
});

// tempId/otherUserId let the reducer resolve exactly which optimistic
// bubble this result belongs to (see chatReducer.js).
export const chatFileUploadSuccess = (tempId, otherUserId) => ({
  type: CHAT_FILE_UPLOAD_SUCCESS,
  payload: { tempId, otherUserId },
});

export const chatFileUploadFailed = (error, tempId, otherUserId) => ({
  type: CHAT_FILE_UPLOAD_FAILED,
  payload: { error, tempId, otherUserId },
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