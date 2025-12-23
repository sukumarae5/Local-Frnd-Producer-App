import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import { languages as languageApi } from "../../api/userApi";
import {
  LANGUAGE_API_FETCH_REQUEST,
  LANGUAGE_API_FETCH_SUCCESS,
  LANGUAGE_API_FETCH_FAILURE,
} from "./languageType";

/* ===== WORKER SAGA ===== */
function* selectLanguage() {
  try {
    const response = yield call(axios.get, languageApi);

    yield put({
      type: LANGUAGE_API_FETCH_SUCCESS,
      payload: response.data.data,
    });
  } catch (error) {
    yield put({
      type: LANGUAGE_API_FETCH_FAILURE,
      payload: error.message || error,
    });
  }
}

/* ===== WATCHER SAGA ===== */
export default function* languageSaga() {
  yield takeLatest(LANGUAGE_API_FETCH_REQUEST, selectLanguage);
}
