import { Route,Routes } from "react-router-dom"
import PublicRoute from "../pages/PublicRouteProps"
import {USER} from '../config/constants/constants'
import UserSignup from '../pages/user/auth/Signup'
import ErrorBoundary from "../components/common/ErrorBoundary";
import TVScreen from "../components/common/404";
import React from "react";
import UserLogin from "../pages/user/auth/Login";
import UnifiedPrivateRoute from "@/pages/PrivateRouteProps";
import Home from "@/pages/user/home/Home";
import VerifyEmail from "@/pages/common/verifyEmail";
import ResetPassword from "@/pages/user/auth/ResetPassword";
import UserProfile from "@/pages/user/profile/userProfile";
const UserRoutes : React.FC = () => {
    return (
        <Routes>
            <Route element={<PublicRoute routeType="user"/>}>
            <Route path={USER.SIGNUP} element={<ErrorBoundary><UserSignup/></ErrorBoundary>}/>
            <Route path={USER.LOGIN} element={<ErrorBoundary><UserLogin /></ErrorBoundary>} />
             <Route path={USER.VERIFY} element={<ErrorBoundary><VerifyEmail /></ErrorBoundary>} />
        <Route path={USER.FORGOT_PWDMAIL} element={<ErrorBoundary><ResetPassword /></ErrorBoundary>} />


            </Route>

            <Route element={<UnifiedPrivateRoute routeType="user"/>}>
            <Route path={USER.HOME} element={<ErrorBoundary><Home/></ErrorBoundary>}/>
            <Route path={`${USER.PROFILE}`} element={<ErrorBoundary><UserProfile/></ErrorBoundary>}/>
            


            </Route>

            

            <Route path="*" element={<TVScreen/>}/>
        </Routes>
    )
}


export default UserRoutes