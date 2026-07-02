// src/redux/rootReducer.js

import { combineReducers } from "redux";

import authReducer from "../features/Auth/authReducer";
import userReducer from "../features/user/userReducer";
import photoReducer from "../features/photo/photoReducer";
import randomuserReducer from "../features/RandomUsers/randomuserReducer";
import languageReducer from "../features/language/languageReducer";
import avatarsReducer from "../features/Avatars/avatarsReducer";
import locationReducer from "../features/Countries/locationReducer";
import callReducer from "../features/calls/callReducer";
import friendReducer from "../features/friend/friendReducer";
import interestReducer from "../features/interest/interestReducer";

import lifestyleReducer from "../features/lifeStyle/lifestyleReducer";
import lifestyleOptionsReducer from "../features/lifeStyle/lifestyleReducer";
import userLifestyleReducer from "../features/lifeStyle/lifestyleReducer";

import otherUsersReducer from "../features/Otherusers/otherUserReducer";
import chatReducer from "../features/chat/chatReducer";
import ratingReducer from "../features/rating/ratingReducer";
import notificationReducer from "../features/notification/notificationReducer";
import statusReducer from "../features/Status/statusReducer";
import coinReducer from "../features/conis/coinReducer";
import offersReducer from "../features/Offers/offersReducer";
import purchaseReducer from "../features/purchase/purchaseReducer";
import withdrawReducer from "../features/withdraw/withdrawReducer";
import chatOptionsReducer from "../features/chat/chatOptionsReducer";

import likeMindedReducer from "../features/LikeMinded/likeMindedReducer";

import profileImageReducer from '../features/profileImage/profileImageReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  photo: photoReducer,
  randomusers: randomuserReducer,
  language: languageReducer,
  avatars: avatarsReducer,
  friends: friendReducer,
  location: locationReducer,
  interest: interestReducer,

  lifestyle: lifestyleReducer,
  lifestyleOptions: lifestyleOptionsReducer,
  userLifestyle: userLifestyleReducer,

  otherUsers: otherUsersReducer,
  chat: chatReducer,
  rating: ratingReducer,
  notification: notificationReducer,
  status: statusReducer,
  coins: coinReducer,
  offers: offersReducer,
  purchase: purchaseReducer,
  withdraw: withdrawReducer,
  chatOptions: chatOptionsReducer,

  likeMinded: likeMindedReducer,
  randomusers:randomuserReducer,
  calls: callReducer,
  profileImage: profileImageReducer,
});

export default rootReducer;
