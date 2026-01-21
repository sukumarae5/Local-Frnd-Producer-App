

import {
  CALL_REQUEST,
  CALL_SUCCESS,
  CALL_FAILED,
  CALL_RESET,
  RECENT_CALL_REQUEST,
  RECENT_CALL_SUCCESS,
  RECENT_CALL_FAILED,
  RECENT_CALL_RESET,
} from "./callType";

export const startCallRequest = (payload) => ({
  type: CALL_REQUEST,
  payload, // { call_type: "AUDIO" | "VIDEO", gender }
});

export const callSuccess = (data) => ({
  type: CALL_SUCCESS,
  payload: data,
});

export const callFailed = (error) => ({
  type: CALL_FAILED,
  payload: error,
});

export const callReset = () => ({
  type: CALL_RESET,
});

export const recentCallRequest = () => ({
  type: RECENT_CALL_REQUEST,
});

export const recentCallSuccess = (data) => ({
  type: RECENT_CALL_SUCCESS,
  payload: data,
});

export const recentCallFailed = (error) => ({
  type: RECENT_CALL_FAILED,
  payload: error,
});

export const recentCallReset = () => ({
  type: RECENT_CALL_RESET,
});