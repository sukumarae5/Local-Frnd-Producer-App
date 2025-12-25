import {
  AUDIO_CALL_REQUEST,
  AUDIO_CALL_SUCCESS,
  AUDIO_CALL_FAILED,
  AUDIO_CALL_RESET,
} from "./callType";

const initialState = {
  loading: false,
  call: null,     // 👈 MATCHED DATA STORED HERE
  error: null,
};

export default function callReducer(state = initialState, action) {
  switch (action.type) {
    case AUDIO_CALL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        call: null, // reset previous call
      };

    case AUDIO_CALL_SUCCESS:
      return {
        ...state,
        loading: false,
        call: action.payload, // { status, session_id, peer_id }
        error: null,
      };

    case AUDIO_CALL_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
        call: null,
      };

    case AUDIO_CALL_RESET:
      return {
        ...initialState,
      };

    default:
      return state;
  }
}
