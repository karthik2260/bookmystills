import { axiosInstanceVendor } from "@/config/api/axiosinstance";
import type { VendorData } from "@/types/vendorTypes";

export const fetchVendorProfileApi = async (): Promise<VendorData> => {
  const response = await axiosInstanceVendor.get("/profile");
  return response.data;
};
