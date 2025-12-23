import {
  RANDOM_USER_REQUEST,
  RANDOM_USER_SUCCESS,
  RANDOM_USER_FAILED,
} from "./randomuserType";

export const randomUserRequest = () => ({
  type: RANDOM_USER_REQUEST,
});

export const randomUserSuccess = (data) => ({
  type: RANDOM_USER_SUCCESS,
  payload: data,
});

export const randomUserFailed = (error) => ({
  type: RANDOM_USER_FAILED,
  payload: error,
});
