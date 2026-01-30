import * as T from "./callType";

/* 👨 MALE RANDOM CALL */
export const callRequest = (payload) => ({
  type: T.CALL_REQUEST,
  payload, // { call_type }
});

export const callSuccess = (data) => ({
  type: T.CALL_SUCCESS,
  payload: data,
});

export const callFailed = (error) => ({
  type: T.CALL_FAILED,
  payload: error,
});

/* 👩 FEMALE SEARCH */
export const femaleSearchRequest = (payload) => ({
  type: T.FEMALE_SEARCH_REQUEST,
  payload, // { call_type }
});

export const femaleSearchSuccess = (data) => ({
  type: T.FEMALE_SEARCH_SUCCESS,
  payload: data,
});

export const femaleSearchFailed = (error) => ({
  type: T.FEMALE_SEARCH_FAILED,
  payload: error,
});

/* 👩 FEMALE CANCEL SEARCH */
export const femaleCancelRequest = () => ({
  type: T.FEMALE_CANCEL_REQUEST,
});

export const femaleCancelSuccess = () => ({
  type: T.FEMALE_CANCEL_SUCCESS,
});

export const femaleCancelFailed = (error) => ({
  type: T.FEMALE_CANCEL_FAILED,
  payload: error,
});

/* 👨 FETCH SEARCHING FEMALES */
export const searchingFemalesRequest = () => ({
  type: T.SEARCHING_FEMALES_REQUEST,
});

export const searchingFemalesSuccess = (data) => ({
  type: T.SEARCHING_FEMALES_SUCCESS,
  payload: data,
});

export const searchingFemalesFailed = (error) => ({
  type: T.SEARCHING_FEMALES_FAILED,
  payload: error,
});


export const clearCall = () => ({
  type: T.CLEAR_CALL,
});
