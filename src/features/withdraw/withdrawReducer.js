import * as types from "./withdrawType";

const initialState = {
  createLoading: false,
  historyLoading: false,
  withdrawSuccess: null,
  history: [],
  error: null
};

const withdrawReducer = (state = initialState, action) => {
  switch (action.type) {

    /* CREATE */
    case types.CREATE_WITHDRAW_REQUEST:
      return { ...state, createLoading: true };

    case types.CREATE_WITHDRAW_SUCCESS:
      return {
        ...state,
        createLoading: false,
        withdrawSuccess: true,
        error: null
      };

    case types.CREATE_WITHDRAW_FAILURE:
      return {
        ...state,
        createLoading: false,
        error: action.payload,
        withdrawSuccess: null
      };

    /* HISTORY */
    case types.GET_WITHDRAW_HISTORY_REQUEST:
      return { ...state, historyLoading: true };

    case types.GET_WITHDRAW_HISTORY_SUCCESS:
      return {
        ...state,
        historyLoading: false,
        history: action.payload
      };

    case types.GET_WITHDRAW_HISTORY_FAILURE:
      return {
        ...state,
        historyLoading: false,
        error: action.payload
      };

    /* RESET */
    case types.WITHDRAW_RESET:
      return {
        ...state,
        createLoading: false,
        historyLoading: false,
        withdrawSuccess: null,
        error: null
      };

    default:
      return state;
  }
};

export default withdrawReducer;