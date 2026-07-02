// src/features/likeMinded/likeMindedAction.js

import {
  GET_LIKE_MINDED_REQUEST,
  GET_LIKE_MINDED_SUCCESS,
  GET_LIKE_MINDED_FAILURE,
} from "./likeMindedType";

export const getLikeMindedRequest = (params = {}) => ({
  type: GET_LIKE_MINDED_REQUEST,
  payload: params,
});

export const getLikeMindedSuccess = (data) => ({
  type: GET_LIKE_MINDED_SUCCESS,
  payload: data,
});

export const getLikeMindedFailure = (error) => ({
  type: GET_LIKE_MINDED_FAILURE,
  payload: error,
});