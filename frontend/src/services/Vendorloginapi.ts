import { axiosInstanceVendor } from "@/config/api/axiosinstance";
import type { AcceptanceStatus } from "@/types/vendorTypes";

export interface VendorProfileStatusResult {
  isAccepted?: AcceptanceStatus;
  rejectionReason?: string;
}

export const fetchVendorProfileStatusApi = async (
  token: string,
): Promise<VendorProfileStatusResult> => {
  const response = await axiosInstanceVendor.get("/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const vendor = response.data?.vendor ?? response.data;
  return {
    isAccepted: vendor?.isAccepted as AcceptanceStatus | undefined,
    rejectionReason: vendor?.rejectionReason ?? undefined,
  };
};
