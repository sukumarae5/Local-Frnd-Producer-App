import {
  USER_REGISTER_FETCH_REQUEST,
  USER_REGISTER_FETCH_SUCCESS,
  USER_REGISTER_FETCH_FAILED,
  USER_LOGIN_FETCH_REQUEST,
  USER_LOGIN_FETCH_SUCCESS,
  USER_LOGIN_FETCH_FAILED,
  USER_OTP_FETCH_REQUEST,
  USER_OTP_FETCH_SUCCESS,
  USER_OTP_FETCH_FAILED,
  AUTH_RESET,
  USER_LOGOUT_REQUEST
} from "./authType";

export const userRegisterRequest = (data) => ({
  type: USER_REGISTER_FETCH_REQUEST,
  payload: data,
});
export const userRegisterSuccess = (data) => ({
  type: USER_REGISTER_FETCH_SUCCESS,
  payload: data,
});
export const userRegisterFailed = (error) => ({
  type: USER_REGISTER_FETCH_FAILED,
  payload: error,
});

export const userLoginRequest = (data) => ({
  type: USER_LOGIN_FETCH_REQUEST,
  payload: data,
});
export const userLoginSuccess = (data) => ({
  type: USER_LOGIN_FETCH_SUCCESS,
  payload: data,
});
export const userLoginFailed = (error) => ({
  type: USER_LOGIN_FETCH_FAILED,
  payload: error,
});

export const userOtpRequest = (data) => ({
  type: USER_OTP_FETCH_REQUEST,
  payload: data,
});
export const userOtpSuccess = (data) => ({
  type: USER_OTP_FETCH_SUCCESS,
  payload: data,
});
export const userOtpFailed = (error) => ({
  type: USER_OTP_FETCH_FAILED,
  payload: error,
});

export const authReset = () => ({ type: AUTH_RESET });

export const userlogoutrequest = () => ({
  type: USER_LOGOUT_REQUEST,
});
