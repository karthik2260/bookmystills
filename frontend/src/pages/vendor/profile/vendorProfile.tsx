import { Card } from "@material-tailwind/react";
import { Avatar } from "@nextui-org/react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Mail,
  Phone,
  Shield,
  Clock,
  Pencil,
  KeyRound,
  Camera,
  Star,
  BookMarked,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import Loader from "../../../components/common/Loader";
import { VENDOR } from "../../../config/constants/constants";
import SidebarVendor from "../../../layout/vendor/SidebarProfileVendor";
import type { vendorProfileData } from "../../../types/vendorTypes";
import { VendorData } from "../../../types/vendorTypes";
import { showToastMessage } from "../../../validations/common/toast";

import EditProfileModalVendor from "./editProfileVendor";

import type {
  PasswordFormData,
} from "@/pages/common/changePassword";
import ChangePasswordModal from "@/pages/common/changePassword";
import { setVendorInfo } from "@/redux/slices/VendorSlice";
import {
  changeVendorPassword,
  getVendorProfile,
  updateVendorProfile,
} from "@/services/vendorAuthService";


function VendorProfile() {
  const [vendor, setVendor] = useState<vendorProfileData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchProfileData = useCallback(async () => {
    try {
      const token = localStorage.getItem("vendorToken");
      if (!token) {
        showToastMessage("Authentication required", "error");
        navigate(VENDOR.LOGIN);
        return;
      }
      const response = await getVendorProfile();
      setVendor(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      showToastMessage(
        error instanceof Error ? error.message : "Error loading profile",
        "error",
      );
      navigate(VENDOR.LOGIN);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleSaveProfile = useCallback(
    async (updates: FormData) => {
      try {
        const token = localStorage.getItem("vendorToken");
        if (!token) {
          showToastMessage("Authentication required", "error");
          return;
        }
        const response = await updateVendorProfile(updates);
        setVendor(response.data);
        dispatch(setVendorInfo(response.data));
        showToastMessage("Profile updated successfully", "success");
      } catch {
        showToastMessage("Error updating profile", "error");
      }
    },
    [dispatch],
  );

  const handlePasswordChange = async (passwordData: PasswordFormData) => {
    try {
      await changeVendorPassword(passwordData);
      showToastMessage("Password changed successfully", "success");
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  };

  const formatDate = useCallback(
    (dateString: string) =>
      new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  if (!vendor)
    return (
      <div>
        <Loader />
      </div>
    );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&family=Satoshi:wght@300;400;500;700&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&f[]=satoshi@300,400,500,700&display=swap');

        .vp-wrap { font-family: 'Satoshi', 'DM Sans', sans-serif; }

        .vp-cover-img {
          width: 100%; height: 100%; object-fit: cover;
          filter: brightness(0.78) saturate(1.15);
        }
        .vp-cover-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(15,15,15,0.65) 0%, rgba(15,15,15,0.15) 55%, transparent 100%);
        }
        .vp-cover-text {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 4px;
        }
        .vp-company {
          font-size: clamp(1.6rem, 4vw, 2.6rem);
          font-weight: 700; color: #fff;
          letter-spacing: -0.02em; line-height: 1.1;
          text-shadow: 0 2px 16px rgba(0,0,0,0.4);
        }
        .vp-city {
          font-size: 1rem; color: rgba(255,255,255,0.75);
          font-weight: 400; letter-spacing: 0.04em;
          display: flex; align-items: center; gap: 5px;
        }

        .vp-avatar-shell { position: relative; display: inline-block; }
        .vp-avatar-shell > * {
          border: 3px solid #fff !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18) !important;
        }
        .vp-cam-btn {
          position: absolute; bottom: 2px; right: 2px;
          width: 26px; height: 26px; border-radius: 50%;
          background: #111; border: 2px solid #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.18s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .vp-cam-btn:hover { background: #333; }

        .vp-name {
          font-size: 1.55rem; font-weight: 700; color: #0f0f0f;
          letter-spacing: -0.025em; line-height: 1.15;
        }
        .vp-contact {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.83rem; color: #6b7280; font-weight: 400;
        }

        .vp-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 11px; border-radius: 100px;
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.04em; text-transform: uppercase;
        }
        .vp-chip-green  { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .vp-chip-gray   { background: #f4f4f5; color: #71717a; border: 1px solid #e4e4e7; }
        .vp-chip-violet { background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; }

        .vp-section {
          background: #fafafa; border: 1px solid #ebebeb;
          border-radius: 14px; padding: 20px;
        }
        .vp-section-title {
          font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: #a1a1aa; margin-bottom: 14px;
        }

        .vp-info-row {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 0; border-bottom: 1px solid #f0f0f0;
          font-size: 0.82rem;
        }
        .vp-info-row:last-child { border-bottom: none; }
        .vp-icon-box {
          width: 30px; height: 30px; border-radius: 8px;
          background: #f4f4f5;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .vp-info-label { color: #a1a1aa; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .vp-info-val   { color: #0f0f0f; font-weight: 500; font-size: 0.82rem; }

        .vp-about-box {
          background: #fafafa; border: 1px solid #ebebeb;
          border-radius: 10px; padding: 12px 14px;
          font-size: 0.83rem; color: #374151;
          line-height: 1.6; font-weight: 400;
        }

        .vp-stat {
          background: #fff; border: 1px solid #ebebeb;
          border-radius: 12px; padding: 16px; text-align: center;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .vp-stat:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); transform: translateY(-2px); }
        .vp-stat-icon  { margin: 0 auto 8px; width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
        .vp-stat-num   { font-size: 1.6rem; font-weight: 700; color: #0f0f0f; line-height: 1; }
        .vp-stat-lbl   { font-size: 0.7rem; font-weight: 600; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 3px; }

        .vp-btn-dark {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 9px;
          background: #0f0f0f; color: #fff;
          font-size: 0.8rem; font-weight: 600;
          border: none; cursor: pointer;
          transition: background 0.18s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .vp-btn-dark:hover { background: #2a2a2a; transform: translateY(-1px); }

        .vp-btn-light {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 9px;
          background: #fff; color: #0f0f0f;
          font-size: 0.8rem; font-weight: 600;
          border: 1.5px solid #e4e4e7; cursor: pointer;
          transition: border-color 0.18s, box-shadow 0.18s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .vp-btn-light:hover { border-color: #d4d4d8; box-shadow: 0 2px 10px rgba(0,0,0,0.07); transform: translateY(-1px); }
      `}</style>

      <div className="flex vp-wrap">
        <div>
          <SidebarVendor />
        </div>

        <section className="container mx-auto">
          <Card
            className="w-full mb-6"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            style={{
              borderRadius: "18px",
              overflow: "hidden",
              border: "1px solid #ebebeb",
              boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
            }}
          >
            {/* ── Cover ── */}
            <motion.div
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative h-64 w-full overflow-hidden"
            >
              <img
                src="/images/cate1.jpg"
                alt="Cover"
                className="vp-cover-img"
              />
              <div className="vp-cover-overlay" />
              <div className="vp-cover-text">
                <h1 className="vp-company">{vendor.companyName}</h1>
                {vendor.city && (
                  <p className="vp-city">
                    <MapPin size={13} />
                    {vendor.city}
                  </p>
                )}
              </div>
            </motion.div>

            {/* ── Identity ── */}
            <div className="relative px-6 py-8">
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.18, duration: 0.5 }}
                className="flex flex-wrap justify-between items-start gap-4"
              >
                {/* Avatar + name */}
                <div className="flex items-center gap-6">
                  <div className="vp-avatar-shell">
                    <Avatar
                      size="lg"
                      className="h-32 w-32 ring-4 ring-white -mt-20 relative"
                      src={vendor?.imageUrl || "/images/user.png"}
                    />
                    <div
                      className="vp-cam-btn"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      <Camera size={11} color="#fff" strokeWidth={2.5} />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <h2 className="vp-name">{vendor.name}</h2>
                      {vendor.isVerified && (
                        <CheckCircle2
                          size={18}
                          color="#16a34a"
                          strokeWidth={2}
                        />
                      )}
                    </div>
                    <div className="vp-contact">
                      <Mail size={13} color="#9ca3af" />
                      <span>{vendor.email}</span>
                    </div>
                    <div className="vp-contact">
                      <Phone size={13} color="#9ca3af" />
                      <span>{vendor.contactinfo || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Chips */}
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`vp-chip ${vendor.isActive ? "vp-chip-green" : "vp-chip-gray"}`}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: vendor.isActive ? "#16a34a" : "#71717a",
                        display: "inline-block",
                      }}
                    />
                    {vendor.isActive ? "Active" : "Inactive"}
                  </span>
                  {vendor.isVerified && (
                    <span className="vp-chip vp-chip-violet">
                      <CheckCircle2 size={9} />
                      Verified
                    </span>
                  )}
                </div>
              </motion.div>

              {/* About */}
              {vendor.about && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.45 }}
                  className="mt-5"
                >
                  <p className="vp-section-title" style={{ marginBottom: 8 }}>
                    About
                  </p>
                  <div className="vp-about-box">{vendor.about}</div>
                </motion.div>
              )}
            </div>

            {/* ── Bottom grid ── */}
            <div className="px-6 pb-6 rounded-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                {/* Account Information */}
                <div className="vp-section">
                  <p className="vp-section-title">Account Information</p>

                  <div className="vp-info-row">
                    <div className="vp-icon-box">
                      <Shield size={13} color="#6b7280" />
                    </div>
                    <div>
                      <p className="vp-info-label">Vendor ID</p>
                      <p className="vp-info-val">
                        #{vendor.id?.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="vp-info-row">
                    <div className="vp-icon-box">
                      <Clock size={13} color="#6b7280" />
                    </div>
                    <div>
                      <p className="vp-info-label">Member Since</p>
                      <p className="vp-info-val">
                        {formatDate(vendor.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="vp-info-row">
                    <div className="vp-icon-box">
                      <CalendarDays size={13} color="#6b7280" />
                    </div>
                    <div>
                      <p className="vp-info-label">Last Updated</p>
                      <p className="vp-info-val">
                        {formatDate(vendor.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {vendor.city && (
                    <div className="vp-info-row">
                      <div className="vp-icon-box">
                        <MapPin size={13} color="#6b7280" />
                      </div>
                      <div>
                        <p className="vp-info-label">City</p>
                        <p className="vp-info-val">{vendor.city}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Activity Summary */}
                <div className="vp-section">
                  <p className="vp-section-title">Activity Summary</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="vp-stat">
                      <div
                        className="vp-stat-icon"
                        style={{ background: "#fefce8" }}
                      >
                        <Star size={15} color="#ca8a04" strokeWidth={2} />
                      </div>
                      <div className="vp-stat-num">
                        {vendor.totalRating ?? 0}
                      </div>
                      <div className="vp-stat-lbl">Rating</div>
                    </div>

                    <div className="vp-stat">
                      <div
                        className="vp-stat-icon"
                        style={{ background: "#f0f9ff" }}
                      >
                        <BookMarked size={15} color="#0ea5e9" strokeWidth={2} />
                      </div>
                      <div className="vp-stat-num">0</div>
                      <div className="vp-stat-lbl">Bookings</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  className="vp-btn-dark"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Pencil size={12} strokeWidth={2.5} />
                  Edit Profile
                </button>
                <button
                  className="vp-btn-light"
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  <KeyRound size={12} strokeWidth={2.5} />
                  Change Password
                </button>
              </div>
            </div>
          </Card>
        </section>

        {/* Modals */}
        {vendor && (
          <EditProfileModalVendor
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            vendor={vendor}
            onSave={handleSaveProfile}
          />
        )}
        {vendor && isPasswordModalOpen && (
          <ChangePasswordModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
            onSave={handlePasswordChange}
          />
        )}
      </div>
    </>
  );
}

export default React.memo(VendorProfile);
