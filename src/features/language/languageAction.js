import {
  LANGUAGE_API_FETCH_REQUEST,
  LANGUAGE_API_FETCH_SUCCESS,
  LANGUAGE_API_FETCH_FAILURE,
} from "./languageType";

export const languageApiFetchRequest = () => ({
  type: LANGUAGE_API_FETCH_REQUEST,
});

export const languageApiFetchSuccess = (data) => ({
  type: LANGUAGE_API_FETCH_SUCCESS,
  payload: data,
});

export const languageApiFetchFailure = (error) => ({
  type: LANGUAGE_API_FETCH_FAILURE,
  payload: error,
});
