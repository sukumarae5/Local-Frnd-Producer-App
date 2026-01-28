import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import { otheruserapi } from "../../api/userApi";
import {
  OTHER_USER_FETCH_REQUEST,
  OTHER_USER_FETCH_SUCCESS,
  OTHER_USER_FETCH_FAILURE,
} from "./otherUserType";

function* fetchOtherUser({ payload }) {
  console.log(payload);
  try {
    const response = yield call(axios.get, `${otheruserapi}/${payload}`);
    
    yield put({
      type: OTHER_USER_FETCH_SUCCESS,
      payload: response.data,
    });

    console.log(response);
  } catch (error) {
    yield put({
      type: OTHER_USER_FETCH_FAILURE,
      payload: error.message || error,
    });
  }
}

export default function* otherUserSaga() {
  yield takeLatest(OTHER_USER_FETCH_REQUEST, fetchOtherUser);
}
