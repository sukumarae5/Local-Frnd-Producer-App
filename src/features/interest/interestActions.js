import {
  FETCH_INTERESTS_REQUEST,
  FETCH_INTERESTS_SUCCESS,
  FETCH_INTERESTS_FAILURE,
} from "./interestTypes";

export const fetchInterestsRequest = () => ({
  type: FETCH_INTERESTS_REQUEST,
});

export const fetchInterestsSuccess = (data) => ({
  type: FETCH_INTERESTS_SUCCESS,
  payload: data,
});

export const fetchInterestsFailure = (error) => ({
  type: FETCH_INTERESTS_FAILURE,
  payload: error,
});
