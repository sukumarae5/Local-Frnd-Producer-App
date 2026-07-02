import {
  RESET_USER_STATE,
  USER_DATA_FAILED,
  USER_DATA_REQUEST,
  USER_DATA_SILENT_REQUEST,
  USER_DATA_SUCCESS,
  USER_EDIT_FAILED,
  USER_EDIT_REQUEST,
  USER_EDIT_SUCCESS,
  USER_LOGOUT_REQUEST,
  NEW_USER_DATA_REQUEST,
  NEW_USER_DATA_SUCCESS,
  NEW_USER_DATA_FAILED,
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAILED,
} from "./userType";

const initialState = {
  loading: false,
  success: null,
  mode: null,
  data: null,
  error: null,
  userdata: null,
  result: null,
  newUserData: null,
  message: null,
  userDataResponse: null,

  // Delete-account state
  deleting: false,
  deleteSuccess: false,
  deleteError: null,
  deleteResponse: null,
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case USER_EDIT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case USER_EDIT_SUCCESS:
      return {
        ...state,
        loading: false,
        success: action.payload?.success,
        mode: action.payload?.mode,
        data: action.payload,
        result: action.payload?.result,
        message: action.payload?.message,
      };

    case USER_EDIT_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };

    case USER_DATA_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        userDataResponse: null,
      };

    case USER_DATA_SILENT_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case USER_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        userdata: action.payload?.data ?? action.payload,
        message: action.payload?.message,
      };

    case USER_DATA_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case NEW_USER_DATA_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        success: null,
        message: null,
        userDataResponse: null,
      };

    case NEW_USER_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null,
        message:
          typeof action.payload?.message === "string"
            ? action.payload.message
            : "Updated successfully",
        userDataResponse: action.payload,
        userdata: {
          ...state.userdata,
          user: {
            ...state.userdata?.user,
            ...action.payload?.data?.user,
          },
        },
      };

    case NEW_USER_DATA_FAILED:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
        message:
          typeof action.payload?.message === "string"
            ? action.payload.message
            : typeof action.payload === "string"
              ? action.payload
              : "Something went wrong",
        userDataResponse: null,
      };

    case DELETE_USER_REQUEST:
      return {
        ...state,
        deleting: true,
        deleteSuccess: false,
        deleteError: null,
        deleteResponse: null,
      };

    case DELETE_USER_SUCCESS:
      return {
        ...state,
        deleting: false,
        deleteSuccess: true,
        deleteError: null,
        deleteResponse: action.payload,
      };

    case DELETE_USER_FAILED:
      return {
        ...state,
        deleting: false,
        deleteSuccess: false,
        deleteError: action.payload,
        deleteResponse: null,
      };

    case USER_LOGOUT_REQUEST:
      return {
        ...initialState,
      };

    case RESET_USER_STATE:
      return {
        ...state,
        success: null,
        error: null,
        message: null,
        userDataResponse: null,
        deleteSuccess: false,
        deleteError: null,
        deleteResponse: null,
      };

    default:
      return state;
  }
}