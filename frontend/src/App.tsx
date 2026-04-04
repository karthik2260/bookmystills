import { NextUIProvider } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Loader from "./components/common/Loader";
import { useAuthCheck } from "./hooks/user/useAuthCheck";
import AdminRoutes from "./routes/adminRoute";
import UserRoutes from "./routes/userRoutes";
import { VendorRoutes } from "./routes/vendorRoutes";

import "./index.css";

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useAuthCheck();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <NextUIProvider>
      <React.Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/*" element={<UserRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/vendor/*" element={<VendorRoutes />} />
        </Routes>
      </React.Suspense>
    </NextUIProvider>
  );
};

export default App;
