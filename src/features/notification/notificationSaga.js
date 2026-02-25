import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as T from "./notificationType";

import {
  notificationsApi,
  notificationUnreadApi,
  notificationMarkReadApi,
} from "../../api/userApi";

/* ================= FETCH NOTIFICATIONS ================= */

function* fetchNotificationsSaga() {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const res = yield call(
      axios.get,
      notificationsApi,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    yield put({
      type: T.NOTIFICATION_FETCH_SUCCESS,
      payload: res.data,
    });

  } catch (e) {
    yield put({
      type: T.NOTIFICATION_FETCH_FAILURE,
      payload: e.response?.data?.error || e.message,
    });
  }
}

/* ================= FETCH UNREAD COUNT ================= */

function* fetchUnreadSaga() {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const res = yield call(
      axios.get,
      notificationUnreadApi,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    yield put({
      type: T.NOTIFICATION_UNREAD_SUCCESS,
      payload: res.data.unread,
    });

  } catch (e) {
    console.log("Unread error:", e.response?.data?.error || e.message);
  }
}

/* ================= MARK AS READ ================= */

function* markReadSaga() {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    yield call(
      axios.post,
      notificationMarkReadApi,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    yield put({
      type: T.NOTIFICATION_UNREAD_SUCCESS,
      payload: 0,
    });

  } catch (e) {
    console.log("Mark read error:", e.response?.data?.error || e.message);
  }
}

/* ================= WATCHER ================= */

export default function* notificationSaga() {
  yield takeLatest(T.NOTIFICATION_FETCH_REQUEST, fetchNotificationsSaga);
  yield takeLatest(T.NOTIFICATION_UNREAD_REQUEST, fetchUnreadSaga);
  yield takeLatest(T.NOTIFICATION_MARK_READ_REQUEST, markReadSaga);
}