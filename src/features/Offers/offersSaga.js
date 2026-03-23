import { call, put, takeLatest } from "redux-saga/effects";
import {
  GET_OFFERS_REQUEST,
} from "../Offers/offersTypes";
import {
  getOffersSuccess,
  getOffersFailure,
} from "../Offers/offersActions";

import axios from "axios";
import { offersapi } from "../../api/userApi"; // your api

// API call
const fetchOffersApi = () => axios.get(offersapi);

// Worker Saga
function* fetchOffersSaga() {
  try {
    const response = yield call(fetchOffersApi);
    yield put(getOffersSuccess(response.data));
  } catch (error) {
    yield put(getOffersFailure(error.message));
  }
}

// Watcher Saga
export default function* offersSaga() {
  yield takeLatest(GET_OFFERS_REQUEST, fetchOffersSaga);
}