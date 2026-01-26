import {
  FETCH_LIFESTYLE_REQUEST,
  FETCH_LIFESTYLE_SUCCESS,
  FETCH_LIFESTYLE_FAILURE,
   FETCH_LIFESTYLE_OPTIONS_REQUEST,
  FETCH_LIFESTYLE_OPTIONS_SUCCESS,
  FETCH_LIFESTYLE_OPTIONS_FAILURE,
  USER_LIFESTYLE_REQUEST,
  USER_LIFESTYLE_SUCCESS,
  USER_LIFESTYLE_FAILURE,
} from "./lifestyleTypes";

const initialState = {
  loading: false,
  data: [],
    options: [],
response: null,
  error: null,
};

const lifestyleReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LIFESTYLE_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_LIFESTYLE_SUCCESS:
      return { ...state, loading: false, data: action.payload };

    case FETCH_LIFESTYLE_FAILURE:
      return { ...state, loading: false, error: action.payload };

      case FETCH_LIFESTYLE_OPTIONS_REQUEST:
      return { ...state, loading: true };
    case FETCH_LIFESTYLE_OPTIONS_SUCCESS:
      return { ...state, loading: false, options: action.payload };
    case FETCH_LIFESTYLE_OPTIONS_FAILURE:
      return { ...state, loading: false, error: action.payload };
   
       case USER_LIFESTYLE_REQUEST:
      return { ...state, loading: true, error: null };

    case USER_LIFESTYLE_SUCCESS:
      return { ...state, loading: false, response: action.payload };

    case USER_LIFESTYLE_FAILURE:
      return { ...state, loading: false, error: action.payload };

      default:
      return state;
  }
};

export default lifestyleReducer;
