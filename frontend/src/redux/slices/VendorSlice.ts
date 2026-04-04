import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import type {
  AcceptanceStatus,
  VendorData,
  vendorProfileData,
} from "../../types/vendorTypes";

export interface VendorState {
  vendorData: VendorData | null;
  isVendorSignedIn: boolean;
  vendorProfileData: vendorProfileData | null; // ✅ add this
}

const initialState: VendorState = {
  vendorData: null,
  isVendorSignedIn: false,
  vendorProfileData: null, // ✅ add this
};

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    setVendorInfo: (state, action: PayloadAction<VendorData>) => {
      state.vendorData = action.payload;
      state.isVendorSignedIn = true;
    },
    setVendorProfileData: (state, action: PayloadAction<vendorProfileData>) => {
      state.vendorProfileData = action.payload; // ✅ add this
    },
    updateVendorStatus: (
      state,
      action: PayloadAction<{
        isAccepted: AcceptanceStatus;
        rejectionReason?: string | undefined;
      }>,
    ) => {
      if (state.vendorData) {
        state.vendorData.isAccepted = action.payload.isAccepted;
        state.vendorData.rejectionReason =
          action.payload.rejectionReason ?? undefined;
      }
    },
    logout: (state) => {
      state.vendorData = null;
      state.isVendorSignedIn = false;
      state.vendorProfileData = null;
    },
  },
});

export const {
  setVendorInfo,
  setVendorProfileData,
  logout,
  updateVendorStatus,
} = vendorSlice.actions;
export default vendorSlice.reducer;
