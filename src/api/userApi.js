import { MAIN_BASE_URL } from "./baseUrl1";
export const user_Register = `${MAIN_BASE_URL}/api/auth/register`;
export const user_login=`${MAIN_BASE_URL}/api/auth/login`
export const user_Otp = `${MAIN_BASE_URL}/api/auth/verify-otp`;
export const user_Edit = `${MAIN_BASE_URL}/api/user/profile`;
export const USER_PHOTO_POST_URL = `${MAIN_BASE_URL}/api/photo`;
export const USER_DATA=`${MAIN_BASE_URL}/api/userprofile/profile`;
export const random_users_data=`${MAIN_BASE_URL}/api/user/random-users`;
export const random_calls=`${MAIN_BASE_URL}/api/call/random-connect`;
export const languages=`${MAIN_BASE_URL}/api/language/getlanguages`;
export const newuserapi=`${MAIN_BASE_URL}/api/user/profile`
export const avatarsapi=`${MAIN_BASE_URL}/api/avatars`
export const recent_calls = `${MAIN_BASE_URL}/api/calls/recent-users`;
export const friendrequest = `${MAIN_BASE_URL}/api/friend/request`;
export const friendList = `${MAIN_BASE_URL}/api/friend/list`;
export const friendAccept = `${MAIN_BASE_URL}/api/friend/accept`;
export const friendPending  = `${MAIN_BASE_URL}/api/friend/pending`;
export const friendStatus =  `${MAIN_BASE_URL}/api/friend/status`;
export const friendUnfriend = `${MAIN_BASE_URL}/api/friend/unfriend`;
export const statesapi=`${MAIN_BASE_URL}/api/location/states`;
export const citiesapi=`${MAIN_BASE_URL}/api/location/cities`
export const Locationapi=`${MAIN_BASE_URL}/api/location/countries`;
export const yourinterest =`${MAIN_BASE_URL}/api/interest/all`
export const lifestycategory=`${MAIN_BASE_URL}/api/lifestylecategory/all`
export const lifeStyleallapi=`${MAIN_BASE_URL}/api/lifestyle/all`
export const userlifestyleapi=`${MAIN_BASE_URL}/api/userlifestyle`
console.log(statesapi)