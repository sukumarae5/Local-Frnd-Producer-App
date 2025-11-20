import { all } from "redux-saga/effects";
import RegisterSaga from "../features/Auth/authSaga";

export default function* rootSaga() {
  yield all([
    RegisterSaga(),
  ]);
}
