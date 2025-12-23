import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";

import {
  userpostphotosuccess,
  userpostphotofailed,
} from "./photoAction";
import { USER_POST_PHOTO_REQUEST } from "./photoType";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_PHOTO_POST_URL } from "../../api/userApi";

function* handleuserphoto(action) {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");
    const user_id = yield call(AsyncStorage.getItem, "user_id");

    const uploadURL = `${USER_PHOTO_POST_URL}/${user_id}`;

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    const response = yield call(
      axios.post,
      uploadURL,
      action.payload, // FormData
      config
    );

    console.log("✔️ FILE + FIELDS UPLOADED:", response.data);

    yield put(userpostphotosuccess(response.data));

    // 🔥 Navigate Home AFTER success
    if (action.callback && typeof action.callback === "function") {
      action.callback();
    }

  } catch (error) {
    console.log("❌ UPLOAD FAILED:", error.response?.data || error);
    yield put(userpostphotofailed(error));
  }
}

export default function* photoSaga() {
  yield takeLatest(USER_POST_PHOTO_REQUEST, handleuserphoto);
}
