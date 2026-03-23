import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { 
  CREATE_STATUS_REQUEST,
  DELETE_STATUS_REQUEST,
  GET_FRIEND_STATUS_REQUEST,
  GET_MY_STATUS_REQUEST,   GET_VIEWERS_REQUEST,   // ✅ added
  VIEW_STATUS_REQUEST
} from "../Status/statusTypes";

import { 
  createStatusSuccess, 
  createStatusFailure,
  getMyStatusSuccess,     // ✅ added
  getMyStatusFailure,      // ✅ added
  getFriendStatusSuccess,
  getFriendStatusFailure,
  deleteStatusSuccess,
  deleteStatusFailure,
  getViewersSuccess,
  getViewersFailure
} from "../Status/statusActions";

import { statusapi, mystatusapi ,friendstatusapi, deletemystatusapi, friendsstatusviewapi, mystatusviewersapi } from "../../api/userApi";

/* ===== CREATE STATUS (UNCHANGED ✅) ===== */

function* createStatusSaga(action) {
  try {

    const token = yield call(AsyncStorage.getItem, "twittoke");
    console.log(token);

    const formData = new FormData();

    formData.append("stories", {
      uri: action.payload.uri,
      name: action.payload.name,
      type: action.payload.type
    });

    console.log("FORM DATA IMAGE:", action.payload);

    const response = yield call(axios.post, statusapi, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });

    console.log(response);

    yield put(createStatusSuccess(response.data));
yield put({type:GET_MY_STATUS_REQUEST})
  } catch (error) {

    console.log("UPLOAD ERROR:", error.response?.data || error.message);

    yield put(createStatusFailure(error.message));

  } 
}

/* ===== GET MY STATUS (NEW ✅) ===== */

function* getMyStatusSaga() {
  try {

    // ✅ same token method (as you wanted)
    const token = yield call(AsyncStorage.getItem, "twittoke");
    console.log("GET TOKEN:", token);

    const response = yield call(axios.get, mystatusapi, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("MY STATUS:", response.data);

    yield put(getMyStatusSuccess(response.data));

  } catch (error) {

    console.log("GET ERROR:", error.response?.data || error.message);

    yield put(getMyStatusFailure(error.message));

  }
}



function* deleteStatusSaga(action) {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    yield call(
      axios.delete,
      `${deletemystatusapi}${action.payload}`, // 👈 id here
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    yield put(deleteStatusSuccess(action.payload));

  } catch (error) {
    console.log("DELETE ERROR:", error.response?.data || error.message);
    yield put(deleteStatusFailure(error.message));
  }
}

function* getFriendStatusSaga() {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const response = yield call(axios.get, friendstatusapi, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("FRIEND STATUS:", response.data);

    yield put(getFriendStatusSuccess(response.data));

  } catch (error) {

    console.log("FRIEND ERROR:", error.response?.data || error.message);

    yield put(getFriendStatusFailure(error.message));
  }
}

function* viewStatusSaga(action) {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    yield call(axios.post, friendsstatusviewapi, action.payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("VIEW SENT:", action.payload);

  } catch (error) {
    console.log("VIEW ERROR:", error.response?.data || error.message);
  }
}


function* getViewersSaga(action) {
  console.log(action.payload)
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const response = yield call(
  axios.get,
  `${mystatusviewersapi}${action.payload}`, // ✅ FIXED
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);
console.log("FINAL URL:", `${mystatusviewersapi}${action.payload}`);
    console.log("VIEWERS:", response.data,);
console.log(mystatusviewersapi)
    yield put(getViewersSuccess(response.data));

  } catch (error) {
    console.log("VIEWERS ERROR:", error.message);
    yield put(getViewersFailure(error.message));
  }
}

/* ===== WATCHER ===== */

export default function* statusSaga() {
  yield takeLatest(CREATE_STATUS_REQUEST, createStatusSaga);
  yield takeLatest(GET_MY_STATUS_REQUEST, getMyStatusSaga); // ✅ added
yield takeLatest(GET_FRIEND_STATUS_REQUEST, getFriendStatusSaga);
yield takeLatest(DELETE_STATUS_REQUEST, deleteStatusSaga);
yield takeLatest(VIEW_STATUS_REQUEST, viewStatusSaga);
yield takeLatest(GET_VIEWERS_REQUEST, getViewersSaga);
}