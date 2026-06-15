import * as types from "./withdrawType";

/* CREATE */
export const createWithdrawRequest = (data) => ({
  type: types.CREATE_WITHDRAW_REQUEST,
  payload: data
});

export const createWithdrawSuccess = () => ({
  type: types.CREATE_WITHDRAW_SUCCESS
});

export const createWithdrawFailure = (error) => ({
  type: types.CREATE_WITHDRAW_FAILURE,
  payload: error
});

/* HISTORY */
export const getWithdrawHistoryRequest = () => ({
  type: types.GET_WITHDRAW_HISTORY_REQUEST
});

export const getWithdrawHistorySuccess = (data) => ({
  type: types.GET_WITHDRAW_HISTORY_SUCCESS,
  payload: data
});

export const getWithdrawHistoryFailure = (error) => ({
  type: types.GET_WITHDRAW_HISTORY_FAILURE,
  payload: error
});

/* RESET */
export const resetWithdrawState = () => ({
  type: types.WITHDRAW_RESET
});