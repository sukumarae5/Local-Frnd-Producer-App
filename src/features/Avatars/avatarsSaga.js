import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { avatarsapi } from "../../api/userApi";
import {
  USER_AVATAR_API_FETCH_REQUEST,
  USER_AVATAR_API_FETCH_SUCCESS,
  USER_AVATAR_API_FETCH_FAILED,
} from "./avatarsType";
import { useravatarapifetchfailed, useravatarapifetchsuccess } from "./avatarsAction";

/* ================= WORKER SAGA ================= */
function* handleUserAvatar(action) {
console.log(avatarsapi)
  try {
    const gender=action.payload
    console.log(gender)
    const token = yield call(AsyncStorage.getItem, "twittoke");
console.log(token)
    const response = yield call(axios.get, avatarsapi,{
      params: { gender },
    
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
console.log(response)
    yield put(useravatarapifetchsuccess(response.data.avatars))
      
  } catch (error) {
    yield put(useravatarapifetchfailed(error.message)
  )
  }
}

/* ================= WATCHER SAGA ================= */
export default function* avatarSaga() {
  yield takeLatest(USER_AVATAR_API_FETCH_REQUEST, handleUserAvatar);
}
