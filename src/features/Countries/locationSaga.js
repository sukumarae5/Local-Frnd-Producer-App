import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import { Locationapi, statesapi, citiesapi  } from "../../api/userApi";

import {
  FETCH_COUNTRIES_REQUEST,
  FETCH_COUNTRIES_SUCCESS,
  FETCH_COUNTRIES_FAILURE,
  FETCH_STATES_REQUEST,
  FETCH_STATES_SUCCESS,
  FETCH_STATES_FAILURE,
  FETCH_CITIES_REQUEST,
  FETCH_CITIES_SUCCESS,
  FETCH_CITIES_FAILURE,
} from "./locationTypes";

/* ============================================
   WORKER: FETCH COUNTRIES
===============================================*/
function* fetchCountries() {
  try {
    const response = yield call(() => axios.get(Locationapi));

    yield put({
      type: FETCH_COUNTRIES_SUCCESS,
      payload: response.data.data,
    });
  } catch (error) {
    yield put({
      type: FETCH_COUNTRIES_FAILURE,
      payload: error.message || error,
    });
  }
}

/* ============================================
   WORKER: FETCH STATES BY COUNTRY ID
===============================================*/
function* fetchStates(action) {
  try {
    const country_id = action.payload; // number
    console.log("FETCH STATES FOR:", country_id);

    const response = yield call(() =>
      axios.get(`${statesapi}?country_id=${country_id}`)
    );

    console.log("STATES RESPONSE:", response.data);

    yield put({
      type: FETCH_STATES_SUCCESS,
      payload: response.data.data,
    });

  } catch (error) {
    yield put({
      type: FETCH_STATES_FAILURE,
      payload: error.message || error,
    });
  }
}
function* fetchCities(action) {
  try {
    const state_id = action.payload;

    const response = yield call(() =>
      axios.get(`${citiesapi}?state_id=${state_id}`)
    );
console.log(response)
    yield put({
      type: FETCH_CITIES_SUCCESS,
      payload: response.data.data,
    });

  } catch (error) {
    yield put({
      type: FETCH_CITIES_FAILURE,
      payload: error.message || error,
    });
  }
}

/* ============================================
   WATCHER SAGA
===============================================*/
export default function* locationSaga() {
  yield takeLatest(FETCH_COUNTRIES_REQUEST, fetchCountries);
  yield takeLatest(FETCH_STATES_REQUEST, fetchStates);
  yield takeLatest(FETCH_CITIES_REQUEST, fetchCities); 
}
