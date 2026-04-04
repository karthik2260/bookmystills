import type { VendorResponse } from "../types/vendorTypes";

import { axiosInstance } from "@/config/api/axiosinstance";
import type { PostData} from "@/types/postTypes";
import { PostStatus } from "@/types/postTypes";

export const fetchVendors = async (
  page: number,
  search: string,
): Promise<VendorResponse> => {
  const response = await axiosInstance.get<VendorResponse>("/vendors", {
    params: {
      page,
      limit: 3,
      search,
    },
  });

  return response.data;
};

// src/services/reportService.ts

interface ReportPayload {
  itemId: string;
  type: "Post" | "Comment" | "Other";
  reason: string;
  additionalDetails?: string;
}

export const submitReport = async (payload: ReportPayload) => {
  return axiosInstance.post("/reports", payload);
};

export const fetchPostsAPI = async (token: string): Promise<PostData[]> => {
  const response = await axiosInstance.get("/viewposts", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const publishedPosts: PostData[] = response.data.data.posts.filter(
    (post: PostData) =>
      post.status === PostStatus.Published && post.vendor.isActive,
  );

  if (!Array.isArray(publishedPosts)) {
    console.error("Published posts is not an array:", publishedPosts);
    return [];
  }

  return publishedPosts;
};

export interface UnavailableDatesResponse {
  result?: {
    bookedDates?: string[]; // or Date[], depending on your backend
  };
}

export const fetchUnavailableDatesAPI = async (): Promise<string[]> => {
  const response =
    await axiosInstance.get<UnavailableDatesResponse>("/dateAvailabilty");
  console.log("Date response:", response.data);

  return response.data.result?.bookedDates || [];
};

export const updateAvailabilityAPI = async (
  dates: string[],
  mode: "block" | "unblock",
) => {
  if (dates.length === 0) throw new Error("No dates provided");

  const endpoint =
    mode === "block" ? "/dateAvailabilty" : "/dateAvailabilty/unblock";
  const response = await axiosInstance.post(endpoint, { dates });

  return response.data;
};
