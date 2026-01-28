import {
  OTHER_USER_FETCH_REQUEST,
  OTHER_USER_FETCH_SUCCESS,
  OTHER_USER_FETCH_FAILURE,
} from "./otherUserType";

const initialState = {
  profile: null,
  loading: false,
  error: null,
};

export default function otherUserReducer(state = initialState, action) {
  switch (action.type) {
    case OTHER_USER_FETCH_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case OTHER_USER_FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        profile: action.payload.profile,
      };

    case OTHER_USER_FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
