import { call, put, takeLatest } from "redux-saga/effects";
import {
  GET_OFFERS_REQUEST,
} from "../Offers/offersTypes";
import {
  getOffersSuccess,
  getOffersFailure,
} from "../Offers/offersActions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { offersapi } from "../../api/userApi"; // your api

function* fetchOffersSaga() {
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const response = yield call(axios.get, offersapi, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("🎁 OFFERS API RESPONSE:", response.data);

    // ✅ FIX: your API already returns array
    const offers = Array.isArray(response.data)
      ? response.data
      : response.data?.data || [];

    yield put(
      getOffersSuccess({
        offers,
      })
    );

  } catch (error) {
    yield put(
      getOffersFailure(
        error.response?.data?.message || error.message
      )
    );
  }
}
// Watcher Saga
export default function* offersSaga() {
  yield takeLatest(GET_OFFERS_REQUEST, fetchOffersSaga);
}