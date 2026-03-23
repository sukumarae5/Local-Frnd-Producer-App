import {
  CREATE_STATUS_REQUEST,
  CREATE_STATUS_SUCCESS,
  CREATE_STATUS_FAILURE,

  GET_MY_STATUS_REQUEST,
  GET_MY_STATUS_SUCCESS,
  GET_MY_STATUS_FAILURE,
  GET_FRIEND_STATUS_REQUEST,
  GET_FRIEND_STATUS_SUCCESS,
  GET_FRIEND_STATUS_FAILURE,
  DELETE_STATUS_SUCCESS,
  DELETE_STATUS_FAILURE,
  DELETE_STATUS_REQUEST,
  VIEW_STATUS_REQUEST,
  GET_VIEWERS_REQUEST,
  GET_VIEWERS_SUCCESS,
  GET_VIEWERS_FAILURE
} from "../Status/statusTypes";

/* ===== CREATE ===== */

export const createStatusRequest = (image) => ({
  type: CREATE_STATUS_REQUEST,
  payload: image
});

export const createStatusSuccess = (data) => ({
  type: CREATE_STATUS_SUCCESS,
  payload: data
});

export const createStatusFailure = (error) => ({
  type: CREATE_STATUS_FAILURE,
  payload: error
});

/* ===== GET MY STATUS ===== */

export const getMyStatusRequest = () => ({
  type: GET_MY_STATUS_REQUEST
});

export const getMyStatusSuccess = (data) => ({
  type: GET_MY_STATUS_SUCCESS,
  payload: data
});

export const getMyStatusFailure = (error) => ({
  type: GET_MY_STATUS_FAILURE,
  payload: error
});

/* ===== delete MY STATUS ===== */

export const deleteStatusRequest = (id) => ({
  type: DELETE_STATUS_REQUEST,
  payload: id
});


export const deleteStatusSuccess = (id) => ({
  type: DELETE_STATUS_SUCCESS,
  payload: id
});

export const deleteStatusFailure = (error) => ({
  type: DELETE_STATUS_FAILURE,
  payload: error
});
/* ===== GET FRIEND STATUS ===== */

export const getFriendStatusRequest = () => ({
  type: GET_FRIEND_STATUS_REQUEST
});

export const getFriendStatusSuccess = (data) => ({
  type: GET_FRIEND_STATUS_SUCCESS,
  payload: data
});

export const getFriendStatusFailure = (error) => ({
  type: GET_FRIEND_STATUS_FAILURE,
  payload: error
});

export const viewStatusRequest = (data) => ({
  type: VIEW_STATUS_REQUEST,
  payload: data
});



export const getViewersRequest = (status_id) => ({
  type: GET_VIEWERS_REQUEST,
  payload: status_id
});

export const getViewersSuccess = (data) => ({
  type: GET_VIEWERS_SUCCESS,
  payload: data
});

export const getViewersFailure = (error) => ({
  type: GET_VIEWERS_FAILURE,
  payload: error
});