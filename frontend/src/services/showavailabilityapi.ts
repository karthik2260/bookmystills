import { axiosInstance } from "@/config/api/axiosinstance";
import type { VendorData } from "@/types/vendorTypes";

export const fetchVendorByIdApi = async (
  vendorId: string,
): Promise<VendorData> => {
  const response = await axiosInstance.get(`/portfolio/${vendorId}`);
  return response.data.data.vendor;
};
