import {
  OTHER_USER_FETCH_REQUEST,
  OTHER_USER_FETCH_SUCCESS,
  OTHER_USER_FETCH_FAILURE,
} from "./otherUserType";

export const otherUserFetchRequest = (userId) => ({
  type: OTHER_USER_FETCH_REQUEST,
  payload: userId,
});

export const otherUserFetchSuccess = (data) => ({
  type: OTHER_USER_FETCH_SUCCESS,
  payload: data,
});

export const otherUserFetchFailure = (error) => ({
  type: OTHER_USER_FETCH_FAILURE,
  payload: error,
});
