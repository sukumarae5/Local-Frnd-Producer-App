import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  AUDIO_CALL_REQUEST,
  AUDIO_CALL_SUCCESS,
  AUDIO_CALL_FAILED,
} from "./callType";

import { random_calls } from "../../api/userApi"; // <- API URL (change if needed)

// WORKER
function* createAudioCallSession(action) {
  try {
    const { payload } = action;

    // 1️⃣ GET TOKEN
    const token = yield call(AsyncStorage.getItem, "twittoke");
    console.log("AUDIO TOKEN =>", token);

    // 2️⃣ API CALL
    const response = yield call(axios.post,random_calls, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("AUDIO CALL RESPONSE =>", response.data);

    // 3️⃣ SUCCESS DISPATCH
    yield put({
      type: AUDIO_CALL_SUCCESS,
      payload: response.data,
    });

  } catch (error) {
    console.log("AUDIO CALL ERROR =>", error);

    yield put({
      type: AUDIO_CALL_FAILED,
      payload: error.message,
    });
  }
}

// WATCHER
export default function* audioCallSaga() {
  yield takeLatest(AUDIO_CALL_REQUEST, createAudioCallSession);
}
