import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Loader from "@/components/common/Loader";
import { UnifiedCalendar } from "@/components/vendor/AvailabilityCalendar";
import { axiosInstance } from "@/config/api/axiosinstance";
import UserNavbar from "@/layout/user/navbar";
import { fetchVendorByIdApi } from "@/services/showavailabilityapi";
import type { VendorData } from "@/types/vendorTypes";
import { showToastMessage } from "@/validations/common/toast";
const ShowAvailabilty = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const { vendorId } = useParams();

  useEffect(() => {
    fetchPosts();
  }, [vendorId]);

  const fetchPosts = async () => {
    if (!vendorId) return;
    setIsLoading(true);
    try {
      const vendor = await fetchVendorByIdApi(vendorId);
      if (vendor) setVendor(vendor);
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
  };

  return (
    <>
      <UserNavbar />
      {!isLoading ? (
        <UnifiedCalendar
          isVendor={false}
          vendorDetails={vendor}
          axiosInstance={axiosInstance}
        />
      ) : (
        <Loader />
      )}
    </>
  );
};

export default ShowAvailabilty;
