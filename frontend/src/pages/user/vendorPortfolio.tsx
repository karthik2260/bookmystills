import { Pagination } from "@nextui-org/react";
import { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import VendorDetails from "../../components/common/vendorDetails";
import { PostCard } from "../../components/user/PostCard";
import { PostModal } from "../../components/user/PostModal";
import Footer from "../../layout/user/footer";
import UserNavbar from "../../layout/user/navbar";
import type { PostData} from "../../types/postTypes";
import { ServiceProvided } from "../../types/postTypes";
import type { VendorData } from "../../types/vendorTypes";


import { ServiceTabs } from "@/components/common/ServiceTabs";
import { fetchVendorPortfolioApi } from "@/services/Vendorportfolioapi";
import { showToastMessage } from "@/validations/common/toast";
const VendorPorfolio = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceProvided>(
    ServiceProvided.Engagement,
  );
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const POSTS_PER_PAGE = 3;
  const { vendorId } = useParams();

  useEffect(() => {
    fetchPosts();
  }, [vendorId]);

  const fetchPosts = useCallback(async () => {
    if (!vendorId) return;
    setIsLoading(true);
    try {
      const result = await fetchVendorPortfolioApi(vendorId);
      setPosts(result.posts);
      if (result.vendor) setVendor(result.vendor);
    } catch (error) {
      console.error("Error fetching posts:", error);
      if (error instanceof AxiosError) {
        showToastMessage(error.response?.data.message, "error");
      } else {
        showToastMessage("Failed to load post", "error");
      }
    } finally {
      setIsLoading(false);
    }
  }, [vendorId]);

  const filteredPosts = posts.filter(
    (post) => post.serviceType === selectedService,
  );
  const totalFilteredPosts = filteredPosts.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalFilteredPosts / POSTS_PER_PAGE),
  );
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  const handleServiceChange = (service: ServiceProvided) => {
    setSelectedService(service);
    setCurrentPage(1);
  };

  const handleShowDetails = (post: PostData) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  return (
    <>
      <UserNavbar />
      {vendor && <VendorDetails isVendor={false} vendorDetails={vendor} />}

      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-light tracking-[0.3em] text-[#B8860B] text-center mb-12 uppercase">
          My Collections
        </h1>
        <ServiceTabs
          services={Object.values(ServiceProvided)}
          selectedService={selectedService}
          onServiceChange={(service) =>
            handleServiceChange(service as ServiceProvided)
          }
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : currentPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              No posts found for {selectedService}
            </p>
            <p className="text-gray-500 mt-2">Check back later for updates</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onShowDetails={handleShowDetails}
              />
            ))}
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              total={totalPages}
              initialPage={1}
              page={currentPage}
              onChange={setCurrentPage}
              showControls
              color="default"
            />
          </div>
        )}
      </div>

      <PostModal
        post={selectedPost}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
      <Footer />
    </>
  );
};

export default VendorPorfolio;
