import { combineReducers } from "redux";
import  authReducer  from "../features/Auth/authReducer";
import  userReducer  from "../features/user/userReducer";
import photoReducer from "../features/photo/photoReducer";
import randomuserReduce from "../features/RandomUsers/randomuserReducer";
import languageReducer from "../features/language/languageReducer";
import avatarsReducer from"../features/Avatars/avatarsReducer"
import loccationReducer from"../features/Countries/locationReducer"
import callReducer from"../features/calls/callReducer"
import friendReducer from"../features/friend/friendReducer"
import interestReducer from "../features/interest/interestReducer"
import lifestyleReducer from "../features/lifeStyle/lifestyleReducer"
import lifestyleOptionsReducer  from"../features/lifeStyle/lifestyleReducer"
import userLifestyleReducer from"../features/lifeStyle/lifestyleReducer"
import otherusersSaga from "../features/Otherusers/otherUserReducer"
const rootReducer = combineReducers({
  auth:authReducer,
  user: userReducer,
  photo:photoReducer,
  randomusers:randomuserReduce,
  calls:callReducer,
  language:languageReducer,
  avatars:avatarsReducer,
  friends:friendReducer,  
  location:loccationReducer,
  interest:interestReducer,
  lifestyle:lifestyleReducer,
  lifestyleOptions:lifestyleOptionsReducer,
  userLifestyle:userLifestyleReducer,
  otherUsers:otherusersSaga
});

export default rootReducer;
