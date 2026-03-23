import {
  CREATE_STATUS_REQUEST,
  CREATE_STATUS_SUCCESS,
  CREATE_STATUS_FAILURE,

  GET_MY_STATUS_REQUEST,
  GET_MY_STATUS_SUCCESS,
  GET_MY_STATUS_FAILURE,

  GET_FRIEND_STATUS_REQUEST,
  GET_FRIEND_STATUS_SUCCESS,
  GET_FRIEND_STATUS_FAILURE,

  DELETE_STATUS_SUCCESS
} from "../Status/statusTypes";

const initialState = {
  loading: false,
  status: null,
  myStatus: [],
  friendStatus: [],
  error: null,
  viewers: [],   // 🔥 ADD THIS

};

export default function statusReducer(state = initialState, action) {
  switch (action.type) {

    /* ===== CREATE STATUS ===== */

    case CREATE_STATUS_REQUEST:
      return {
        ...state,
        loading: true
      };

    case CREATE_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        status: action.payload
      };

    case CREATE_STATUS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    /* ===== GET MY STATUS ===== */

    case GET_MY_STATUS_REQUEST:
      return {
        ...state,
        loading: true
      };

    case GET_MY_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        myStatus: action.payload   // API response
      };

    case GET_MY_STATUS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    /* ===== DELETE MY STATUS ===== */

    case DELETE_STATUS_SUCCESS:
      return {
        ...state,
        myStatus: {
          ...state.myStatus,
          data: (state.myStatus?.data || []).filter(
            (item) => item.status_id !== action.payload
          )
        }
      };

    /* ===== GET FRIEND STATUS ===== */

    case GET_FRIEND_STATUS_REQUEST:
      return {
        ...state,
        loading: true
      };

    case GET_FRIEND_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        friendStatus: action.payload
      };

    case GET_FRIEND_STATUS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
case "GET_VIEWERS_SUCCESS":
  return {
    ...state,
    viewers: action.payload.data
  };
    /* ===== DEFAULT ===== */

    default:
      return state;
  }
}