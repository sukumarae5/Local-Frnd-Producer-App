import {
  GET_COINS_REQUEST,
  GET_COINS_SUCCESS,
  GET_COINS_FAILURE
} from "./coinTypes";

const initialState = {
  loading: false,
  coins: [],
  error: null
};

const coinReducer = (state = initialState, action) => {
 console.log(action.payload)
    switch (action.type) {

    case GET_COINS_REQUEST:
      return { ...state, loading: true };

    case GET_COINS_SUCCESS:
      return {
        ...state,
        loading: false,
        coins: action.payload
      };

    case GET_COINS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    default:
      return state;
  }
};

export default coinReducer;