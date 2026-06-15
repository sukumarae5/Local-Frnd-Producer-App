// redux/purchase/purchaseReducer.js

import {
  CREATE_ORDER_REQUEST,
  CREATE_ORDER_SUCCESS,
  CREATE_ORDER_FAILURE,
  VERIFY_PAYMENT_REQUEST,
  VERIFY_PAYMENT_SUCCESS,
  VERIFY_PAYMENT_FAILURE,
  RESET_PURCHASE
} from "./purchaseType";

const initialState = {
  loading: false,
  order: null,
  paymentSuccess: false,
  error: null
};

const purchaseReducer = (state = initialState, action) => {
  switch (action.type) {

    case CREATE_ORDER_REQUEST:
      return { ...state, loading: true, error: null };

    case CREATE_ORDER_SUCCESS:
      return {
        ...state,
        loading: false,
        order: action.payload
      };

    case CREATE_ORDER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case VERIFY_PAYMENT_REQUEST:
      return { ...state, loading: true };

    case VERIFY_PAYMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        paymentSuccess: true, // ✅ ALWAYS BOOLEAN
        error: null
      };

    case VERIFY_PAYMENT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        paymentSuccess: false
      };

    case RESET_PURCHASE:
      return initialState; // ✅ FULL RESET

    default:
      return state;
  }
};

export default purchaseReducer;