import * as types from "./notificationType";

const initialState = {
  list: [],
  unread: 0,
  loading: false,
};

export default function notificationReducer(state = initialState, action) {
  switch (action.type) {

    case types.NOTIFICATION_FETCH_REQUEST:
      return { ...state, loading: true };

    case types.NOTIFICATION_FETCH_SUCCESS:
      return { ...state, loading: false, list: action.payload };

    case types.NOTIFICATION_UNREAD_SUCCESS:
      return { ...state, unread: action.payload };

      case "NOTIFICATION_REMOVE":
  return {
    ...state,
    list: state.list.filter(n => n.id !== action.payload)
  };
  
    default:
      return state;
  }
}