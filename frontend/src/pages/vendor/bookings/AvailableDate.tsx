import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Footer from "../../../layout/user/footer";

import { UnifiedCalendar } from "@/components/vendor/AvailabilityCalendar";
import { axiosInstanceVendor } from "@/config/api/axiosinstance";
import { VENDOR } from "@/config/constants/constants";
import { fetchVendorProfileApi } from "@/services/Availabledateapi";
import type { VendorData } from "@/types/vendorTypes";
import { showToastMessage } from "@/validations/common/toast";
const AvailableDate = () => {
  const [vendor, setVendor] = useState<VendorData | undefined>(undefined);
  const navigate = useNavigate();

  const fetchProfileData = useCallback(async () => {
    try {
      const data = await fetchVendorProfileApi();
      setVendor(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error instanceof Error) {
        showToastMessage(error.message || "Error loading profile", "error");
      } else {
        showToastMessage("An unknown error occurred", "error");
      }
      navigate(VENDOR.LOGIN);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  return (
    <>
      <UnifiedCalendar
        isVendor={true}
        vendorDetails={vendor}
        axiosInstance={axiosInstanceVendor}
      />
      <Footer />
    </>
  );
};

export default AvailableDate;
