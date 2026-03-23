import {
  GET_OFFERS_REQUEST,
  GET_OFFERS_SUCCESS,
  GET_OFFERS_FAILURE,
} from "./offersTypes";

export const getOffersRequest = () => ({
  type: GET_OFFERS_REQUEST,
});

export const getOffersSuccess = (data) => ({
  type: GET_OFFERS_SUCCESS,
  payload: data,
});

export const getOffersFailure = (error) => ({
  type: GET_OFFERS_FAILURE,
  payload: error,
});