
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

const initialState = {
  loading: false,
  list: [],
  call: null,
  error: null,
};

export default function callReducer(state = initialState, action) {
  switch (action.type) {
    case CALL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        call: null,
      };

    case CALL_SUCCESS:
      return {
        ...state,
        loading: false,
        call: action.payload,
        error: null,
      };

    case CALL_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
        call: null,
      };

    case CALL_RESET:
      return initialState;
    
    case RECENT_CALL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case RECENT_CALL_SUCCESS:
      return {
        ...state,
        loading: false,
        list: action.payload,
        error: null,
      };

    case RECENT_CALL_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case RECENT_CALL_RESET:
      return initialState;
      
    default:
      return state;
  }
}
