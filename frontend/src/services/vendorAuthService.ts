import { axiosInstanceVendor } from "@/config/api/axiosinstance";
import { PasswordFormData } from "@/pages/common/changePassword";
import { VendorData, VendorFormValues } from "@/types/vendorTypes";
import { IFormValues } from "@/utils/interface";


export const vendorSignup = (data:VendorFormValues) => {
    return axiosInstanceVendor.post('/signup',data,{
        withCredentials:true
    })
}



export const vendorLogout = () => {
    return axiosInstanceVendor.post("/logout")
}


export const vendorLogin = (data:IFormValues) => {
    return axiosInstanceVendor.post("/login",data)
}


export const vendorForgotPassword = (email:string) => {
    return axiosInstanceVendor.post("/forgot-password",{email})
}


export const getVendorProfile = () => {
  const token = localStorage.getItem("vendorToken");
  return axiosInstanceVendor.get<VendorData>("/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateVendorProfile = (updates: FormData) => {
  const token = localStorage.getItem("vendorToken");
  return axiosInstanceVendor.put<VendorData>("/profile", updates, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const changeVendorPassword = (passwordData: PasswordFormData) => {
  const token = localStorage.getItem("vendorToken");
  return axiosInstanceVendor.put("/change-password", passwordData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};