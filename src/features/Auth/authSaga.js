import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import {userRegisterSuccess,userRegisterFailed,} from "./authAction";
import { USER_REGISTER_FETCH_REQUEST } from "./authType";
import {userLoginSuccess,userLoginFailed,} from "./authAction";
import { USER_LOGIN_FETCH_REQUEST } from "./authType"; 
import {userOtpSuccess,userOtpFailed,} from "./authAction";
import { USER_OTP_FETCH_REQUEST } from "./authType";   // ✔️ FIXED
import { user_login, user_Otp,user_Register } from "../../api/userApi";

function* handleUserRegister(action) {
  try {
    console.log("🚀 Saga received data:", action.payload);
    console.log("🌐 API URL:", user_Register);
    const response = yield call(() =>
      axios.post(user_Register, action.payload)
    );
    console.log("📥 API Response:", response.data);
    yield put(userRegisterSuccess(response.data));

  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    console.log("❌ API Error:", errorMsg);

    yield put(userRegisterFailed(errorMsg));   // ✔️ FIXED
  }
}

function* handleUserLogin(action) {
  try {
    console.log("🚀 Saga received data:", action.payload);
    console.log("🌐 API URL:", user_login);

    const response = yield call(() =>
      axios.post(user_login, action.payload)
    );
console.log(action.payload)
    console.log("📥 API Response:", response);

    yield put(userLoginSuccess(response.data));

  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    console.log("❌ API Error:", errorMsg);

    yield put(userLoginFailed(errorMsg));   // ✔️ FIXED
  }
}

function* handleUserOtp(action) {
  try {
    console.log("🚀 Saga received data:", action.payload);
    console.log("🌐 API URL:", user_Otp);

    const response = yield call(() =>
      axios.post(user_Otp, action.payload)
    );

    console.log("📥 API Response:", response.data);

    yield put(userOtpSuccess(response.data));

  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    console.log("❌ API Error:", errorMsg);

    yield put(userOtpFailed(errorMsg));   // ✔️ FIXED
  }
}







export default function* userSaga() {
  yield takeLatest(USER_REGISTER_FETCH_REQUEST,handleUserRegister);
  yield takeLatest(USER_LOGIN_FETCH_REQUEST,handleUserLogin)
  yield takeLatest(USER_OTP_FETCH_REQUEST,handleUserOtp);

}
