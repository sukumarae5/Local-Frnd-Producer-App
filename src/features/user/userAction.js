import {
  USER_EDIT_REQUEST,
  USER_EDIT_SUCCESS,
  USER_EDIT_FAILED,
  USER_DATA_REQUEST,
  USER_DATA_SUCCESS,
  USER_DATA_FAILED,
  USER_LOGOUT_REQUEST,
  NEW_USER_DATA_REQUEST,
  NEW_USER_DATA_SUCCESS,
  NEW_USER_DATA_FAILED,
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAILED,
  RESET_USER_STATE,
} from "./userType";

// User edit
export const userEditRequest = (data) => ({
  type: USER_EDIT_REQUEST,
  payload: data,
});

export const userEditSuccess = (data) => ({
  type: USER_EDIT_SUCCESS,
  payload: data,
});

export const userEditFailed = (error) => ({
  type: USER_EDIT_FAILED,
  payload: error,
});

// User data
export const userDatarequest = (data) => ({
  type: USER_DATA_REQUEST,
  payload: data,
});

export const userDataSuccess = (data) => ({
  type: USER_DATA_SUCCESS,
  payload: data,
});

export const userDataFailed = (error) => ({
  type: USER_DATA_FAILED,
  payload: error,
});

// Logout
export const userlogoutrequest = () => ({
  type: USER_LOGOUT_REQUEST,
});

// Patch user data
export const newUserDataRequest = (data) => ({
  type: NEW_USER_DATA_REQUEST,
  payload: data,
});

export const newUserDataSuccess = (data) => ({
  type: NEW_USER_DATA_SUCCESS,
  payload: data,
});

export const newUserDataFailed = (error) => ({
  type: NEW_USER_DATA_FAILED,
  payload: error,
});

// Permanent account deletion
export const deleteUserRequest = () => ({
  type: DELETE_USER_REQUEST,
});

export const deleteUserSuccess = (data) => ({
  type: DELETE_USER_SUCCESS,
  payload: data,
});

export const deleteUserFailed = (error) => ({
  type: DELETE_USER_FAILED,
  payload: error,
});

export const resetUserState = () => ({
  type: RESET_USER_STATE,
});