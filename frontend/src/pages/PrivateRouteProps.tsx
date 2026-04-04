import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

import { USER, VENDOR, ADMIN } from "../config/constants/constants";
import type AdminRootState from "../redux/rootstate/AdminState";
import type UserRootState from "../redux/rootstate/UserState";
import type VendorRootState from "../redux/rootstate/VendorState";
// import { useBlockCheck } from '../hooks/user/useBlockCheck';

type RouteType = "user" | "vendor" | "admin";

interface PrivateRouteProps {
  routeType: RouteType;
}

const UnifiedPrivateRoute: React.FC<PrivateRouteProps> = ({ routeType }) => {
  const userState = useSelector((state: UserRootState) => state.user.userData);

  const userSignedIn = useSelector(
    (state: UserRootState) => state.user.isUserSignedIn,
  );
  console.log("AUTH CHECK =>", userSignedIn, userState);

  const vendorState = useSelector(
    (state: VendorRootState) => state.vendor.vendorData,
  );
  const vendorSignedIn = useSelector(
    (state: VendorRootState) => state.vendor.isVendorSignedIn,
  );

  const adminSignedIn = useSelector(
    (state: AdminRootState) => state.admin.isAdminSignedIn,
  );

  // useBlockCheck(routeType)
  console.log("PrivateRoute check => ", {
    userSignedIn,
    userState,
  });

  const getRedirectPath = (type: RouteType): string => {
    switch (type) {
      case "user":
        return USER.LOGIN;
      case "vendor":
        return VENDOR.LOGIN;
      case "admin":
        return `/admin${ADMIN.LOGIN}`;
      default:
        return USER.LOGIN;
    }
  };

  const isAuthenticated = (type: RouteType): boolean => {
    switch (type) {
      case "user": {
        const token = localStorage.getItem("userToken");
        return !!token;
      }

      case "vendor": {
        const vendorToken = localStorage.getItem("vendorToken");
        if (!vendorSignedIn || !vendorToken) return false;

        // Only block if admin manually blocked an accepted vendor
        if (
          vendorState?.isActive === false &&
          vendorState?.isAccepted === "accepted"
        )
          return false;

        return true; // ✅ rejected/reapplied/pending all get through
      }

      case "admin":
        return adminSignedIn;

      default:
        return false;
    }
  };

  return isAuthenticated(routeType) ? (
    <Outlet />
  ) : (
    <Navigate to={getRedirectPath(routeType)} replace />
  );
};

export default UnifiedPrivateRoute;
