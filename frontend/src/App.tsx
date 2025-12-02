import React, { useEffect, useState } from "react";
import Loader from "./components/common/Loader";
import { NextUIProvider } from "@nextui-org/react";
import UserRoutes from "./routes/userRoutes";
import { Routes,Route } from "react-router-dom";
import { useAuthCheck } from "./hooks/user/useAuthCheck";
import './index.css'
import AdminRoutes from "./routes/adminRoute";
import { VendorRoutes } from "./routes/vendorRoutes";





const App : React.FC = () => {
    const [loading,setLoading] = useState<boolean>(true)
    
    useAuthCheck()

 useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, [])

  if (loading) {
    return <Loader />;
  }

    return (
        <NextUIProvider>
             
             <React.Suspense fallback = {<Loader/>}>
             <Routes>
                <Route path="/*" element = {<UserRoutes/>}/>
                <Route path="/admin/*" element={<AdminRoutes/>}/>
                <Route path="/vendor/*" element={<VendorRoutes/>} />
              
             </Routes>
             </React.Suspense>
        </NextUIProvider>
    )
}


export default App