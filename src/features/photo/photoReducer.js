import {
  USER_POST_PHOTO_REQUEST,
  USER_POST_PHOTO_SUCCESS,
  USER_POST_PHOTO_FAILED,
  USER_DELETE_PHOTO_REQUEST,
  USER_DELETE_PHOTO_SUCCESS,
  USER_DELETE_PHOTO_FAILED,
} from "./photoType";

const initialState = {
  loading: false,

  success: false,

  message: "",

  userphoto: null,

  photo_urls: [],

  error: null,
};

export default function photoReducer(
  state = initialState,
  action,
) {
  console.log(action.payload);

  switch (action.type) {
    case USER_POST_PHOTO_REQUEST:
      return {
        ...state,
        loading: true,
        success: false,
        error: null,
      };

    case USER_POST_PHOTO_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        message: action.payload.message,
        userphoto: action.payload,
        photo_urls:
          action.payload.photo_urls || [],
        error: null,
      };

    case USER_POST_PHOTO_FAILED:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };

    case USER_DELETE_PHOTO_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case USER_DELETE_PHOTO_SUCCESS:
      return {
        ...state,
        loading: false,
      };

    case USER_DELETE_PHOTO_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
}