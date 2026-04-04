import React from "react";
import { Routes, Route } from "react-router-dom";

import ErrorBoundary from "@/components/common/ErrorBoundary";
import { ADMIN } from "@/config/constants/constants";
import Layout from "@/layout/admin/layout";
import Login from "@/pages/admin/auth/Login";
import Dashboard from "@/pages/admin/profile/Dashboard";
import UserList from "@/pages/admin/profile/userList";
import VendorList from "@/pages/admin/profile/vendorList";
import UnifiedPrivateRoute from "@/pages/PrivateRouteProps";

const AdminRoutes: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route>
          <Route index path={ADMIN.LOGIN} element={<Login />} />
          <Route path="" element={<UnifiedPrivateRoute routeType="admin" />}>
            <Route element={<Layout />}>
              <Route path={ADMIN.DASHBOARD} element={<Dashboard />} />
              <Route path={ADMIN.VENDORS} element={<VendorList />} />
              <Route path={ADMIN.USERS} element={<UserList />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </ErrorBoundary>
  );
};

export default AdminRoutes;
