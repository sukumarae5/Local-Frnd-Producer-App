import {
  RANDOM_USER_REQUEST,
  RANDOM_USER_SUCCESS,
  RANDOM_USER_FAILED,
} from "./randomuserType";

const initialState = {
  loading: false,
  data: null,
  error: null,
};

export default function randomUserReducer(state = initialState, action) {
    console.log(action)
  switch (action.type) {
    case RANDOM_USER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case RANDOM_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
      };

    case RANDOM_USER_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
