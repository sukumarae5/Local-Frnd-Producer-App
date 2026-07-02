import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  userEditSuccess,
  userEditFailed,
  userDataSuccess,
  userDataFailed,
  newUserDataSuccess,
  newUserDataFailed,
  deleteUserSuccess,
  deleteUserFailed,
} from "./userAction";

import {
  USER_EDIT_REQUEST,
  USER_DATA_REQUEST,
  USER_DATA_SILENT_REQUEST,
  NEW_USER_DATA_REQUEST,
  DELETE_USER_REQUEST,
} from "./userType";

import {
  user_Edit,
  USER_DATA,
  newuserapi,
  DELETE_API,
} from "../../api/userApi";

function getErrorPayload(error) {
  return (
    error?.response?.data || {
      message: error?.message || "Something went wrong",
    }
  );
}

function* handleUserEdit(action) {
  try {
    const token = yield call([AsyncStorage, "getItem"], "twittoke");
    const userId = yield call([AsyncStorage, "getItem"], "user_id");

    if (!token) {
      throw new Error("Authentication token not found");
    }

    if (!userId) {
      throw new Error("User ID not found");
    }

    const response = yield call(() =>
      axios.put(`${user_Edit}/${userId}`, action.payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    );

    yield put(userEditSuccess(response.data));
  } catch (error) {
    yield put(userEditFailed(getErrorPayload(error)));
  }
}

function* handleUserData() {
  try {
    const token = yield call([AsyncStorage, "getItem"], "twittoke");

    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = yield call(() =>
      axios.get(USER_DATA, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );

    yield put(userDataSuccess(response.data));
  } catch (error) {
    yield put(userDataFailed(getErrorPayload(error)));
  }
}

function* handleNewUserData(action) {
  try {
    if (!action.payload || typeof action.payload !== "object") {
      throw new Error("Invalid update data");
    }

    const token = yield call([AsyncStorage, "getItem"], "twittoke");

    if (!token) {
      throw new Error("Authentication token not found");
    }

    const cleanPayload = Object.fromEntries(
      Object.entries(action.payload).filter(
        ([, value]) => value !== undefined && value !== null
      )
    );

    if (Object.keys(cleanPayload).length === 0) {
      throw new Error("No data available to update");
    }

    const response = yield call(() =>
      axios.patch(newuserapi, cleanPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    );

    yield put(newUserDataSuccess(response.data));

    yield put({
      type: USER_DATA_SILENT_REQUEST,
    });
  } catch (error) {
    yield put(newUserDataFailed(getErrorPayload(error)));
  }
}

function* handleUserDataSilent() {
  try {
    const token = yield call([AsyncStorage, "getItem"], "twittoke");

    if (!token) {
      return;
    }

    const response = yield call(() =>
      axios.get(USER_DATA, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );

    yield put(userDataSuccess(response.data));
  } catch (error) {
    console.log(
      "Silent user refresh failed:",
      error?.response?.data || error?.message
    );
  }
}

function* handleDeleteUser() {
  try {
    const token = yield call([AsyncStorage, "getItem"], "twittoke");
    const userId = yield call([AsyncStorage, "getItem"], "user_id");

    if (!token) {
      throw new Error("Authentication token not found");
    }

    if (!userId) {
      throw new Error("User ID not found");
    }

    const response = yield call(() =>
      axios.delete(`${DELETE_API}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    );

    yield put(deleteUserSuccess(response.data));
  } catch (error) {
    yield put(deleteUserFailed(getErrorPayload(error)));
  }
}

export default function* userSaga() {
  yield takeLatest(USER_EDIT_REQUEST, handleUserEdit);
  yield takeLatest(USER_DATA_REQUEST, handleUserData);
  yield takeLatest(NEW_USER_DATA_REQUEST, handleNewUserData);
  yield takeLatest(USER_DATA_SILENT_REQUEST, handleUserDataSilent);
  yield takeLatest(DELETE_USER_REQUEST, handleDeleteUser);
}