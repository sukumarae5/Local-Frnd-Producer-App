import * as T from "./callType";

const initialState = {
  loading: false,
  error: null,

  call: null,
  searchingFemales: [],
  connectedCallDetails: null
};

export default function callReducer(state = initialState, action) {
  console.log("Call Reducer Action:", action);

  switch (action.type) {
    case T.CALL_REQUEST:
    case T.FEMALE_SEARCH_REQUEST:
    case T.FEMALE_CANCEL_REQUEST:
    case T.SEARCHING_FEMALES_REQUEST:
      case T.CALL_DETAILS_REQUEST:
        case T.DIRECT_CALL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case T.CALL_SUCCESS:
    case T.FEMALE_SEARCH_SUCCESS:
      case T.DIRECT_CALL_SUCCESS:

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
    case T.CALL_DETAILS_SUCCESS:
     return {
    ...state,
    loading: false,
    connectedCallDetails: action.payload
   };
    case T.CALL_FAILED:
    case T.FEMALE_SEARCH_FAILED:
    case T.FEMALE_CANCEL_FAILED:
    case T.SEARCHING_FEMALES_FAILED:
      case T.CALL_DETAILS_FAILED:
        case T.DIRECT_CALL_FAILED:

      return {
        ...state,
        loading: false,
        error: action.payload,
      };
case T.INCOMING_CALL_CONNECTED:
  return {
    ...state,
    loading: false,
    call: {
      session_id: action.payload.session_id,
      call_type: action.payload.call_type,
      status: "RINGING",
    },
  };


    case T.CLEAR_CALL:
      return {
        ...state,
        call: null,
        connectedCallDetails: null
      };
      
    default:
      return state;
  }
}
