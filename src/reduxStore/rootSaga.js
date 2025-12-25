import { all } from "redux-saga/effects";
import authSaga from "../features/Auth/authSaga";
import userSaga from "../features/user/userSaga";
import photoSaga from "../features/photo/photoSaga";
import randomuserSaga from "../features/RandomUsers/randomuserSaga";
import callsSaga from "../features/calls/callSaga"
import languageSaga from "../features/language/languageSaga"
import avatarsSaga from "../features/Avatars/avatarsSaga";
export default function* rootSaga() {
  yield all([
    authSaga(),
    userSaga(),
    photoSaga(),
    randomuserSaga(),
    callsSaga(),
    languageSaga(),
    avatarsSaga()

  ]);
}
