import { USER_POST_PHOTO_REQUEST,USER_POST_PHOTO_SUCCESS,USER_POST_PHOTO_FAILED } from "./photoType";
import { USER_UPDATE_PHOTO_REQUEST,USER_UPDATE_PHOTO_SUCCESS,USER_UPDATE_PHOTO_FAILED } from "./photoType";
import { USER_DELETE_PHOTO_REQUEST,USER_DELETE_PHOTO_SUCCESS,USER_DELETE_PHOTO_FAILED } from "./photoType";
// ---------------------------POST-----------------------
export const userpostphotorequest = (payload, callback) => ({
  type: USER_POST_PHOTO_REQUEST,
  payload,
  callback, // callback passed to saga
});

export const userpostphotosuccess=(data)=>({

    type:USER_POST_PHOTO_SUCCESS,
    payload:data
})
export const userpostphotofailed=(error)=>({

    type:USER_POST_PHOTO_FAILED,
    payload:error
})
// ----------------------UPDATE--------------------------------
export const userupdatephotorequest=(data)=>({

    type:USER_UPDATE_PHOTO_REQUEST,
    payload:data
})
export const userupdatephotosuccess=(data)=>({

    type:USER_UPDATE_PHOTO_SUCCESS,
    payload:data
})
export const userupdatephotofailed=(error)=>({

    type:USER_UPDATE_PHOTO_FAILED,
    payload:error
})

// -------------------DELETE---------------------------------------

export const userdeletephotorequest=(data)=>({

    type:USER_DELETE_PHOTO_REQUEST,
    payload:data
})
export const userdeletephotosuccess=(data)=>({

    type:USER_DELETE_PHOTO_SUCCESS,
    payload:data
})
export const userdeletephotofailed=(error)=>({

    type:USER_DELETE_PHOTO_FAILED,
    payload:error
})