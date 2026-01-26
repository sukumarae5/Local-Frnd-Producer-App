import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import {
  FETCH_INTERESTS_REQUEST,
  FETCH_INTERESTS_SUCCESS,
  FETCH_INTERESTS_FAILURE,
} from "./interestTypes";
import { yourinterest } from "../../api/userApi";

function* fetchInterests() {
  try {
    const response = yield call(() => axios.get(yourinterest));

    // API returns: { success, message, data: [...] }
    yield put({
      type: FETCH_INTERESTS_SUCCESS,
      payload: response.data.data,
    });

  } catch (error) {
    yield put({
      type: FETCH_INTERESTS_FAILURE,
      payload: error.message || error,
    });
  }
}

export default function* interestSaga() {
  yield takeLatest(FETCH_INTERESTS_REQUEST, fetchInterests);
}
