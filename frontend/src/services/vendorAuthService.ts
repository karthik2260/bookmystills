import { axiosInstanceVendor } from "@/config/api/axiosinstance";
import type { PasswordFormData } from "@/pages/common/changePassword";
import type { vendorProfileData } from "@/types/vendorTypes";
import type { IFormValues } from "@/utils/interface";

export const vendorSignup = (data: FormData) => {
  return axiosInstanceVendor.post("/signup", data, {
    withCredentials: true,
    // ✅ Don't set Content-Type at all — axios handles it automatically
  });
};

export const vendorLogout = () => {
  return axiosInstanceVendor.post("/logout");
};

export const vendorLogin = (data: IFormValues) => {
  return axiosInstanceVendor.post("/login", data);
};

export const vendorForgotPassword = (email: string) => {
  return axiosInstanceVendor.post("/forgot-password", { email });
};

export const getVendorProfile = () => {
  const token = localStorage.getItem("vendorToken");
  return axiosInstanceVendor.get<vendorProfileData>("/profile", {
    // ✅ VendorProfileData
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateVendorProfile = (updates: FormData) => {
  const token = localStorage.getItem("vendorToken");
  return axiosInstanceVendor.put<vendorProfileData>("/profile", updates, {
    // ✅ VendorProfileData not VendorData
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
