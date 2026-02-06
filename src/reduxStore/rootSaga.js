import { all } from "redux-saga/effects";
import authSaga from "../features/Auth/authSaga";
import userSaga from "../features/user/userSaga";
import photoSaga from "../features/photo/photoSaga";
import randomuserSaga from "../features/RandomUsers/randomuserSaga";
import languageSaga from "../features/language/languageSaga"
import avatarsSaga from "../features/Avatars/avatarsSaga";
import locationSaga from "../features/Countries/locationSaga"
import callSaga from "../features/calls/callSaga";
import friendSaga from "../features/friend/friendSaga";
import interestSaga from "../features/interest/interestSaga"
import lifestyleSaga from "../features/lifeStyle/lifestyleSaga"
import lifestyleOptionsSaga from "../features/lifeStyle/lifestyleSaga"
import userLifestyleSaga from"../features/lifeStyle/lifestyleSaga"
import otherusersSaga from "../features/Otherusers/otherUserSaga"
import chatSaga from "../features/chat/chatSaga"


export default function* rootSaga() {
  yield all([
    authSaga(),
    userSaga(),
    photoSaga(),
    randomuserSaga(),
    callSaga(),
    languageSaga(),
    avatarsSaga(),
    friendSaga(),
    locationSaga(),
    interestSaga(),
    lifestyleSaga(),
    lifestyleOptionsSaga(),
    userLifestyleSaga(),
    otherusersSaga(),
    chatSaga()
  ]);
}
