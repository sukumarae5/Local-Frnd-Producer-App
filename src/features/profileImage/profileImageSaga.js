import { call, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { PROFILE_IMAGE_API } from '../../api/userApi';

import {
  uploadProfileImageSuccess,
  uploadProfileImageFailed,
  deleteProfileImageSuccess,
  deleteProfileImageFailed,
} from './profileImageAction';

import {
  PROFILE_IMAGE_UPLOAD_REQUEST,
  PROFILE_IMAGE_DELETE_REQUEST,
} from './profileImageType';

import { USER_DATA_REQUEST } from '../user/userType';

function* handleUploadProfileImage(action) {
  try {
    const token = yield call(AsyncStorage.getItem, 'twittoke');

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    };

    const response = yield call(
      axios.post,
      PROFILE_IMAGE_API,
      action.payload,
      config,
    );

    yield put(uploadProfileImageSuccess(response.data));

    // Refresh profile
    yield put({
      type: USER_DATA_REQUEST,
    });

    if (action.callback) {
      action.callback();
    }
  } catch (error) {
    yield put(
      uploadProfileImageFailed(error.response?.data?.message || error.message),
    );
  }
}

function* handleDeleteProfileImage(action) {
  try {
    const token = yield call(AsyncStorage.getItem, 'twittoke');

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = yield call(axios.delete, PROFILE_IMAGE_API, config);

    yield put(deleteProfileImageSuccess(response.data));

    yield put({
      type: USER_DATA_REQUEST,
    });

    if (action.callback) {
      action.callback();
    }
  } catch (error) {
    yield put(
      deleteProfileImageFailed(error.response?.data?.message || error.message),
    );
  }
}

export default function* profileImageSaga() {
  yield takeLatest(PROFILE_IMAGE_UPLOAD_REQUEST, handleUploadProfileImage);

  yield takeLatest(PROFILE_IMAGE_DELETE_REQUEST, handleDeleteProfileImage);
}
