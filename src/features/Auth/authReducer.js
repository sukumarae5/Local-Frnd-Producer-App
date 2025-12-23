import {
  USER_REGISTER_FETCH_REQUEST,
  USER_REGISTER_FETCH_SUCCESS,
  USER_REGISTER_FETCH_FAILED,  
  USER_LOGIN_FETCH_REQUEST,
  USER_LOGIN_FETCH_SUCCESS,
  USER_LOGIN_FETCH_FAILED,USER_OTP_FETCH_REQUEST,
  USER_OTP_FETCH_SUCCESS,
  USER_OTP_FETCH_FAILED,USER_LOGOUT_REQUEST
} from "./authType";

const initialState = {
  loading: false,
  mobile_number1: null,
  mobile_number2:null,
  Otp:null,
  error: null,
  success:null,
  mode:null,
  message:null

};

export default function authReducer(state = initialState, action) {
  console.log(action.payload)
  switch (action.type) {
    case USER_REGISTER_FETCH_REQUEST:
      return { ...state, loading: true, error: null };     
    case USER_REGISTER_FETCH_SUCCESS:
      return { ...state, loading: false,success:action.payload.success,mode:action.payload.mode ,message: action.payload.message };
    case USER_REGISTER_FETCH_FAILED:
      return { ...state, loading: false, error: action.payload };


       case USER_LOGIN_FETCH_REQUEST:
      return { ...state, loading: true, error: null };     
    case USER_LOGIN_FETCH_SUCCESS:
      return { ...state, loading: false, success:action.payload.success,mode:action.payload.mode ,message: action.payload.message };
    case USER_LOGIN_FETCH_FAILED:
      return { ...state, loading: false, error: action.payload };

     


      case USER_OTP_FETCH_REQUEST:
      return { ...state, loading: true, error: null };     
    case USER_OTP_FETCH_SUCCESS:
      return { ...state, loading: false, Otp:action.payload };
    case USER_OTP_FETCH_FAILED:
      return { ...state, loading: false, error: action.payload };
    case USER_LOGOUT_REQUEST:
  return { ...initialState };


    default:
      return state;
  }
  
  
}

