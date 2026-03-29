import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProfileUserDTO, UserData } from "../../types/userTypes";

export interface UserState {
    userData : UserData | null ;
    isUserSignedIn : boolean
    profileData : ProfileUserDTO | null
}

const initialState : UserState = {
    userData : null,
    isUserSignedIn : false,
    profileData : null,
}


const userSlice = createSlice({
    name : 'user',
    initialState,
    reducers :{
        setUserInfo:(state,action: PayloadAction<UserData>)=>{
            state.userData = action.payload;
            state.isUserSignedIn = true
        },
         setProfileData: (state, action: PayloadAction<ProfileUserDTO>) => {
            state.profileData = action.payload; 
        },
        
        logout:(state)=>{
            state.userData = null;
            state.isUserSignedIn =false
            state.profileData = null;
        }
    }
})

export const {setUserInfo,setProfileData,logout} = userSlice.actions;
export default userSlice.reducer