import {createSlice, PayloadAction  } from '@reduxjs/toolkit'
import { AcceptanceStatus, VendorData } from "../../types/vendorTypes";

export interface VendorState {
    vendorData : VendorData | null ;
    isVendorSignedIn : boolean
}

const initialState : VendorState = {
    vendorData : null,
    isVendorSignedIn : false
}


const vendorSlice = createSlice({
    name : 'vendor',
    initialState,
    reducers :{
        setVendorInfo:(state,action:PayloadAction<VendorData>)=>{
            state.vendorData = action.payload;
            state.isVendorSignedIn = true
        },
        updateUserImage: (state, action: PayloadAction<string>) => {
            if (state.vendorData) {
                state.vendorData.imageUrl = action.payload;
            }
        },


    updateVendorStatus: (state, action: PayloadAction<{ 
    isAccepted: AcceptanceStatus;        // ← AcceptanceStatus, not string
    rejectionReason?: string | undefined // ← undefined, not null
}>) => {
    if (state.vendorData) {
        state.vendorData.isAccepted = action.payload.isAccepted;
        state.vendorData.rejectionReason = action.payload.rejectionReason ?? undefined; // ← ?? undefined
    }
},

        logout:(state)=>{
            state.vendorData = null;
            state.isVendorSignedIn =false
        }
    }
})

export const {setVendorInfo,logout,updateVendorStatus} = vendorSlice.actions;
export default vendorSlice.reducer