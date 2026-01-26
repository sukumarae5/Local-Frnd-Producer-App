import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  FRIEND_REQUEST,
  FRIEND_LIST_REQUEST,
  FRIEND_PENDING_REQUEST,
  FRIEND_ACCEPT_REQUEST,
    FRIEND_STATUS_REQUEST,
  FRIEND_UNFRIEND_REQUEST,

} from "./friendType";

import {
  friendSuccess,
  friendFailed,

  friendListSuccess,
  friendListFailed,

  friendPendingSuccess,
  friendPendingFailed,

  friendAcceptSuccess,
  friendAcceptFailed,

  friendStatusSuccess,
  friendStatusFailed,

  friendUnfriendSuccess,
  friendUnfriendFailed,
} from "./friendAction";

import {
  friendrequest,
  friendList,
  friendPending,
  friendAccept,
  friendStatus, friendUnfriend
} from "../../api/userApi";

/* ================= SEND FRIEND REQUEST ================= */
function* sendFriendRequestSaga(action) {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const response = yield call(
      axios.post,
      friendrequest,
      action.payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    yield put(
      friendSuccess({
        to: action.payload.to,
        created: response.data.created,
      })
    );
  } catch (e) {
    yield put(friendFailed(e.message));
  }
}

/* ================= FRIEND LIST ================= */
function* fetchFriendListSaga() {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const response = yield call(
      axios.get,
      friendList,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    yield put(friendListSuccess(response.data));
  } catch (e) {
    yield put(friendListFailed(e.message));
  }
}

function* fetchPendingSaga() {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const response = yield call(
      axios.get,
      friendPending,
      { headers: { Authorization: `Bearer ${token}` } }
    );
console.log("Pending Friends Response:", response);
    yield put(friendPendingSuccess(response.data));
  } catch (e) {
    yield put(friendPendingFailed(e.message));
  }
}

function* acceptFriendSaga(action) {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const response= yield call(
      axios.post,
      friendAccept,
      action.payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
console.log("Accept Friend Response:", response);
    yield put(friendAcceptSuccess(action.payload.request_id));
  } catch (e) {
    yield put(friendAcceptFailed(e.message));
  }
}

function* fetchFriendStatusSaga(action) {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");
    const { other } = action.payload;
    console.log("Saga Other ID:", other);
    const response = yield call(
      axios.get,
      `${friendStatus}/${other}`,   // ID appended here
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("Friend Status Response:", response);
    yield put(friendStatusSuccess(other, response.data));
  } catch (e) {
    yield put(friendStatusFailed(e.message));
  }
}


function* unfriendSaga(action) {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    yield call(
      axios.post,
      friendUnfriend,
      action.payload,    // { other }
      { headers: { Authorization: `Bearer ${token}` } }
    );

    yield put(friendUnfriendSuccess(action.payload.other));
  } catch (e) {
    yield put(friendUnfriendFailed(e.message));
  }
}
/* ================= WATCHERS ================= */
export default function* friendSaga() {
  yield takeLatest(FRIEND_REQUEST, sendFriendRequestSaga);
  yield takeLatest(FRIEND_LIST_REQUEST, fetchFriendListSaga);
  yield takeLatest(FRIEND_PENDING_REQUEST, fetchPendingSaga);
  yield takeLatest(FRIEND_ACCEPT_REQUEST, acceptFriendSaga);
yield takeLatest(FRIEND_STATUS_REQUEST, fetchFriendStatusSaga);
  yield takeLatest(FRIEND_UNFRIEND_REQUEST, unfriendSaga);
}
