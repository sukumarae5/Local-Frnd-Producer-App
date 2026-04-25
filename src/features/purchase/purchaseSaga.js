// redux/purchase/purchaseSaga.js

import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  CREATE_ORDER_REQUEST,
  VERIFY_PAYMENT_REQUEST
} from "./purchaseType";

import {
  createOrderSuccess,
  createOrderFailure,
  verifyPaymentSuccess,
  verifyPaymentFailure
} from "./purchaseActions";

import { purchaseApi } from "../../api/userApi";

/* =============================
   CREATE ORDER API
============================= */
function* createOrderSaga(action) {
  try {
    // ✅ get token dynamically
    const token = yield call(AsyncStorage.getItem, "twittoke");

    console.log("🟢 TOKEN:", token);

    const response = yield call(
      axios.post,
      `${purchaseApi}/create-order`,
      action.payload,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log("ORDER API:", response.data);

    yield put(createOrderSuccess(response.data.data));

  } catch (error) {
    console.log("ORDER ERROR:", error.response?.data || error.message);
    yield put(createOrderFailure(error.message));
  }
}

/* =============================
   VERIFY PAYMENT API
============================= */
function* verifyPaymentSaga(action) {
  try {
    // ✅ get token dynamically
    const token = yield call(AsyncStorage.getItem, "twittoke");

    console.log("🟢 TOKEN:", token);

    const response = yield call(
      axios.post,
      `${purchaseApi}/verify`,
      action.payload,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log("VERIFY API:", response.data);

    yield put(verifyPaymentSuccess(response.data.data));

  } catch (error) {
    console.log("VERIFY ERROR:", error.response?.data || error.message);
    yield put(verifyPaymentFailure(error.message));
  }
}

/* =============================
   WATCHERS
============================= */
export function* watchPurchase() {
  yield takeLatest(CREATE_ORDER_REQUEST, createOrderSaga);
  yield takeLatest(VERIFY_PAYMENT_REQUEST, verifyPaymentSaga);
}

export default watchPurchase;