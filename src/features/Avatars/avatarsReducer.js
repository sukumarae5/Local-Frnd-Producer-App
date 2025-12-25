import {
  USER_AVATAR_API_FETCH_REQUEST,
  USER_AVATAR_API_FETCH_SUCCESS,
  USER_AVATAR_API_FETCH_FAILED,
} from "./avatarsType";

const initialState = {
  loading: false,
  avatars: [],
  error: null,
};

export default function avatarsReducer(state = initialState, action) {
 console.log(action.payload)
  switch (action.type) {
    case USER_AVATAR_API_FETCH_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case USER_AVATAR_API_FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        avatars: action.payload,
      };

    case USER_AVATAR_API_FETCH_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
