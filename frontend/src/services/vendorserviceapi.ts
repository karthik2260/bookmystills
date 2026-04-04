import { axiosInstanceVendor } from "@/config/api/axiosinstance";
import type { PostData } from "@/types/postTypes";
import type { VendorData } from "@/types/vendorTypes";

// Fetch full vendor profile
export const fetchVendorProfileApi = async (): Promise<VendorData> => {
  const response = await axiosInstanceVendor.get("/profile");
  return response.data;
};

// Fetch only vendor status (clean + reusable)
export const fetchVendorStatusApi = async () => {
  const response = await axiosInstanceVendor.get("/profile");

  const freshVendor = response.data?.vendor ?? response.data;

  return {
    isAccepted: freshVendor?.isAccepted,
    rejectionReason: freshVendor?.rejectionReason,
  };
};

export const fetchVendorDetailsApi = async () => {
  const response = await axiosInstanceVendor.get("/vendorDetails");
  return response.data?.vendor;
};

export const submitPostApi = async (
  isEditMode: boolean,
  postId: string | undefined,
  formData: FormData,
) => {
  const endpoint = isEditMode && postId ? `/edit-post/${postId}` : "/add-post";

  const method = isEditMode ? "put" : "post";

  const response = await axiosInstanceVendor[method](endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const fetchVendorPostsApi = async (): Promise<PostData[]> => {
  const token = localStorage.getItem("vendorToken");

  const response = await axiosInstanceVendor.get("/posts", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data?.data?.posts || [];
};
