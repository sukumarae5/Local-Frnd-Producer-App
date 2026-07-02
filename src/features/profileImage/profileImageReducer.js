import {
  PROFILE_IMAGE_UPLOAD_REQUEST,
  PROFILE_IMAGE_UPLOAD_SUCCESS,
  PROFILE_IMAGE_UPLOAD_FAILED,
  PROFILE_IMAGE_DELETE_REQUEST,
  PROFILE_IMAGE_DELETE_SUCCESS,
  PROFILE_IMAGE_DELETE_FAILED,
} from "./profileImageType";

const initialState = {
  loading: false,
  success: false,
  message: null,
  error: null,
};

export default function profileImageReducer(
  state = initialState,
  action
) {
  switch (action.type) {

    case PROFILE_IMAGE_UPLOAD_REQUEST:
    case PROFILE_IMAGE_DELETE_REQUEST:
      return {
        ...state,
        loading: true,
        success: false,
        error: null,
      };

    case PROFILE_IMAGE_UPLOAD_SUCCESS:
    case PROFILE_IMAGE_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        message: action.payload.message,
      };

    case PROFILE_IMAGE_UPLOAD_FAILED:
    case PROFILE_IMAGE_DELETE_FAILED:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };

    default:
      return state;
  }
}