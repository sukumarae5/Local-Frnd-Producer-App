// redux/purchase/purchaseReducer.js

import {
  CREATE_ORDER_REQUEST,
  CREATE_ORDER_SUCCESS,
  CREATE_ORDER_FAILURE,
  VERIFY_PAYMENT_REQUEST,
  VERIFY_PAYMENT_SUCCESS,
  VERIFY_PAYMENT_FAILURE
} from "./purchaseType";

const initialState = {
  loading: false,
  order: null,
  paymentSuccess: null,
  error: null
};

const purchaseReducer = (state = initialState, action) => {
  console.log("PURCHASE ACTION:", action);

  switch (action.type) {

    /* CREATE ORDER */
    case CREATE_ORDER_REQUEST:
      return { ...state, loading: true };

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

    /* VERIFY PAYMENT */
    case VERIFY_PAYMENT_REQUEST:
      return { ...state, loading: true };

    case VERIFY_PAYMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        paymentSuccess: action.payload
      };

    case VERIFY_PAYMENT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    default:
      return state;
  }
};

export default purchaseReducer;