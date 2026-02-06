import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import {
  FETCH_INTERESTS_REQUEST,
  SELECT_INTERESTS_REQUEST,
  UPDATE_SELECT_INTERESTS_REQUEST
} from "./interestTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { selectinterest, yourinterest } from "../../api/userApi";
import { fetchInterestsFailure, fetchInterestsSuccess, selectInterestsFailure, selectInterestsSuccess } from "./interestActions";

function* fetchInterests() {
  try {
    const token = yield call([AsyncStorage, "getItem"], "twittoke");

    const response = yield call(() => axios.get(yourinterest,{
       headers: {
          Authorization: `Bearer ${token}`,
        },
    })
  );

    yield put(fetchInterestsSuccess(response.data.data));

  } catch (error) {
    yield put(fetchInterestsFailure(error.message));
  }
}


function* selectInterest(action) {
  try {
    const token = yield call([AsyncStorage, "getItem"], "twittoke");
    const user_id = yield call([AsyncStorage, "getItem"], "user_id");

    console.log("TOKEN:", token);
    console.log("USER_ID:", user_id);
    console.log("INTERESTS:", action.payload.interests);

    const response = yield call(() =>
      axios.post(
        selectinterest,
        {
          interests: action.payload.interests, // ✅ only interests
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    );

    yield put(selectInterestsSuccess(response.data));
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(selectInterestsFailure(msg));
  }
}

function* handelupdateinterst(action){
  console.log(action.payload)
  try {
    const token = yield call([AsyncStorage, "getItem"], "twittoke");
    const user_id = yield call([AsyncStorage, "getItem"], "user_id");

    console.log("TOKEN:", token);
    console.log("USER_ID:", user_id);
    console.log("INTERESTS:", action.payload);

    const response = yield call(() =>
      axios.put(
        selectinterest,
        {
          interests: action.payload.interests, // ✅ only interests
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    );

    yield put(selectInterestsSuccess(response.data));
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    yield put(selectInterestsFailure(msg));
  }
}

export default function* interestSaga() {
  yield takeLatest(FETCH_INTERESTS_REQUEST, fetchInterests);
  yield takeLatest(SELECT_INTERESTS_REQUEST, selectInterest);
  yield takeLatest(UPDATE_SELECT_INTERESTS_REQUEST,handelupdateinterst)
}
