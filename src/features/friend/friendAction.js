import {
  FRIEND_REQUEST,
  FRIEND_SUCCESS,
  FRIEND_FAILED,
  FRIEND_LIST_REQUEST,
  FRIEND_LIST_SUCCESS,
  FRIEND_LIST_FAILED,
  FRIEND_PENDING_REQUEST,
  FRIEND_PENDING_SUCCESS,
  FRIEND_PENDING_FAILED,

  FRIEND_ACCEPT_REQUEST,
  FRIEND_ACCEPT_SUCCESS,
  FRIEND_ACCEPT_FAILED,
  FRIEND_UNFRIEND_FAILED,
  FRIEND_UNFRIEND_SUCCESS,
  FRIEND_UNFRIEND_REQUEST,
  FRIEND_STATUS_FAILED,
  FRIEND_STATUS_SUCCESS,
  FRIEND_STATUS_REQUEST,

} from "./friendType";

export const friendRequest = (to) => ({
  type: FRIEND_REQUEST,
  payload: { to }, // backend expects { to }
});

export const friendSuccess = (data) => ({
  type: FRIEND_SUCCESS,
  payload: data,
});

export const friendFailed = (error) => ({
  type: FRIEND_FAILED,
  payload: error,
});


export const friendListRequest = () => ({
  type: FRIEND_LIST_REQUEST,
});

export const friendListSuccess = (data) => ({
  type: FRIEND_LIST_SUCCESS,
  payload: data,
});

export const friendListFailed = (error) => ({
  type: FRIEND_LIST_FAILED,
  payload: error,
});


export const friendPendingRequest = () => ({
  type: FRIEND_PENDING_REQUEST,
});

export const friendPendingSuccess = (data) => ({
  type: FRIEND_PENDING_SUCCESS,
  payload: data,
});

export const friendPendingFailed = (error) => ({
  type: FRIEND_PENDING_FAILED,
  payload: error,
});

export const friendAcceptRequest = (request_id) => ({
  type: FRIEND_ACCEPT_REQUEST,
  payload: { request_id },
});

export const friendAcceptSuccess = (request_id) => ({
  type: FRIEND_ACCEPT_SUCCESS,
  payload: request_id,
});

export const friendAcceptFailed = (error) => ({
  type: FRIEND_ACCEPT_FAILED,
  payload: error,
});

export const friendStatusRequest = (other) => ({
  type: FRIEND_STATUS_REQUEST,
  payload: { other },
});

export const friendStatusSuccess = (other, data) => ({
  type: FRIEND_STATUS_SUCCESS,
  payload: { other, data },
});

export const friendStatusFailed = (error) => ({
  type: FRIEND_STATUS_FAILED,
  payload: error,
});


export const friendUnfriendRequest = (other) => ({
  type: FRIEND_UNFRIEND_REQUEST,
  payload: { other },
});

export const friendUnfriendSuccess = (other) => ({
  type: FRIEND_UNFRIEND_SUCCESS,
  payload: other,
});

export const friendUnfriendFailed = (error) => ({
  type: FRIEND_UNFRIEND_FAILED,
  payload: error,
});
