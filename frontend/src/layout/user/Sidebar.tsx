import { USER } from "@/config/constants/constants";
import { logout } from "@/redux/slices/UserSlice";
import { logoutUser } from "@/services/userAuthService";
import { showToastMessage } from "@/validations/common/toast";
import {
  ChatBubbleBottomCenterIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { PowerIcon, ShoppingBagIcon, UserCircleIcon, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string | null;
  badge?: string | null;
}

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setCollapsed(w < 1024);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const menuItems: MenuItem[] = useMemo(() => [
    { icon: UserCircleIcon,             label: "Profile", path: USER.PROFILE },
    { icon: Wallet,                     label: "Wallet",  path: "/wallet"   },
    { icon: ShoppingBagIcon,            label: "Booking", path: "/booking"  },
    { icon: ChatBubbleBottomCenterIcon, label: "Chats",   path: "/chats"    },
    { icon: UserGroupIcon,              label: "Vendors", path: "/vendors"  },
  ], []);

  const handleClick = async (item: MenuItem) => {
    if (item.label === "Log Out") {
      try {
        await logoutUser();
        localStorage.removeItem("userToken");
        dispatch(logout());
        navigate(USER.LOGIN);
        showToastMessage("Logged out successfully", "success");
      } catch {
        showToastMessage("Error during logout", "error");
      }
      return;
    }
    if (item.path) navigate(item.path);
    if (isMobile) setCollapsed(true);
  };

  const isActive = (item: MenuItem) =>
    item.path ? location.pathname.startsWith(item.path) : false;

  return (
    <aside style={{
      display: "flex", flexDirection: "column", minHeight: "100vh",
      width: collapsed ? "64px" : "220px",
      background: "#ffffff", borderRight: "1px solid #e5e7eb",
      transition: "width 0.25s ease", overflow: "hidden", flexShrink: 0,
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        padding: collapsed ? "20px 0" : "20px 16px",
        borderBottom: "1px solid #f3f4f6", minHeight: "64px",
      }}>
        {!collapsed && (
          <Link to={USER.HOME} style={{
            fontSize: "15px", fontWeight: 600, color: "#111827",
            textDecoration: "none", letterSpacing: "-0.01em", whiteSpace: "nowrap",
          }}>
            bookmystills
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            padding: "6px", borderRadius: "6px", color: "#9ca3af",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s ease, color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#f3f4f6";
            (e.currentTarget as HTMLElement).style.color = "#374151";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#9ca3af";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            {collapsed
              ? <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              : <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            }
          </svg>
        </button>
      </div>

      {/* Nav Items */}
      <nav style={{
        flex: 1, padding: "12px 8px",
        display: "flex", flexDirection: "column", gap: "2px",
      }}>
        {menuItems.map((item) => {
          const active = isActive(item);
          return (
            <div
              key={item.label}
              title={collapsed ? item.label : undefined}
              onClick={() => handleClick(item)}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: collapsed ? "10px 0" : "10px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: "8px", cursor: "pointer",
                background: active ? "#eff6ff" : "transparent",
                color: active ? "#2563eb" : "#6b7280",
                fontWeight: active ? 500 : 400, fontSize: "14px",
                transition: "all 0.15s ease", whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "#f9fafb";
                  (e.currentTarget as HTMLElement).style.color = "#111827";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#6b7280";
                }
              }}
            >
              <item.icon style={{ width: "18px", height: "18px", flexShrink: 0, color: "inherit" }} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.badge && (
                <span style={{
                  marginLeft: "auto", fontSize: "11px", fontWeight: 500,
                  background: "#dbeafe", color: "#1d4ed8",
                  padding: "2px 7px", borderRadius: "20px",
                }}>
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: "1px", background: "#f3f4f6", margin: "0 8px" }} />

      {/* Logout */}
      <div style={{ padding: "12px 8px" }}>
        <div
          title={collapsed ? "Log Out" : undefined}
          onClick={() => handleClick({ icon: PowerIcon, label: "Log Out", path: null })}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: collapsed ? "10px 0" : "10px 12px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: "8px", cursor: "pointer",
            color: "#9ca3af", fontSize: "14px", fontWeight: 400,
            transition: "all 0.15s ease", whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#fef2f2";
            (e.currentTarget as HTMLElement).style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#9ca3af";
          }}
        >
          <PowerIcon style={{ width: "18px", height: "18px", flexShrink: 0, color: "inherit" }} />
          {!collapsed && <span>Log Out</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;