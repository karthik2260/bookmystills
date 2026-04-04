import { axiosInstance } from "@/config/api/axiosinstance";
import type { PostData} from "@/types/postTypes";
import { PostStatus } from "@/types/postTypes";
import type { VendorData } from "@/types/vendorTypes";
export interface FetchPortfolioResult {
  posts: PostData[];
  vendor: VendorData | null;
}

export const fetchVendorPortfolioApi = async (
  vendorId: string,
): Promise<FetchPortfolioResult> => {
  const response = await axiosInstance.get(`/portfolio/${vendorId}`);

  const publishedPosts = response.data.data.post.filter(
    (post: PostData) => post.status === PostStatus.Published,
  );

  return {
    posts: Array.isArray(publishedPosts) ? publishedPosts : [],
    vendor: response.data.data.vendor ?? null,
  };
};
