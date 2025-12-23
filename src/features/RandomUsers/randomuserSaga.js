import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import {
  RANDOM_USER_REQUEST,
  RANDOM_USER_SUCCESS,
  RANDOM_USER_FAILED,
  
} from "./randomuserType";
import { random_users_data } from "../../api/userApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

function* fetchRandomUser() {
  try {
    // 1️⃣ Get token properly
    const token = yield call(AsyncStorage.getItem, "twittoke");
    console.log("TOKEN FROM STORAGE => ", token);

    // 2️⃣ Make API call with correct header
    const response = yield call(axios.get, random_users_data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("API RESPONSE => ", response.data);

    // 3️⃣ Success dispatch
    yield put({
      type: RANDOM_USER_SUCCESS,
      payload: response.data,
    });

  } catch (error) {
    console.log("API ERROR => ", error);
    yield put({
      type: RANDOM_USER_FAILED,
      payload: error.message,
    });
  }
}

export default function* randomUserSaga() {
  yield takeLatest(RANDOM_USER_REQUEST, fetchRandomUser);
}
