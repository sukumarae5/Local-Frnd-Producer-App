import {
  PROFILE_IMAGE_UPLOAD_REQUEST,
  PROFILE_IMAGE_UPLOAD_SUCCESS,
  PROFILE_IMAGE_UPLOAD_FAILED,
  PROFILE_IMAGE_DELETE_REQUEST,
  PROFILE_IMAGE_DELETE_SUCCESS,
  PROFILE_IMAGE_DELETE_FAILED,
} from "./profileImageType";

// Upload
export const uploadProfileImageRequest = (payload, callback) => ({
  type: PROFILE_IMAGE_UPLOAD_REQUEST,
  payload,
  callback,
});

export const uploadProfileImageSuccess = (data) => ({
  type: PROFILE_IMAGE_UPLOAD_SUCCESS,
  payload: data,
});

export const uploadProfileImageFailed = (error) => ({
  type: PROFILE_IMAGE_UPLOAD_FAILED,
  payload: error,
});

// Delete
export const deleteProfileImageRequest = (callback) => ({
  type: PROFILE_IMAGE_DELETE_REQUEST,
  callback,
});

export const deleteProfileImageSuccess = (data) => ({
  type: PROFILE_IMAGE_DELETE_SUCCESS,
  payload: data,
});

export const deleteProfileImageFailed = (error) => ({
  type: PROFILE_IMAGE_DELETE_FAILED,
  payload: error,
});