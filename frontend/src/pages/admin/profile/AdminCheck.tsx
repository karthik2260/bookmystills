import { Layout } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Loader from "@/components/common/Loader";
import type AdminRootState from "@/redux/rootstate/AdminState";
const AdminCheck: React.FC = () => {
  const isAdminSignedIn = useSelector(
    (state: AdminRootState) => state.admin.isAdminSignedIn,
  );
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <>
      <ToastContainer />
      {isAdminSignedIn ? (
        <Layout>{loading ? <Loader /> : <Outlet />}</Layout>
      ) : (
        <div className="mainContent flex-1 ml-50">
          <Outlet />
        </div>
      )}
    </>
  );
};

export default AdminCheck;
