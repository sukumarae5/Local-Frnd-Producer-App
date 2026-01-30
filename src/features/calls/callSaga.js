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
} from "./callAction";

import {
  random_calls,
  female_search,
  female_cancel,
  searching_females,
} from "../../api/userApi";

/* ================= 👨 MALE RANDOM CALL ================= */
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

/* ================= 👩 FEMALE START SEARCH ================= */
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

/* ================= 👩 FEMALE CANCEL SEARCH ================= */
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

/* ================= 👨 SEARCHING FEMALES LIST ================= */
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

/* ================= WATCHERS ================= */
export default function* callSaga() {
  yield takeLatest(T.CALL_REQUEST, maleCallSaga);
  yield takeLatest(T.FEMALE_SEARCH_REQUEST, femaleSearchSaga);
  yield takeLatest(T.FEMALE_CANCEL_REQUEST, femaleCancelSaga);
  yield takeLatest(T.SEARCHING_FEMALES_REQUEST, searchingFemalesSaga);
}
