import {
  AUDIO_CALL_REQUEST,
  AUDIO_CALL_SUCCESS,
  AUDIO_CALL_FAILED,
} from "./callType";

export const audioCallRequest = (payload) => ({
  type: AUDIO_CALL_REQUEST,
  payload,
  
  
});

export const audioCallSuccess = (data) => ({
  type: AUDIO_CALL_SUCCESS,
  payload: data,
});

export const audioCallFailed = (error) => ({
  type: AUDIO_CALL_FAILED,
  payload: error,
});
