import * as T from './callType';

const initialState = {
  loading: false,
  error: null,
incomingCall: null,
  call: null,
  searchingFemales: [],
  connectedCallDetails: null,
  recentCalls: [],
};

export default function callReducer(state = initialState, action) {
  console.log('Call Reducer Action:', action);

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
    call: {
      ...action.payload,
      is_friend: false, // ✅ IMPORTANT
    },
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
        connectedCallDetails: action.payload,
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
          status: 'RINGING',
        },
      };
    case T.FRIEND_CALL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case T.FRIEND_CALL_SUCCESS:
      return {
        ...state,
        loading: false,
        call: {
          ...action.payload,
          direction: 'OUTGOING',
        },
      };

    case T.FRIEND_CALL_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case T.CLEAR_CALL:
      return {
        ...state,
        call: null,
        connectedCallDetails: null,
      };

    case T.INCOMING_CALL_RINGING:
      return {
        ...state,
        incomingCall: action.payload,
        call: {
          ...action.payload,
          status: 'RINGING',
          direction: 'INCOMING',
          call_mode: action.payload.call_mode,
        },
      };

 case T.INCOMING_CALL_ACCEPT:
  return {
    ...state,
    call: {
      session_id: action.payload.session_id,
      call_type: action.payload.call_type,
      status: "ACCEPTED",
      is_friend: action.payload.is_friend || false,
      direction: action.payload.direction || "INCOMING",
      call_mode: action.payload.call_mode || (action.payload.is_friend ? "FRIEND" : "RANDOM"),
    },
    incomingCall: null,
  };

    case T.INCOMING_CALL_REJECT:
      return {
        ...state,
        call: null,
        connectedCallDetails: null,
      };

    case T.RECENT_CALL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case T.RECENT_CALL_SUCCESS:
      return {
        ...state,
        loading: false,
        recentCalls: action.payload,
      };

    case T.RECENT_CALL_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
