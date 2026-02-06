import {
  FETCH_INTERESTS_REQUEST,
  FETCH_INTERESTS_SUCCESS,
  FETCH_INTERESTS_FAILURE,
  SELECT_INTERESTS_REQUEST,
  SELECT_INTERESTS_SUCCESS,
  SELECT_INTERESTS_FAILURE,
  UPDATE_SELECT_INTERESTS_REQUEST,
  UPDATE_SELECT_INTERESTS_SUCCESS,
  UPDATE_SELECT_INTERESTS_FAILURE
} from "./interestTypes";

const initialState = {
  loading: false,
  interests: [],
  selectedInterests:[],
  updateselectedInterests:[],
  error: null,
};

const interestReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_INTERESTS_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_INTERESTS_SUCCESS:
      return { ...state, loading: false, interests: action.payload };

    case FETCH_INTERESTS_FAILURE:
      return { ...state, loading: false, error: action.payload };



      case SELECT_INTERESTS_REQUEST:
      return { ...state, loading: true, error: null };

    case SELECT_INTERESTS_SUCCESS:
      return { ...state, loading: false, selectedInterests: action.payload };

    case SELECT_INTERESTS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case UPDATE_SELECT_INTERESTS_REQUEST:
      return{...state,loading:true,error:null};
    case UPDATE_SELECT_INTERESTS_SUCCESS:
      return{...state,loading:false, updateselectedInterests:action.payload} 
    case UPDATE_SELECT_INTERESTS_FAILURE:
      return{...state,loading:false,error:action.payload}   
      default:
      return state;
  }
};

export default interestReducer;
