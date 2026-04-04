import {
  LayoutDashboard,
  Users,
  Store,
  FileText,
  ShoppingBag,
  Flag,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { ADMIN } from "@/config/constants/constants";
import { logout } from "@/redux/slices/AdminSlice";
import { adminLogoutService } from "@/services/adminAuthService";
import { showToastMessage } from "@/validations/common/toast";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string | null;
  badge?: number;
}

const Layout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        path: `/admin${ADMIN.DASHBOARD}`,
      },
      { icon: Users, label: "Users", path: `/admin${ADMIN.USERS}` },
      { icon: Store, label: "Vendors", path: `/admin${ADMIN.VENDORS}` },
      { icon: FileText, label: "Posts", path: "/admin/view-all-posts" },
      {
        icon: ShoppingBag,
        label: "Bookings",
        path: `/admin${ADMIN.ALLBOOKINGS}`,
      },
      { icon: Flag, label: "Reports", path: `/admin${ADMIN.REPORT}` },
    ],
    [],
  );

  const activeItem = useMemo(() => {
    const currentPath = location.pathname;
    const found = menuItems.find(
      (item) => item.path && currentPath.includes(item.path),
    );
    return found ? found.label : "Dashboard";
  }, [location.pathname, menuItems]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsCollapsed(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuClick = async (item: MenuItem) => {
    if (item.path) navigate(item.path);
    if (isMobile) setIsCollapsed(true);
  };

  const handleLogout = async () => {
    try {
      await adminLogoutService();
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminRefresh");
      dispatch(logout());
      navigate(`/admin${ADMIN.LOGIN}`);
      showToastMessage("Logged out successfully", "success");
    } catch {
      showToastMessage("Error during logout", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-30 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[68px]" : "w-60"
        }`}
        style={{ background: "#0f0f0f" }}
      >
        {/* Logo */}
        <div
          className={`flex items-center h-16 px-4 border-b border-white/5 flex-shrink-0 ${isCollapsed ? "justify-center" : "justify-between"}`}
        >
          {!isCollapsed && (
            <Link
              to={`/admin${ADMIN.DASHBOARD}`}
              className="flex items-center gap-2.5"
            >
              {/* Logo mark */}
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                <div className="w-3.5 h-3.5 rounded-sm bg-black" />
              </div>
              <span className="text-white font-bold text-sm tracking-wide">
                bookmystills
              </span>
            </Link>
          )}

          {isCollapsed && (
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-sm bg-black" />
            </div>
          )}

          {/* Toggle button */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="mx-auto mt-3 p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Nav section label */}
        {!isCollapsed && (
          <p className="px-4 pt-5 pb-2 text-[10px] font-semibold text-white/20 uppercase tracking-widest">
            Main Menu
          </p>
        )}

        {/* Nav Items */}
        <nav
          className={`flex-1 px-2 ${isCollapsed ? "mt-3" : "mt-1"} space-y-0.5 overflow-y-auto`}
        >
          {menuItems.map((item) => {
            const isActive = activeItem === item.label;
            return (
              <button
                key={item.label}
                onClick={() => handleMenuClick(item)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative ${
                  isActive
                    ? "bg-white text-black"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                <item.icon
                  className={`flex-shrink-0 h-4 w-4 ${isActive ? "text-black" : "text-white/40 group-hover:text-white"}`}
                />

                {!isCollapsed && (
                  <span
                    className={`text-sm font-medium flex-1 text-left ${isActive ? "text-black" : ""}`}
                  >
                    {item.label}
                  </span>
                )}

                {/* Active indicator */}
                {isActive && !isCollapsed && (
                  <div className="w-1 h-4 rounded-full bg-black/20 flex-shrink-0" />
                )}

                {/* Tooltip for collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-white text-black text-xs font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-white" />
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 border-t border-white/5 my-2" />

        {/* Logout */}
        <div className="px-2 pb-4">
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Log Out" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 group relative ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="flex-shrink-0 h-4 w-4" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Log Out</span>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-white text-black text-xs font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Log Out
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-white" />
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isCollapsed ? "ml-[68px]" : "ml-60"
        }`}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-20 h-16 bg-white border-b border-gray-100 flex items-center px-6 shadow-sm">
          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              {activeItem}
            </h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
