import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import { GET_COINS_REQUEST } from "./coinTypes";
import { getCoinsSuccess, getCoinsFailure } from "./coinActions";

import { coinsapi } from "../../api/userApi";

function* getCoinsSaga() {
  try {
    const response = yield call(axios.get, coinsapi);

    console.log("COINS API:", response.data);

    // 🔥 IMPORTANT (same like viewers fix)
    yield put(getCoinsSuccess(response.data));

  } catch (error) {
    console.log("COINS ERROR:", error.message);
    yield put(getCoinsFailure(error.message));
  }
}

export function* watchCoins() {
  yield takeLatest(GET_COINS_REQUEST, getCoinsSaga);
}
export default watchCoins