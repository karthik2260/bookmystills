import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux"
import { ToastContainer } from "react-toastify";
import { Layout } from "lucide-react";
import { Outlet } from "react-router-dom";
import AdminRootState from "@/redux/rootstate/AdminState";
import Loader from "@/components/common/Loader";
const AdminCheck: React.FC = () => {
    const isAdminSignedIn = useSelector((state: AdminRootState) => state.admin.isAdminSignedIn);
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        setTimeout(() => setLoading(false), 1000);
    }, []);

    return (
        <>
            <ToastContainer />
            {
                isAdminSignedIn ? (
                    <Layout>
                        {loading ? <Loader /> : <Outlet />}
                    </Layout>
                ) : (
                    <div className="mainContent flex-1 ml-50">
                        <Outlet />
                    </div>
                )
            }
        </>
    )
}

export default AdminCheck