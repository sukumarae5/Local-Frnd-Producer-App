import {
  FETCH_COUNTRIES_REQUEST,
  FETCH_COUNTRIES_SUCCESS,
  FETCH_COUNTRIES_FAILURE,FETCH_STATES_REQUEST,
  FETCH_STATES_SUCCESS,
  FETCH_STATES_FAILURE,
  FETCH_CITIES_REQUEST,
  FETCH_CITIES_SUCCESS,
  FETCH_CITIES_FAILURE,
} from "./locationTypes";

export const fetchCountriesRequest = () => ({ type: FETCH_COUNTRIES_REQUEST });
export const fetchCountriesSuccess = (countries) => ({ type: FETCH_COUNTRIES_SUCCESS, payload: countries });
export const fetchCountriesFailure = (error) => ({ type: FETCH_COUNTRIES_FAILURE, payload: error });

export const fetchStatesRequest = (countryId) => ({
  type: FETCH_STATES_REQUEST,
  payload: countryId,
});

export const fetchStatesSuccess = (states) => ({
  type: FETCH_STATES_SUCCESS,
  payload: states,
});

export const fetchStatesFailure = (error) => ({
  type: FETCH_STATES_FAILURE,
  payload: error,
});

export const fetchCitiesRequest = (stateId) => ({
  type: FETCH_CITIES_REQUEST,
  payload: stateId,
});

export const fetchCitiesSuccess = (cities) => ({
  type: FETCH_CITIES_SUCCESS,
  payload: cities,
});

export const fetchCitiesFailure = (error) => ({
  type: FETCH_CITIES_FAILURE,
  payload: error,
});