import { Route, Routes } from "react-router-dom";

import CreatePost from "../pages/vendor/posts/createPost";
import Posts from "../pages/vendor/posts/posts";

import TVScreen from "@/components/common/404";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import VerifyEmailVendor from "@/pages/common/verifyVendorotp";
import UnifiedPrivateRoute from "@/pages/PrivateRouteProps";
import PublicRoute from "@/pages/PublicRouteProps";
import ResetPassword from "@/pages/user/auth/ResetPassword";
import VendorLogin from "@/pages/vendor/auth/VendorLogin";
import VendorSignUp from "@/pages/vendor/auth/VendorSignup";
import AvailableDate from "@/pages/vendor/bookings/AvailableDate";
import Dashboard from "@/pages/vendor/dashboard/Dashboard";
import VendorProfile from "@/pages/vendor/profile/vendorProfile";

export const VendorRoutes = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<PublicRoute routeType="vendor" />}>
          <Route path="/signup" element={<VendorSignUp />} />
          <Route path="/login" element={<VendorLogin />} />
          <Route path="/verify-email" element={<VerifyEmailVendor />} />
          <Route path="/forgot-password/:token" element={<ResetPassword />} />
        </Route>
        <Route element={<UnifiedPrivateRoute routeType="vendor" />}>
          <Route path={`/dashboard`} element={<Dashboard />} />
          <Route path={`/profile/*`} element={<VendorProfile />} />
          <Route path={`/view-posts`} element={<Posts />} />
          <Route path={`/add-post`} element={<CreatePost />} />
          <Route path={`/dateAvailabilty`} element={<AvailableDate />} />
        </Route>
        <Route path="*" element={<TVScreen />} />
      </Routes>
    </ErrorBoundary>
  );
};
