// features/Offers/offersSaga.js

import { call, put, takeLatest } from "redux-saga/effects";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import { GET_OFFERS_REQUEST } from "../Offers/offersTypes";

import {
  getOffersSuccess,
  getOffersFailure,
} from "../Offers/offersActions";

import { offersapi } from "../../api/userApi";

function* fetchOffersSaga() {
  try {
    // Get token
    const token = yield call(
      AsyncStorage.getItem,
      "twittoke"
    );

    // Get logged in user gender
    const gender = yield call(
      AsyncStorage.getItem,
      "gender"
    );

    // Default ALL if gender not available
  const userGender = (gender || "ALL").toUpperCase();

    // API URL
    const url = `${offersapi}?gender=${userGender}`;

    console.log("🎁 Offers API URL:", url);

    const response = yield call(
      axios.get,
      url,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "🎁 OFFERS API RESPONSE:",
      response.data
    );

    const offers = Array.isArray(response.data)
      ? response.data
      : response.data?.data || [];

    yield put(
      getOffersSuccess({
        offers,
      })
    );
  } catch (error) {
    console.log(
      "❌ OFFERS ERROR:",
      error.response?.data || error.message
    );

    yield put(
      getOffersFailure(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch offers"
      )
    );
  }
}

// Watcher Saga
export default function* offersSaga() {
  yield takeLatest(
    GET_OFFERS_REQUEST,
    fetchOffersSaga
  );
}