// redux/purchase/purchaseActions.js

import {
  CREATE_ORDER_REQUEST,
  CREATE_ORDER_SUCCESS,
  CREATE_ORDER_FAILURE,
  VERIFY_PAYMENT_REQUEST,
  VERIFY_PAYMENT_SUCCESS,
  VERIFY_PAYMENT_FAILURE
} from "./purchaseType";

/* =============================
   CREATE ORDER
============================= */
export const createOrderRequest = (package_id) => ({
  type: CREATE_ORDER_REQUEST,
  payload: { package_id }
});

export const createOrderSuccess = (data) => ({
  type: CREATE_ORDER_SUCCESS,
  payload: data
});

export const createOrderFailure = (error) => ({
  type: CREATE_ORDER_FAILURE,
  payload: error
});

/* =============================
   VERIFY PAYMENT
============================= */
export const verifyPaymentRequest = (data) => ({
  type: VERIFY_PAYMENT_REQUEST,
  payload: data
});

export const verifyPaymentSuccess = (data) => ({
  type: VERIFY_PAYMENT_SUCCESS,
  payload: data
});

export const verifyPaymentFailure = (error) => ({
  type: VERIFY_PAYMENT_FAILURE,
  payload: error
});