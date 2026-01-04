import React from "react";
import { Routes,Route } from "react-router-dom";
import { ADMIN } from "@/config/constants/constants";
import Login from "@/pages/admin/auth/Login";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import UnifiedPrivateRoute from "@/pages/PrivateRouteProps";
import Dashboard from "@/pages/admin/profile/Dashboard";
import Layout from "@/layout/admin/layout";
import VendorList from "@/pages/admin/profile/vendorList";


const AdminRoutes : React.FC = () => {
    return (
        <ErrorBoundary>
            <Routes>
                <Route>
                    <Route index path={ADMIN.LOGIN} element={<Login/>}/>
                      <Route path='' element={<UnifiedPrivateRoute routeType="admin" />}>
                    <Route element={<Layout/>}>
                  <Route path={ADMIN.DASHBOARD} element={<Dashboard />} />
                  <Route path={ADMIN.VENDORS} element={<VendorList/>} />
                  
                    </Route>
                    

                    </Route>
                </Route>
            </Routes>



        </ErrorBoundary>
    )
}

export default AdminRoutes
   
