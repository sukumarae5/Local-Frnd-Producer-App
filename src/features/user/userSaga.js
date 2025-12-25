import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { 
  userEditSuccess, 
  userEditFailed, 
  userDataSuccess, 
  newUserDataSuccess,
  newUserDataFailed
} from "./userAction";

import { NEW_USER_DATA_REQUEST, USER_DATA_REQUEST, USER_EDIT_REQUEST } from "./userType";
import { user_Edit, USER_DATA, newuserapi } from "../../api/userApi";
import { USER_LOGOUT_REQUEST } from "./userType";
import { cancel, take, race } from "redux-saga/effects";

console.log(USER_DATA)
// ------------------ EDIT USER ------------------
function* handleUserEdit(action) {
  try {
    const token = yield call([AsyncStorage, "getItem"], "twittoke");
    const user_id = yield call([AsyncStorage, "getItem"], "user_id");
console.log(token)
    const response = yield call(() =>
      axios.put(`${user_Edit}/${user_id}`, action.payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );

    yield put(userEditSuccess(response.data));
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(userEditFailed(msg));
  }
}


// ------------------ GET USER DATA ------------------
function* handleUserData() {
  try {
    const token = yield call([AsyncStorage, "getItem"], "twittoke");

    // ⛔ No user_id required because backend doesn't want it

    const response = yield call(() =>
      axios.get(USER_DATA, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );

    yield put(userDataSuccess(response.data)); // store user data
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put( userEditFailed(msg)); // correct error action
  }
}

function* handleNewUserData(action) {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const response = yield call(() =>
      axios.patch(newuserapi, action.payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );

    yield put(newUserDataSuccess(response.data));
  } catch (error) {
    yield put(
      newUserDataFailed(
        error.response?.data?.message || error.message
      )
    );
  }
}

export default function* userSaga() {
  yield takeLatest(USER_EDIT_REQUEST, handleUserEdit);
  yield takeLatest(USER_DATA_REQUEST, handleUserData);
   yield takeLatest(NEW_USER_DATA_REQUEST, handleNewUserData);
}
