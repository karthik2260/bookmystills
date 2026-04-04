import {
  faTrash,
  faMapMarkerAlt,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge } from "@material-tailwind/react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Pagination,
} from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { VENDOR } from "../../../config/constants/constants";
import SidebarVendor from "../../../layout/vendor/SidebarProfileVendor";
import type {
  PostData} from "../../../types/postTypes";
import {
  PostStatus,
  ServiceProvided,
} from "../../../types/postTypes";
import { showToastMessage } from "../../../validations/common/toast";

import CreatePost from "./createPost";

import { ServiceTabs } from "@/components/common/ServiceTabs";
import { fetchVendorPostsApi } from "@/services/vendorserviceapi";

export default function EnhancedPosts() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<PostData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceProvided>(
    ServiceProvided.Engagement,
  );
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<
    Record<string, number>
  >({});
  const [selectedPostForEdit, setSelectedPostForEdit] =
    useState<PostData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const POSTS_PER_PAGE = 2;

  useEffect(() => {
    fetchPosts();

    const handlePostUpdated = () => {
      fetchPosts();
    };

    window.addEventListener("postUpdated", handlePostUpdated);

    return () => {
      window.removeEventListener("postUpdated", handlePostUpdated);
    };
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchVendorPostsApi();

      if (Array.isArray(data)) {
        setPosts(data);

        const initialImageIndices: Record<string, number> = {};
        data.forEach((post) => {
          initialImageIndices[post._id] = 0;
        });

        setCurrentImageIndex(initialImageIndices);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);

      if (error instanceof Error) {
        showToastMessage(error.message || "Failed to fetch posts", "error");
      } else {
        showToastMessage("An unknown error occurred", "error");
      }

      navigate(VENDOR.LOGIN);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = posts.filter(
    (post) => post.serviceType === selectedService,
  );

  const totalPosts = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );

  const handleServiceChange = (service: ServiceProvided) => {
    setSelectedService(service);
    setCurrentPage(1);
  };

  const handleEditClick = (post: PostData) => {
    setSelectedPostForEdit(post);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedPostForEdit(null);
    setIsEditModalOpen(false);
  };

  const toggleExpandPost = useCallback((postId: string) => {
    setExpandedPost((prev) => (prev === postId ? null : postId));
  }, []);

  const getStatusColor = (status?: PostStatus) => {
    switch (status) {
      case PostStatus.Published:
        return "green";
      case PostStatus.Draft:
        return "blue";
      case PostStatus.Archived:
        return "gray";
      case PostStatus.Blocked:
        return "red";
      default:
        return "blue";
    }
  };

  // auto image slider
  useEffect(() => {
    const intervals: Record<string, NodeJS.Timeout> = {};

    posts.forEach((post) => {
      if (post.imageUrl && Array.isArray(post.imageUrl)) {
        intervals[post._id] = setInterval(() => {
          setCurrentImageIndex((prev) => ({
            ...prev,
            [post._id]: ((prev[post._id] || 0) + 1) % post.imageUrl!.length,
          }));
        }, 3000);
      }
    });

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [posts]);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <SidebarVendor />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Posts</h1>
          <Button
            onClick={() => navigate("/vendor/add-post")}
            className="bg-black text-white"
          >
            Upload New Post
          </Button>
        </div>

        <ServiceTabs
          services={Object.values(ServiceProvided)}
          selectedService={selectedService}
          onServiceChange={(s) => handleServiceChange(s as ServiceProvided)}
        />

        {isLoading ? (
          <div className="flex justify-center h-64 items-center">
            <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full"></div>
          </div>
        ) : currentPosts.length === 0 ? (
          <div className="text-center py-12">
            <p>No posts found</p>
          </div>
        ) : (
          <AnimatePresence>
            {currentPosts.map((post) => (
              <motion.div
                key={post._id}
                className="bg-white rounded-lg shadow mb-6 p-4"
              >
                <img
                  src={
                    Array.isArray(post.imageUrl)
                      ? post.imageUrl[currentImageIndex[post._id] || 0]
                      : post.imageUrl
                  }
                  className="w-full h-64 object-cover"
                />

                <div className="mt-4">
                  <Badge color={getStatusColor(post.status)}>
                    {post.status}
                  </Badge>

                  <h2 className="text-lg font-bold mt-2">{post.serviceType}</h2>
                  <p>{post.caption}</p>

                  <div className="flex justify-between mt-4">
                    <Button onClick={() => handleEditClick(post)}>Edit</Button>

                    <Button onClick={() => toggleExpandPost(post._id)}>
                      {expandedPost === post._id ? "Hide" : "Show"}
                    </Button>
                  </div>
                </div>

                {expandedPost === post._id && (
                  <div className="flex gap-2 mt-4">
                    {Array.isArray(post.imageUrl) ? (
                      post.imageUrl.map((img, i) => (
                        <img key={i} src={img} className="w-24 h-24" />
                      ))
                    ) : (
                      <img src={post.imageUrl} className="w-24 h-24" />
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          size="xl"
        >
          <ModalContent>
            <ModalHeader>Edit Post</ModalHeader>
            <ModalBody>
              <CreatePost
                isEditMode
                existingPost={selectedPostForEdit}
                onClose={handleCloseEditModal}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </main>
    </div>
  );
}
