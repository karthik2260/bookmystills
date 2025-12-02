import {createSlice} from '@reduxjs/toolkit' ;
import type { AdminData } from '../../types/adminTypes';



export interface AdminState{
    adminData : AdminData | null ;
    isAdminSignedIn : boolean
}

const initialState : AdminState = {
    adminData : null ,
    isAdminSignedIn : true
}

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        setAdminInfo : (state,action)=>{
            state.adminData = action.payload ;
            state.isAdminSignedIn = true
        } ,
        logout : (state) =>{
            state.adminData = null ;
            state.isAdminSignedIn = false
        }
    }
})

export  const {setAdminInfo,logout} = adminSlice.actions ;
export default adminSlice.reducer ;