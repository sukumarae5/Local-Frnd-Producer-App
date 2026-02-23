import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as T from "./callType";
import {
  callSuccess,
  callFailed,
  femaleSearchSuccess,
  femaleSearchFailed,
  femaleCancelSuccess,
  femaleCancelFailed,
  searchingFemalesSuccess,
  searchingFemalesFailed,
  callDetailsSuccess,
  callDetailsFailed,
  directCallSuccess,
  directCallFailed,
  friendCallSuccess,
  friendCallFailed,
  recentCallSuccess,
  recentCallFailed
} from "./callAction";

import {
  random_calls,
  female_search,
  female_cancel,
  searching_females,
  call_connected_details,
  direct_call,
  friend_connect ,
  recent_calls ,
} from "../../api/userApi";

function* maleCallSaga(action) {
  try {
    console.log("Male Call Saga Payload:", action.payload); 
    const token = yield call(AsyncStorage.getItem, "twittoke");
      const gender = yield call(AsyncStorage.getItem, "gender");
      console.log("gender", gender);

    const res = yield call(
      axios.post,
      random_calls,
      action.payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
console.log("Male Call Response:", res);
    yield put(callSuccess(res.data));
  } catch (e) {
    yield put(callFailed(e.message));
  }
}

function* femaleSearchSaga(action) {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");
console.log("Female Search Saga Payload:", action.payload);
    
const gender = yield call(AsyncStorage.getItem, "gender");
      console.log("gender", gender);
const res = yield call(
      axios.post,
      female_search,
      action.payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
console.log("Female Search Response:", res);
    yield put(femaleSearchSuccess(res.data));
  } catch (e) {
    yield put(femaleSearchFailed(e.message));
  }
}

function* femaleCancelSaga() {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    yield call(
      axios.post,
      female_cancel,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    yield put(femaleCancelSuccess());
  } catch (e) {
    yield put(femaleCancelFailed(e.message));
  }
}

function* searchingFemalesSaga() {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const res = yield call(
      axios.get,
      searching_females,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    yield put(searchingFemalesSuccess(res.data.data));
  } catch (e) {
    yield put(searchingFemalesFailed(e.message));
  }
}

function* callDetailsSaga() {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const res = yield call(
      axios.get,
      call_connected_details,
      { headers: { Authorization: `Bearer ${token}` } }
    );
console.log("Call Details Response:", res);
    yield put(callDetailsSuccess(res.data));

  } catch (e) {
    yield put(callDetailsFailed(e.message));
  }
}

function* directCallSaga(action) {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const res = yield call(
      axios.post,
      direct_call,
      action.payload, // { female_id, call_type }
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Direct Call Response:", res);

    yield put(directCallSuccess(res.data));

  } catch (e) {
    yield put(
      directCallFailed(
        e.response?.data?.error || e.message
      )
    );
  }
}

function* friendCallSaga(action) {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");
console.log(action.payload, "Friend Call Saga Payload:"); 
    const res = yield call(
      axios.post,
      friend_connect,
      action.payload,     
      { headers: { Authorization: `Bearer ${token}` } }
    );
console.log("Friend Call Response:", res);
    yield put(friendCallSuccess(res.data));

  } catch (e) {
    yield put(
      friendCallFailed(
        e.response?.data?.error || e.message
      )
    );
  }
}

function* recentCallSaga() {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const res = yield call(
      axios.get,
      recent_calls,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Recent Calls Response:", res.data);

    yield put(recentCallSuccess(res.data.data));
  } catch (e) {
    yield put(
      recentCallFailed(
        e.response?.data?.error || e.message
      )
    );
  }
}


export default function* callSaga() {
  yield takeLatest(T.CALL_REQUEST, maleCallSaga);
  yield takeLatest(T.FEMALE_SEARCH_REQUEST, femaleSearchSaga);
  yield takeLatest(T.FEMALE_CANCEL_REQUEST, femaleCancelSaga);
  yield takeLatest(T.SEARCHING_FEMALES_REQUEST, searchingFemalesSaga);
  yield takeLatest(T.CALL_DETAILS_REQUEST, callDetailsSaga);
  yield takeLatest(T.DIRECT_CALL_REQUEST, directCallSaga);
  yield takeLatest(T.FRIEND_CALL_REQUEST, friendCallSaga);
  yield takeLatest(T.RECENT_CALL_REQUEST, recentCallSaga);
}
