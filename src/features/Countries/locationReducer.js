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

const initialState = {
  loading: false,
  countries: [],
    states: [],
cities: [], 
  error: null,
};

export default function locationReducer(state = initialState, action) {
    console.log(action.payload)
  switch (action.type) {
    case FETCH_COUNTRIES_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_COUNTRIES_SUCCESS:
      return { ...state, loading: false, countries: action.payload };

    case FETCH_COUNTRIES_FAILURE:
      return { ...state, loading: false, error: action.payload };

case FETCH_STATES_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_STATES_SUCCESS:
      return { ...state, loading: false, states: action.payload };

    case FETCH_STATES_FAILURE:
      return { ...state, loading: false, error: action.payload };
      case FETCH_CITIES_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_CITIES_SUCCESS:
      return { ...state, loading: false, cities: action.payload };

    case FETCH_CITIES_FAILURE:
      return { ...state, loading: false, error: action.payload };


    default:
      return state;
  }
}
