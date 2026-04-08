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
export const searchingFemalesRequest = (filters = {}) => ({
  type: T.SEARCHING_FEMALES_REQUEST,
  payload: filters,
});

export const searchingFemalesSuccess = (data) => ({
  type: T.SEARCHING_FEMALES_SUCCESS,
  payload: data,
});

export const searchingFemalesFailed = (error) => ({
  type: T.SEARCHING_FEMALES_FAILED,
  payload: error,
});

export const callDetailsRequest = () => ({
  type: T.CALL_DETAILS_REQUEST
});

export const callDetailsSuccess = (data) => ({
  type: T.CALL_DETAILS_SUCCESS,
  payload: data
});

export const callDetailsFailed = (error) => ({
  type: T.CALL_DETAILS_FAILED,
  payload: error
});

/* 👨 MALE DIRECT CALL */

export const directCallRequest = (payload) => ({
  type: T.DIRECT_CALL_REQUEST,
  payload, // { female_id, call_type }
});

export const directCallSuccess = (data) => ({
  type: T.DIRECT_CALL_SUCCESS,
  payload: data,
});

export const directCallFailed = (error) => ({
  type: T.DIRECT_CALL_FAILED,
  payload: error,
});

export const clearCall = () => ({
  type: T.CLEAR_CALL,
});


export const friendCallRequest = (payload) => ({
  type: T.FRIEND_CALL_REQUEST,
  payload, // { friend_id, call_type }
});

export const friendCallSuccess = (data) => ({
  type: T.FRIEND_CALL_SUCCESS,
  payload: data,
});

export const friendCallFailed = (error) => ({
  type: T.FRIEND_CALL_FAILED,
  payload: error,
});

export const incomingCallRinging = (payload) => ({
  type: T.INCOMING_CALL_RINGING,
  payload
});

export const incomingCallAccept = (payload) => ({
  type: T.INCOMING_CALL_ACCEPT,
  payload
});

export const incomingCallReject = (payload) => ({
  type: T.INCOMING_CALL_REJECT,
  payload
});


/* 📞 RECENT CALL HISTORY */
export const recentCallRequest = () => ({
  type: T.RECENT_CALL_REQUEST,
});

export const recentCallSuccess = (data) => ({
  type: T.RECENT_CALL_SUCCESS,
  payload: data,
});

export const recentCallFailed = (error) => ({
  type: T.RECENT_CALL_FAILED,
  payload: error,
});

export const cancelWaitingRequest = () => ({
  type: T.CANCEL_WAITING_REQUEST,
});

export const cancelWaitingSuccess = () => ({
  type: T.CANCEL_WAITING_SUCCESS,
});   

export const cancelWaitingFailed = (error) => ({
  type: T.CANCEL_WAITING_FAILED,
  payload: error,
});