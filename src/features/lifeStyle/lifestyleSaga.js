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
  EDIT_USER_LIFESTYLE_REQUEST,
  EDIT_USER_LIFESTYLE_FAILURE,
  EDIT_USER_LIFESTYLE_SUCCESS,
} from "./lifestyleTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  lifestycategory,
  lifeStyleallapi,
  userlifestyleapi
} from "../../api/userApi";
import { USER_DATA_REQUEST } from "../user/userType";

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

function* postUserLifestyleApi(data) {
  const token = yield call(AsyncStorage.getItem, "twittoke");

  return yield call(
    axios.post,
    userlifestyleapi,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
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


function* editUserLifestyleWorker(action) {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const response = yield call(
      axios.put,          // ✅ PUT METHOD
      userlifestyleapi,   // API URL
      action.payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    yield put({
      type: EDIT_USER_LIFESTYLE_SUCCESS,
      payload: response.data,
    });
        yield put({ type: USER_DATA_REQUEST });
    
  } catch (error) {
    yield put({
      type: EDIT_USER_LIFESTYLE_FAILURE,
      payload: error?.response?.data || error.message,
    });
  }
}



/* ================== WATCHER SAGA ================== */
export function* lifestyleSaga() {
  yield takeLatest(FETCH_LIFESTYLE_REQUEST, fetchLifestyle);
  yield takeLatest(FETCH_LIFESTYLE_OPTIONS_REQUEST, fetchLifestyleOptionsWorker);
  yield takeLatest(USER_LIFESTYLE_REQUEST, userLifestyleWorker);
  yield takeLatest(EDIT_USER_LIFESTYLE_REQUEST, editUserLifestyleWorker);

}

export default lifestyleSaga;
