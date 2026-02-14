import { USER_POST_PHOTO_REQUEST,USER_POST_PHOTO_SUCCESS,USER_POST_PHOTO_FAILED , USER_DELETE_PHOTO_FAILED, USER_DELETE_PHOTO_REQUEST, USER_DELETE_PHOTO_SUCCESS 
} from "./photoAction";
const initialState={
    userphoto:null,
    loading:null,
    error:null
}


export default function photoReducer(state=initialState,action){
   console.log(action.payload)
    switch (action.type) {
        case USER_POST_PHOTO_REQUEST:
            
            return{...state,loading:true,error:null}
        case USER_POST_PHOTO_SUCCESS:  
        return{...state,loading:false,userphoto:action.payload,}  
        case USER_POST_PHOTO_FAILED:
            return{...state,loading:false,error:action.payload}
    
case USER_DELETE_PHOTO_REQUEST:
      return { ...state, loading: true, error: null };

   case USER_DELETE_PHOTO_SUCCESS:
  return {
    ...state,
    loading: false,
    userphoto: {
      ...state.userphoto,
      images: {
        ...state.userphoto?.images,
        gallery: state.userphoto?.images?.gallery?.filter(
          (img) => img.photo_id !== action.payload.photo_id
        ),
      },
    },
  };

    case USER_DELETE_PHOTO_FAILED:
      return { ...state, loading: false, error: action.payload };

            
        default:
            return state;
    }

}