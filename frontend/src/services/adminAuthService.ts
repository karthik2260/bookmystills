import { axiosInstanceAdmin } from "@/config/api/axiosinstance";


interface LoginPayload {
    email:string;
    password :string;
}


export const adminLoginService = async (payload:LoginPayload) => {
    const response = await axiosInstanceAdmin.post("/login",payload);
    return response.data
}

export const getAdminDashboardService = async () => {
    const response = await axiosInstanceAdmin.get('/dashboard');
    return response.data;
};

export const adminLogoutService = async () => {
    const response = await axiosInstanceAdmin.get("/logout");
    return response.data;
};


export const blockUnblockVendorService = async (vendorId: string) => {
  const response = await axiosInstanceAdmin.patch(
    "/vendorblock-unblock",
    {},
    {
      params: { vendorId },
    }
  );

  return response.data;
};