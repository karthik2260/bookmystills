import {
  axiosInstance,
  axiosInstanceAdmin,
  axiosInstanceVendor,
} from "@/config/api/axiosinstance";
import type { PasswordFormData } from "@/pages/common/changePassword";
import type { UserData, UserFormValues } from "@/types/userTypes";
import type { VendorData } from "@/types/vendorTypes";

export const loginUser = (data: { email: string; password: string }) => {
  return axiosInstance.post("/login", data);
};

export const forgotPassword = (email: string) => {
  return axiosInstance.post("/forgot-password", { email });
};

export const googleAuth = (credential: string) => {
  return axiosInstance.post("/google/auth", { credential });
};

export const signupUser = (data: UserFormValues) => {
  return axiosInstance.post("/signup", data);
};

export const logoutUser = () => {
  return axiosInstance.post("/logout");
};

export const validateResetToken = (token: string, isVendor: boolean) => {
  const client = isVendor ? axiosInstanceVendor : axiosInstance;
  return client.get(`/validate-reset-token/${token}`);
};

export const resetPassword = (
  token: string,
  data: { password: string; confirmPassword: string },
  isVendor: boolean,
) => {
  const client = isVendor ? axiosInstanceVendor : axiosInstance;
  return client.post(`/reset-password/${token}`, data, {
    withCredentials: true,
  });
};

export const changePasswordService = async (
  passwordData: PasswordFormData,
  token: string,
) => {
  const response = await axiosInstance.put("/change-password", passwordData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateProfileService = async (
  updates: FormData,
  token: string,
) => {
  const response = await axiosInstance.put("/profile", updates, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

interface VendorResponse {
  vendors: VendorData[];
}

export const getVendors = async (limit: number = 5): Promise<VendorData[]> => {
  const response = await axiosInstance.get<VendorResponse>("/vendors", {
    params: { limit },
  });

  return response.data.vendors;
};

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

interface GetUsersResponse {
  users: UserData[];
  totalPages: number;
}

export const getUsersService = async (
  params: GetUsersParams,
): Promise<GetUsersResponse> => {
  const response = await axiosInstanceAdmin.get<GetUsersResponse>("/users", {
    params,
  });

  return response.data;
};

export const blockUnblockUserService = async (userId: string) => {
  const response = await axiosInstanceAdmin.patch(
    "/block-unblock",
    {},
    {
      params: { userId },
    },
  );

  return response.data;
};
