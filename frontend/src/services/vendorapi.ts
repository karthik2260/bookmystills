import { AcceptanceStatus,VendorData } from '@/types/vendorTypes';
import { axiosInstanceAdmin } from '@/config/api/axiosinstance';
export interface FetchVendorsParams {
  page: number;
  search: string;
  activeTab: string;
}

export interface FetchVendorsResult {
  vendors: VendorData[];
  totalPages: number;
}

export const fetchVendorsApi = async (params: FetchVendorsParams): Promise<FetchVendorsResult> => {
  const response = await axiosInstanceAdmin.get('/vendors', {
    params: {
      page: params.page,
      limit: 6,
      search: params.search,
      status: params.activeTab !== 'all' ? params.activeTab : undefined,
    },
  });

  return {
    vendors: response.data.vendors,
    totalPages: response.data.totalPages,
  };
};

export interface BlockUnblockResult {
  message: string;
  processHandle: string;
}

export const blockUnblockVendorApi = async (vendorId: string): Promise<BlockUnblockResult> => {
  const response = await axiosInstanceAdmin.patch(`/vendorblock-unblock?vendorId=${vendorId}`);
  return {
    message: response.data.message,
    processHandle: response.data.processHandle,
  };
};

export interface VerifyVendorResult {
  message: string;
}

export const verifyVendorApi = async (
  vendorId: string,
  status: AcceptanceStatus
): Promise<VerifyVendorResult> => {
  const response = await axiosInstanceAdmin.put(`/vendors/${vendorId}/status`, { status });
  return {
    message: response.data.message,
  };
};