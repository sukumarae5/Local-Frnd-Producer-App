import {
  GET_OFFERS_REQUEST,
  GET_OFFERS_SUCCESS,
  GET_OFFERS_FAILURE,
} from "../Offers/offersTypes";

const initialState = {
  loading: false,
  offers: [],
  error: null,
};

const offersReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_OFFERS_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case GET_OFFERS_SUCCESS:
      return {
        ...state,
        loading: false,
        offers: action.payload,
      };

    case GET_OFFERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default offersReducer;