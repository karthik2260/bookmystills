import { axiosInstanceAdmin } from "@/config/api/axiosinstance";


interface LoginPayload {
    email:string;
    password :string;
}

interface VerifyVendorPayload {
  status: string; // AcceptanceStatus as string
  rejectionReason?: string;
}


export interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface VendorResponse {
  data: any[]; // Replace `any` with your Vendor type if you have it
  total: number;
  page: number;
  limit: number;
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


export const verifyVendorService = async (
  vendorId: string,
  payload: VerifyVendorPayload
) => {
  const response = await axiosInstanceAdmin.put(
    `/vendors/${vendorId}/status`,
    payload
  );
  return response.data;
};


export interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const fetchVendorsApi = async (params: FetchParams) => {
  const response = await axiosInstanceAdmin.get("/vendors", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      status: params.status,
    },
  });

  return response.data; // just return raw API data
};


