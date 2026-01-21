import {
  FRIEND_REQUEST,
  FRIEND_SUCCESS,
  FRIEND_FAILED,
  FRIEND_LIST_REQUEST,
  FRIEND_LIST_SUCCESS,
  FRIEND_LIST_FAILED,
   FRIEND_PENDING_REQUEST,
  FRIEND_PENDING_SUCCESS,
  FRIEND_PENDING_FAILED,
  FRIEND_ACCEPT_REQUEST,
  FRIEND_ACCEPT_SUCCESS,
  FRIEND_ACCEPT_FAILED,
  FRIEND_STATUS_REQUEST,
  FRIEND_STATUS_SUCCESS,
  FRIEND_STATUS_FAILED,
  FRIEND_UNFRIEND_REQUEST,
  FRIEND_UNFRIEND_SUCCESS,
  FRIEND_UNFRIEND_FAILED,
} from "./friendType";

const initialState = {
  loading: false,
  error: null,
  pending: [], 
  friends: [],
  incoming: [],
  friendStatus: {},
};

export default function friendReducer(state = initialState, action) {
 console.log("Friend Reducer Action:", action.payload);
  switch (action.type) {
    case FRIEND_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FRIEND_SUCCESS:
      return {
        ...state,
        loading: false,
        pending: [...state.pending, action.payload.to],
      };

    case FRIEND_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
      case FRIEND_LIST_REQUEST:
  return {
    ...state,
    loading: true,
  };

case FRIEND_LIST_SUCCESS:
  return {
    ...state,
    loading: false,
    friends: action.payload.map((u) => u.user_id),
  };

case FRIEND_LIST_FAILED:
  return {
    ...state,
    loading: false,
    error: action.payload,
  };
case FRIEND_PENDING_REQUEST:
      return { ...state, loading: true };

    case FRIEND_PENDING_SUCCESS:
      return {
        ...state,
        loading: false,
        incoming: action.payload,
      };

    case FRIEND_PENDING_FAILED:
      return { ...state, loading: false, error: action.payload };


case FRIEND_ACCEPT_REQUEST:
      return { ...state, loading: true };

    case FRIEND_ACCEPT_SUCCESS:
      return {
        ...state,
        loading: false,
        incoming: state.incoming.filter(
          (r) => r.id !== action.payload
        ),
      };

    case FRIEND_ACCEPT_FAILED:
      return { ...state, loading: false, error: action.payload };

      /* ================= FRIEND STATUS ================= */

case FRIEND_STATUS_REQUEST:
  return {
    ...state,
    loading: true,
    error: null,
  };

case FRIEND_STATUS_SUCCESS:
  return {
    ...state,
    loading: false,
    friendStatus: {
      ...state.friendStatus,
      [action.payload.other]: action.payload.data,
    },
  };

case FRIEND_STATUS_FAILED:
  return {
    ...state,
    loading: false,
    error: action.payload,
  };


/* ================= UNFRIEND ================= */

case FRIEND_UNFRIEND_REQUEST:
  return {
    ...state,
    loading: true,
    error: null,
  };

case FRIEND_UNFRIEND_SUCCESS:
  return {
    ...state,
    loading: false,

    // remove from friend list
    friends: state.friends.filter(
      (id) => id !== action.payload
    ),

    // reset relationship
    friendStatus: {
      ...state.friendStatus,
      [action.payload]: { state: "NONE" },
    },
  };

case FRIEND_UNFRIEND_FAILED:
  return {
    ...state,
    loading: false,
    error: action.payload,
  };

    default:
      return state;
  }
}
