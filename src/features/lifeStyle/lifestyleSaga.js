import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import {
  FETCH_LIFESTYLE_REQUEST,
  FETCH_LIFESTYLE_SUCCESS,
  FETCH_LIFESTYLE_FAILURE,
  FETCH_LIFESTYLE_OPTIONS_REQUEST,
  FETCH_LIFESTYLE_OPTIONS_SUCCESS,
  FETCH_LIFESTYLE_OPTIONS_FAILURE,
  USER_LIFESTYLE_REQUEST,
  USER_LIFESTYLE_SUCCESS,
  USER_LIFESTYLE_FAILURE,
} from "./lifestyleTypes";

import {
  lifestycategory,
  lifeStyleallapi,
  userlifestyleapi
} from "../../api/userApi";

/* ================== FETCH CATEGORY ================== */
function* fetchLifestyle() {
  try {
    const response = yield call(axios.get, lifestycategory);

    yield put({
      type: FETCH_LIFESTYLE_SUCCESS,
      payload: response?.data?.data || [],
    });
  } catch (error) {
    yield put({
      type: FETCH_LIFESTYLE_FAILURE,
      payload: error.message || error,
    });
  }
}

/* ================== FETCH OPTIONS ================== */
function* fetchLifestyleOptionsWorker() {
  try {
    const response = yield call(axios.get, lifeStyleallapi);

    yield put({
      type: FETCH_LIFESTYLE_OPTIONS_SUCCESS,
      payload: response?.data?.data || [],
    });
  } catch (error) {
    yield put({
      type: FETCH_LIFESTYLE_OPTIONS_FAILURE,
      payload: error.message || error,
    });
  }
}

/* ================== POST USER LIFESTYLE ================== */
function postUserLifestyleApi(data) {
  return axios.post(userlifestyleapi, data);
}

function* userLifestyleWorker(action) {
  try {
    const response = yield call(postUserLifestyleApi, action.payload);

    yield put({
      type: USER_LIFESTYLE_SUCCESS,
      payload: response.data,
    });

  } catch (error) {
    yield put({
      type: USER_LIFESTYLE_FAILURE,
      payload: error?.response?.data || error.message,
    });
  }
}

/* ================== WATCHER SAGA ================== */
export function* lifestyleSaga() {
  yield takeLatest(FETCH_LIFESTYLE_REQUEST, fetchLifestyle);
  yield takeLatest(FETCH_LIFESTYLE_OPTIONS_REQUEST, fetchLifestyleOptionsWorker);
  yield takeLatest(USER_LIFESTYLE_REQUEST, userLifestyleWorker);
}

export default lifestyleSaga;
