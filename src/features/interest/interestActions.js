import {
  FETCH_INTERESTS_REQUEST,
  FETCH_INTERESTS_SUCCESS,
  FETCH_INTERESTS_FAILURE,
  SELECT_INTERESTS_FAILURE,
  SELECT_INTERESTS_SUCCESS,
  SELECT_INTERESTS_REQUEST,
  UPDATE_SELECT_INTERESTS_REQUEST,
  UPDATE_SELECT_INTERESTS_SUCCESS,
  UPDATE_SELECT_INTERESTS_FAILURE

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


export const selectInterestsRequest = (data) => ({
  type: SELECT_INTERESTS_REQUEST,
  payload: data,
});


export const selectInterestsSuccess  = (data) => ({
  type: SELECT_INTERESTS_SUCCESS,
  payload: data,
});

export const selectInterestsFailure  = (error) => ({
  type: SELECT_INTERESTS_FAILURE,
  payload: error,
});

export const updateselectinterestsrequest=(data)=>({

  type:UPDATE_SELECT_INTERESTS_REQUEST,
  payload:data
})
export const updateselectinterestssuccess=(data)=>({
  type:UPDATE_SELECT_INTERESTS_SUCCESS,
  payload:data
  
})

export const updateselectinterestsfailure=(error)=>({
  type:UPDATE_SELECT_INTERESTS_SUCCESS,
  payload:error
  
})



