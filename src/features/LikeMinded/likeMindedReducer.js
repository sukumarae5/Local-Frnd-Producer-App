// src/features/likeMinded/likeMindedReducer.js

import {
  GET_LIKE_MINDED_REQUEST,
  GET_LIKE_MINDED_SUCCESS,
  GET_LIKE_MINDED_FAILURE,
} from "./likeMindedType";

const initialState = {
  loading: false,
  data: [],
  error: null,
};

const likeMindedReducer = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case GET_LIKE_MINDED_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_LIKE_MINDED_SUCCESS:
      return {
        ...state,
        loading: false,
        data: Array.isArray(action.payload)
          ? action.payload
          : [],
        error: null,
      };

    case GET_LIKE_MINDED_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default likeMindedReducer;