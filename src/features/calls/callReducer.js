import * as T from "./callType";

const initialState = {
  loading: false,
  error: null,

  call: null,
  searchingFemales: [],
};

export default function callReducer(state = initialState, action) {
  console.log("Call Reducer Action:", action);

  switch (action.type) {
    case T.CALL_REQUEST:
    case T.FEMALE_SEARCH_REQUEST:
    case T.FEMALE_CANCEL_REQUEST:
    case T.SEARCHING_FEMALES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case T.CALL_SUCCESS:
    case T.FEMALE_SEARCH_SUCCESS:
      return {
        ...state,
        loading: false,
        call: action.payload,
      };

    case T.FEMALE_CANCEL_SUCCESS:
      return {
        ...state,
        loading: false,
        call: null,
      };

    case T.SEARCHING_FEMALES_SUCCESS:
      return {
        ...state,
        loading: false,
        searchingFemales: action.payload,
      };

    case T.CALL_FAILED:
    case T.FEMALE_SEARCH_FAILED:
    case T.FEMALE_CANCEL_FAILED:
    case T.SEARCHING_FEMALES_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };


    case T.CLEAR_CALL:
      return {
        ...state,
        call: null,
      };
      
    default:
      return state;
  }
}
