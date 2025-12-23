import {
  AUDIO_CALL_REQUEST,
  AUDIO_CALL_SUCCESS,
  AUDIO_CALL_FAILED,
} from "./callType";

const initialState = {
  loading: false,
  data: null,
  error: null,
};

export default function audioCallReducer(state = initialState, action) {
  console.log(action.payload)
    switch (action.type) {
    case AUDIO_CALL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUDIO_CALL_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
      };

    case AUDIO_CALL_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
