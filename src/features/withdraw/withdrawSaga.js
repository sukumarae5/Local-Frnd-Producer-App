import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as types from "./withdrawType";
import {
  createWithdrawSuccess,
  createWithdrawFailure,
  getWithdrawHistorySuccess,
  getWithdrawHistoryFailure
} from "./withdrawAction";

import { USER_DATA_REQUEST } from "../user/userType";
import {
  withdrawCreateApi,
  withdrawHistoryApi
} from "../../api/userApi";

/* =============================
   CREATE WITHDRAW
============================= */
function* createWithdrawSaga(action) {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const response = yield call(
      axios.post,
      withdrawCreateApi,
      action.payload,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    yield put(createWithdrawSuccess());

    /* Refresh wallet + history */
    yield put({ type: USER_DATA_REQUEST });
    yield put({ type: types.GET_WITHDRAW_HISTORY_REQUEST });

  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;

    yield put(createWithdrawFailure(message));
  }
}

/* =============================
   HISTORY
============================= */
function* getWithdrawHistorySaga() {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const res = yield call(
      axios.get,
      withdrawHistoryApi,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    yield put(getWithdrawHistorySuccess(res.data.data));

  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message;

    yield put(getWithdrawHistoryFailure(message));
  }
}

/* WATCHERS */
export function* watchWithdraw() {
  yield takeLatest(types.CREATE_WITHDRAW_REQUEST, createWithdrawSaga);
  yield takeLatest(types.GET_WITHDRAW_HISTORY_REQUEST, getWithdrawHistorySaga);
}