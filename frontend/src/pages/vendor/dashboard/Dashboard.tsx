import { useEffect } from "react";
import { useSelector } from "react-redux";

import Footer from "../../../layout/user/footer";
import VendorNavbar from "../../../layout/vendor/VendorNavbar";

import HeroBannerVendor from "./HeroBannerVendor";
import MainSectionVendor from "./MainSectionVendor";

import DynamicBackground from "@/components/common/DynamicBackground";
import RejectionBanner from "@/components/vendor/RejectionBanner";
import type VendorRootState from "@/redux/rootstate/VendorState";

const Dashboard = () => {
  const vendorData = useSelector(
    (state: VendorRootState) => state.vendor.vendorData,
  );

  useEffect(() => {
    console.log("Current vendor Redux state:", vendorData);
    console.log("isAccepted value:", vendorData?.isAccepted);
  }, [vendorData]);

 

  const isAccepted = vendorData?.isAccepted;

  const isLocked =
    isAccepted === "requested" ||
    isAccepted === "rejected" ||
    isAccepted === "reapplied";

  return (
    <>
      <VendorNavbar />

      {isAccepted && isAccepted !== "accepted" && (
        <RejectionBanner
          isAccepted={isAccepted}
          rejectionReason={vendorData?.rejectionReason}
        />
      )}

      {isLocked ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Dashboard Locked
          </h2>
          <p className="text-sm text-gray-500 max-w-sm">
            Your dashboard features will be unlocked once your account is
            verified by our admin team.
          </p>
        </div>
      ) : (
        <>
          <HeroBannerVendor />
          <MainSectionVendor />
          <DynamicBackground
            filepath="/images/vendor1.jpg"
            height="h-[550px]"
            type="image"
            className="w-full"
          />
        </>
      )}

      <Footer />
    </>
  );
};

export default Dashboard;
