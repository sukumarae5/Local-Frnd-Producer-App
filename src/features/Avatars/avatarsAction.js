import {USER_AVATAR_API_FETCH_REQUEST,USER_AVATAR_API_FETCH_SUCCESS,USER_AVATAR_API_FETCH_FAILED, USER_AVATAR_ID_POST_REQUEST, USER_AVATAR_ID_POST_SUCCESS, USER_AVATAR_ID_POST_FAILED} from "./avatarsType"



export const useravatarapifetchrequest=(gender)=>({
    type:USER_AVATAR_API_FETCH_REQUEST,
    payload:gender
    
})


export const useravatarapifetchsuccess=(data)=>({
    type:USER_AVATAR_API_FETCH_SUCCESS,
    payload:data
    
})
export const useravatarapifetchfailed=(error)=>({
    type:USER_AVATAR_API_FETCH_FAILED,
    payload:error
})


