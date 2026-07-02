// src/features/likeMinded/likeMindedSaga.js

import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as T from "./likeMindedType";
import { likeMindedapi } from "../../api/userApi";

/* ================= FETCH LIKE-MINDED USERS ================= */

function* fetchLikeMindedSaga() {
  try {
    const token = yield call(
      AsyncStorage.getItem,
      "twittoke"
    );
console.log(likeMindedapi)
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = yield call(
      axios.get,
      likeMindedapi,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
console.log(response)
    console.log(
      "LIKE-MINDED API RESPONSE:",
      response.data
    );

    yield put({
      type: T.GET_LIKE_MINDED_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    const errorMessage =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Unable to fetch like-minded users";

    console.log(
      "LIKE-MINDED API ERROR:",
      errorMessage
    );

    yield put({
      type: T.GET_LIKE_MINDED_FAILURE,
      payload: errorMessage,
    });
  }
}

/* ================= WATCHER ================= */

export default function* likeMindedSaga() {
  yield takeLatest(
    T.GET_LIKE_MINDED_REQUEST,
    fetchLikeMindedSaga
  );
}