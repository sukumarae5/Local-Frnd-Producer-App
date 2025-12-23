import {
  LANGUAGE_API_FETCH_REQUEST,
  LANGUAGE_API_FETCH_SUCCESS,
  LANGUAGE_API_FETCH_FAILURE,
} from "./languageType";

const initialState = {
  languagess: [],     // ✅ renamed
  loading: false,
  error: null,
};

export default function languageReducer(state = initialState, action) {
  switch (action.type) {
    case LANGUAGE_API_FETCH_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case LANGUAGE_API_FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        languages: action.payload,
      };

    case LANGUAGE_API_FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
