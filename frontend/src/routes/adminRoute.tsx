import React from "react";
import { Routes,Route } from "react-router-dom";
import { ADMIN } from "@/config/constants/constants";
import Login from "@/pages/admin/auth/Login";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import UnifiedPrivateRoute from "@/pages/PrivateRouteProps";
import Dashboard from "@/pages/admin/profile/Dashboard";

const AdminRoutes : React.FC = () => {
    return (
        <ErrorBoundary>
            <Routes>
                <Route>
                    <Route index path={ADMIN.LOGIN} element={<Login/>}/>
                  <Route path={ADMIN.DASHBOARD} element={<Dashboard />} />
                    
                    

                    
                </Route>
            </Routes>



        </ErrorBoundary>
    )
}

export default AdminRoutes
   
