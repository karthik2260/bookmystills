import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@nextui-org/react";
import {
  LogOut,
  User,
  ChevronDown,
  Aperture,
  ArrowUpRight,
} from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { USER } from "../../config/constants/constants";
import { logout } from "../../redux/slices/UserSlice";
import { showToastMessage } from "../../validations/common/toast";

import type UserRootState from "@/redux/rootstate/UserState";
import { logoutUser } from "@/services/userAuthService";

const NAV_LINKS = [
  { label: "Home", to: USER.HOME },
  { label: "Post", to: USER.POST },
  { label: "Vendors", to: USER.VENDORLIST },
  { label: "Bookings", to: USER.BOOKING },
  { label: "About Us", to: USER.ABOUT_US },
];

export default function UserNavbar() {
  const user = useSelector((state: UserRootState) => state.user.userData);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      localStorage.removeItem("userToken");
      dispatch(logout());
      navigate(USER.LOGIN);
      showToastMessage("Logged out successfully", "success");
    } catch {
      showToastMessage("Error during logout", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = (to: string) => location.pathname === to;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Figtree:wght@300;400;500;600&display=swap');

        :root {
          --ink:    #0f0f0f;
          --ink2:   #6b6b6b;
          --ink3:   #b0b0b0;
          --paper:  #ffffff;
          --paper2: #f7f7f5;
          --paper3: #efefed;
          --accent: #e8441a;
          --accent2:#ff6b42;
          --border: rgba(15,15,15,0.08);
        }

        /* ── Shell ── */
        .lw-nav {
          font-family: 'Figtree', sans-serif;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(18px) saturate(140%);
          -webkit-backdrop-filter: blur(18px) saturate(140%);
          border-bottom: 1px solid var(--border);
          transition: box-shadow 0.3s ease, background 0.3s ease;
        }
        .lw-nav.scrolled {
          background: rgba(255,255,255,0.99);
          box-shadow: 0 1px 0 var(--border), 0 4px 32px rgba(0,0,0,0.06);
        }

        /* ── Brand ── */
        .lw-brand {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .lw-brand-dot {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
          margin-left: 2px;
          margin-bottom: 6px;
          vertical-align: bottom;
        }
        .lw-logo-wrap {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: var(--ink);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* ── Nav links ── */
        .lw-link {
          font-family: 'Figtree', sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--ink3);
          text-decoration: none;
          position: relative;
          padding-bottom: 2px;
          transition: color 0.18s ease;
        }
        .lw-link:hover { color: var(--ink); }
        .lw-link.active { color: var(--ink); }
        .lw-link.active::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0; right: 0;
          height: 1.5px;
          background: var(--accent);
          border-radius: 2px;
        }

        /* ── Pill trigger ── */
        .lw-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 10px 4px 4px;
          border-radius: 100px;
          border: 1.5px solid var(--border);
          background: var(--paper2);
          cursor: pointer; outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .lw-pill:hover {
          border-color: rgba(15,15,15,0.2);
          background: var(--paper);
          box-shadow: 0 2px 12px rgba(0,0,0,0.07);
        }
        .lw-pill-name {
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--ink2);
          max-width: 88px; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }

        /* ── Dropdown ── */
        .lw-panel {
          background: #ffffff !important;
          border: 1.5px solid rgba(15,15,15,0.09) !important;
          border-radius: 16px !important;
          padding: 7px !important;
          min-width: 220px !important;
          box-shadow: 0 8px 48px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06) !important;
        }
        .lw-user-tile {
          background: var(--paper2);
          border: 1px solid var(--border);
          border-radius: 11px;
          padding: 11px 13px;
          margin-bottom: 5px;
        }
        .lw-dd {
          font-family: 'Figtree', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--ink2);
          border-radius: 10px;
          transition: background 0.14s, color 0.14s;
          padding: 9px 12px;
        }
        .lw-dd:hover {
          background: var(--paper2) !important;
          color: var(--ink) !important;
        }
        .lw-dd-out { color: var(--accent) !important; opacity: 0.7; }
        .lw-dd-out:hover {
          background: rgba(232, 68, 26, 0.07) !important;
          color: var(--accent) !important;
          opacity: 1;
        }

        /* ── Tag/badge on active link ── */
        .lw-active-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--accent);
          position: absolute;
          top: -5px; right: -6px;
        }

        /* ── Mobile menu ── */
        .lw-mobile {
          background: #ffffff !important;
          border-top: 1px solid var(--border);
        }
        .lw-mlink {
          font-family: 'Figtree', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--ink3);
          text-decoration: none;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
          transition: color 0.18s;
          font-family: 'Playfair Display', serif;
        }
        .lw-mlink:hover, .lw-mlink.active { color: var(--ink); }

        /* ── Scroll reveal animation ── */
        @keyframes navSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lw-nav { animation: navSlideDown 0.4s ease both; }
      `}</style>

      <Navbar
        onMenuOpenChange={setIsMenuOpen}
        isMenuOpen={isMenuOpen}
        className={`lw-nav ${scrolled ? "scrolled" : ""}`}
        maxWidth="xl"
        height="64px"
      >
        {/* Mobile toggle */}
        <NavbarContent className="sm:hidden" justify="start">
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="text-black/40 hover:text-black/70 transition-colors"
          />
        </NavbarContent>

        {/* Brand */}
        <NavbarBrand className="gap-2.5 shrink-0">
          <div className="lw-logo-wrap">
            <Aperture className="w-4 h-4 text-white" strokeWidth={1.75} />
          </div>
          <span className="lw-brand">
            BookMystills
            <span className="lw-brand-dot" />
          </span>
        </NavbarBrand>

        {/* Desktop links */}
        <NavbarContent className="hidden sm:flex gap-8" justify="center">
          {NAV_LINKS.map(({ label, to }) => (
            <NavbarItem key={label}>
              <Link
                to={to}
                className={`lw-link ${isActive(to) ? "active" : ""}`}
              >
                {isActive(to) && <span className="lw-active-badge" />}
                {label}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        {/* Right — pill + dropdown */}
        <NavbarContent justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <button className="lw-pill">
                <Avatar
                  size="sm"
                  src={user?.imageUrl || "/images/user.png"}
                  classNames={{
                    base: "w-[27px] h-[27px] border-[1.5px] border-black/10",
                  }}
                />
                <span className="lw-pill-name hidden sm:block">
                  {user?.name?.split(" ")[0] || "Account"}
                </span>
                <ChevronDown
                  size={12}
                  strokeWidth={2.5}
                  className="text-black/25 hidden sm:block"
                />
              </button>
            </DropdownTrigger>

            <DropdownMenu
              aria-label="User menu"
              classNames={{ base: "lw-panel" }}
            >
              {/* User tile */}
              <DropdownItem
                key="info"
                isReadOnly
                textValue="user"
                className="p-0 mb-1 opacity-100 cursor-default data-[hover=true]:bg-transparent"
              >
                <div className="lw-user-tile flex items-center gap-3">
                  <Avatar
                    size="sm"
                    src={user?.imageUrl || "/images/user.png"}
                    classNames={{
                      base: "w-9 h-9 shrink-0 border border-black/10",
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-[#0f0f0f] text-[0.82rem] font-semibold leading-snug truncate">
                      {user?.name || "My Account"}
                    </p>
                    <p className="text-[#b0b0b0] text-[0.69rem] mt-0.5 truncate">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>
              </DropdownItem>

              <DropdownItem
                key="profile"
                className="lw-dd"
                startContent={
                  <User size={13} strokeWidth={2} className="text-black/35" />
                }
                onPress={() => navigate(USER.PROFILE)}
                textValue="Profile"
              >
                View Profile
              </DropdownItem>

              <DropdownItem
                key="sep"
                isReadOnly
                textValue="-"
                className="h-px bg-black/[0.06] p-0 min-h-0 my-1 rounded-none"
              />

              <DropdownItem
                key="logout"
                className="lw-dd lw-dd-out"
                startContent={<LogOut size={13} strokeWidth={2} />}
                onPress={handleLogout}
                textValue="Sign Out"
              >
                {isLoading ? "Signing out…" : "Sign Out"}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>

        {/* Mobile full-screen menu */}
        <NavbarMenu className="lw-mobile pt-6 px-6 pb-10">
          {NAV_LINKS.map(({ label, to }) => (
            <NavbarMenuItem key={label}>
              <Link
                to={to}
                className={`lw-mlink ${isActive(to) ? "active" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span>{label}</span>
                <ArrowUpRight
                  size={18}
                  className={isActive(to) ? "text-[#e8441a]" : "text-black/15"}
                />
              </Link>
            </NavbarMenuItem>
          ))}

          {/* Mobile user row */}
          <NavbarMenuItem>
            <div className="mt-8 pt-6 border-t border-black/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  size="sm"
                  src={user?.imageUrl || "/images/user.png"}
                  classNames={{ base: "border border-black/10" }}
                />
                <div>
                  <p className="text-[#0f0f0f] text-[0.82rem] font-medium">
                    {user?.name || "My Account"}
                  </p>
                  <p className="text-[#b0b0b0] text-[0.68rem]">
                    {user?.email || ""}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-[#e8441a] text-[0.68rem] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity font-semibold"
              >
                {isLoading ? "…" : "Sign out"}
              </button>
            </div>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
    </>
  );
}
