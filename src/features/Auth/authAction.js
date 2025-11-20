import {USER_REGISTER_FETCH_REQUEST,USER_REGISTER_FETCH_SUCCESS,USER_REGISTER_FETCH_FAILED,} from "./authType";
import {USER_OTP_FETCH_REQUEST,USER_OTP_FETCH_SUCCESS,USER_OTP_FETCH_FAILED,} from "./authType";
import {USER_LOGIN_FETCH_REQUEST,USER_LOGIN_FETCH_SUCCESS,USER_LOGIN_FETCH_FAILED,} from "./authType";
// --------------------------USEREGISTER------------------------
export const userRegisterRequest = (data) => {
  console.log("userLoginRequest called with:", data);  // ← LOG HERE
return {
    type: USER_REGISTER_FETCH_REQUEST,
    payload: data,
  };
};
export const userRegisterSuccess = (data) => ({
  type: USER_REGISTER_FETCH_SUCCESS,
  payload: data,
});
export const userRegisterFailed = (error) => ({
  type: USER_REGISTER_FETCH_FAILED,
  payload: error,
});

// --------------------USERLOGIN------------------------
export const userLoginRequest = (data) => {
  console.log("userLoginRequest called with:", data);  
return {
    type: USER_LOGIN_FETCH_REQUEST,
    payload: data,
  };
};
export const userLoginSuccess = (data) => ({
  type: USER_LOGIN_FETCH_SUCCESS,
  payload: data,
});
export const userLoginFailed = (error) => ({
  type: USER_LOGIN_FETCH_FAILED,
  payload: error,
});

// ------------------------USEROTP---------------------


export const userOtpRequest = (data) => {
  console.log("userotpRequest called with:", data); 
  return {
    type: USER_OTP_FETCH_REQUEST,
    payload: data,
  };
};
export const userOtpSuccess = (data) => ({
  type: USER_OTP_FETCH_SUCCESS,
  payload: data,
});
export const userOtpFailed = (error) => ({
  type: USER_OTP_FETCH_FAILED,
  payload: error,
});
