import { combineReducers } from "redux";
import RegisterReducer from "../features/Auth/authReducer";

const rootReducer = combineReducers({
  userRegister: RegisterReducer,
});

export default rootReducer;
