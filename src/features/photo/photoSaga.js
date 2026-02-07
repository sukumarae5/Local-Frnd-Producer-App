import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";

import {
  userpostphotosuccess,
  userpostphotofailed,
  userdeletephotofailed,
  userdeletephotosuccess,
} from "./photoAction";
import { USER_DELETE_PHOTO_REQUEST, USER_POST_PHOTO_REQUEST } from "./photoType";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_PHOTO_POST_URL } from "../../api/userApi";
import { USER_DATA_REQUEST } from "../user/userType";

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
    yield put({ type: USER_DATA_REQUEST });
    // 🔥 Navigate Home AFTER success
    if (action.callback && typeof action.callback === "function") {
      action.callback();
    }

  } catch (error) {
    console.log("❌ UPLOAD FAILED:", error.response?.data || error);
    yield put(userpostphotofailed(error));
  }
}
function* handleDeletePhoto(action) {
  console.log(action.payload)
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");
    const user_id = yield call(AsyncStorage.getItem, "user_id");
    const { photo_id } = action.payload;

    const deleteURL = `${USER_PHOTO_POST_URL}/${user_id}/${photo_id}`;

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = yield call(
      axios.delete,
      deleteURL,
      config
    );

    console.log("🗑️ PHOTO DELETED:", response.data);

    yield put(userdeletephotosuccess(response.data));
    yield put({ type: USER_DATA_REQUEST });

    // optional callback
    if (action.callback) {
      action.callback();
    }

  } catch (error) {
    console.log("❌ DELETE FAILED:", error.response?.data || error);
    yield put(userdeletephotofailed(error));
  }
}

export default function* photoSaga() {
  yield takeLatest(USER_POST_PHOTO_REQUEST, handleuserphoto);
    yield takeLatest(USER_DELETE_PHOTO_REQUEST, handleDeletePhoto);

}
