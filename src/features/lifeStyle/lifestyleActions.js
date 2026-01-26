import {
  FETCH_LIFESTYLE_REQUEST,
  FETCH_LIFESTYLE_SUCCESS,
  FETCH_LIFESTYLE_FAILURE,
  FETCH_LIFESTYLE_OPTIONS_REQUEST,
  FETCH_LIFESTYLE_OPTIONS_SUCCESS,
  FETCH_LIFESTYLE_OPTIONS_FAILURE,
  USER_LIFESTYLE_REQUEST,
  USER_LIFESTYLE_SUCCESS,
  USER_LIFESTYLE_FAILURE,
} from "./lifestyleTypes";

export const fetchLifestyleRequest = () => ({
  type: FETCH_LIFESTYLE_REQUEST,
});

export const fetchLifestyleSuccess = (data) => ({
  type: FETCH_LIFESTYLE_SUCCESS,
  payload: data,
});

export const fetchLifestyleFailure = (error) => ({
  type: FETCH_LIFESTYLE_FAILURE,
  payload: error,
});

export const fetchLifestyleOptionsRequest = () => ({
  type: FETCH_LIFESTYLE_OPTIONS_REQUEST,
});

export const fetchLifestyleOptionsSuccess = (data) => ({
  type: FETCH_LIFESTYLE_OPTIONS_SUCCESS,
  payload: data,
});

export const fetchLifestyleOptionsFailure = (error) => ({
  type: FETCH_LIFESTYLE_OPTIONS_FAILURE,
  payload: error,
});

export const userLifestyleRequest = (payload) => ({
  type: USER_LIFESTYLE_REQUEST,
  payload,
});

export const userLifestyleSuccess = (data) => ({
  type: USER_LIFESTYLE_SUCCESS,
  payload: data,
});

export const userLifestyleFailure = (error) => ({
  type: USER_LIFESTYLE_FAILURE,
  payload: error,
});