

import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  CALL_REQUEST,
  CALL_SUCCESS,
  CALL_FAILED,
   RECENT_CALL_REQUEST,
  RECENT_CALL_SUCCESS,
  RECENT_CALL_FAILED,
} from "./callType";

import { random_calls, recent_calls } from "../../api/userApi";

function* createCallSession(action) {
  try {
    const payload = action.payload;

    console.log("📞 CALL REQUEST PAYLOAD =>", payload);
    // payload = { call_type: "VIDEO", gender: "Male" }

    const token = yield call(AsyncStorage.getItem, "twittoke");

    const response = yield call(
      axios.post,
      random_calls,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("📞 CALL RESPONSE =>", response.data);

    yield put({
      type: CALL_SUCCESS,
      payload: response.data,
    });

  } catch (error) {
    console.error("❌ CALL ERROR =>", error);

    yield put({
      type: CALL_FAILED,
      payload: error.message,
    });
  }
}


function* fetchRecentCalls() {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const response = yield call(
      axios.get,
      recent_calls,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("📞 RECENT CALL USERS =>", response.data);

    yield put({
      type: RECENT_CALL_SUCCESS,
      payload: response.data.data, // <-- important
    });

  } catch (error) {
    console.error("❌ RECENT CALL ERROR =>", error);

    yield put({
      type: RECENT_CALL_FAILED,
      payload: error.message,
    });
  }
}


export default function* callSaga() {
  yield takeLatest(CALL_REQUEST, createCallSession);
 yield takeLatest(RECENT_CALL_REQUEST, fetchRecentCalls);
}
