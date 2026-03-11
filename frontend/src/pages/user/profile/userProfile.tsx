import React, { useCallback, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Typography,
  Chip,
} from "@material-tailwind/react";
import { CalendarDays, Mail, Phone, Shield, Clock, Pencil, KeyRound, Camera, Heart, BookMarked, Star, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { showToastMessage } from "../../../validations/common/toast";
import { useSelector, useDispatch } from "react-redux";
import UserRootState from "@/redux/rootstate/UserState";
import { setUserInfo } from "@/redux/slices/UserSlice";
import Sidebar from "../../../layout/user/Sidebar";
import EditProfileModal from "./editProfile";
import Loader from "../../../components/common/Loader";
import { AxiosError } from "axios";
import ChangePasswordModal, { PasswordFormData } from "@/pages/common/changePassword";
import { formatDate } from "@/utils/userUtils";
import { changePasswordService, updateProfileService } from "@/services/userAuthService";

const UserProfile = () => {
  const dispatch = useDispatch();
  const userD = useSelector((state: UserRootState) => state.user.userData);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [count, setCount] = useState(0);

  const handlePasswordChange = async (passwordData: PasswordFormData) => {
    try {
      const token = localStorage.getItem("userToken") || "";
      await changePasswordService(passwordData, token);
      showToastMessage("Password changed successfully", "success");
    } catch (error) {
      console.error("Error changing password", error);
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || "Error changing password";
        showToastMessage(errorMessage, "error");
      } else {
        showToastMessage("Unexpected error occurred", "error");
      }
      throw error;
    }
  };

  const handleSaveProfile = useCallback(async (updates: FormData) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        showToastMessage("Authentication required", "error");
        return;
      }
      const response = await updateProfileService(updates, token);
      dispatch(setUserInfo(response.userProfileDTO));
      showToastMessage("Profile updated successfully", "success");
    } catch (error) {
      console.error("Error updating profile:", error);
      showToastMessage("Error updating profile", "error");
    }
  }, [dispatch]);

  if (!userD) {
    return <div><Loader /></div>;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&family=Satoshi:wght@300;400;500;700&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&f[]=satoshi@300,400,500,700&display=swap');

        .up2-wrap { font-family: 'Satoshi', 'DM Sans', sans-serif; }

        /* Cover */
        .up2-cover-img { width:100%; height:100%; object-fit:cover; filter: brightness(0.88) saturate(1.1); }
        .up2-cover-overlay {
          position:absolute; inset:0;
          background: linear-gradient(135deg, rgba(15,15,15,0.55) 0%, rgba(15,15,15,0.1) 60%, transparent 100%);
        }

        /* Avatar */
        .up2-avatar-shell {
          position: relative;
          display: inline-block;
        }
        .up2-avatar-shell > * {
          border: 3px solid #fff !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18) !important;
        }
        .up2-cam-btn {
          position:absolute; bottom:2px; right:2px;
          width:26px; height:26px; border-radius:50%;
          background:#111; border:2px solid #fff;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:background 0.18s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .up2-cam-btn:hover { background:#333; }

        /* Name */
        .up2-name {
          font-size: 1.55rem;
          font-weight: 700;
          color: #0f0f0f;
          letter-spacing: -0.025em;
          line-height: 1.15;
        }

        /* Status chips */
        .up2-chip {
          display:inline-flex; align-items:center; gap:5px;
          padding: 3px 11px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .up2-chip-green { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; }
        .up2-chip-gray  { background:#f4f4f5; color:#71717a; border:1px solid #e4e4e7; }
        .up2-chip-blue  { background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; }

        /* Contact rows */
        .up2-contact {
          display:flex; align-items:center; gap:8px;
          font-size:0.83rem; color:#6b7280;
          font-weight:400;
        }

        /* Section card */
        .up2-section {
          background: #fafafa;
          border: 1px solid #ebebeb;
          border-radius: 14px;
          padding: 20px;
        }
        .up2-section-title {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #a1a1aa;
          margin-bottom: 14px;
        }

        /* Info rows */
        .up2-info-row {
          display:flex; align-items:center; gap:10px;
          padding: 9px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 0.82rem;
        }
        .up2-info-row:last-child { border-bottom: none; }
        .up2-icon-box {
          width:30px; height:30px; border-radius:8px;
          background:#f4f4f5;
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0;
        }
        .up2-info-label { color:#a1a1aa; font-size:0.7rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }
        .up2-info-val   { color:#0f0f0f; font-weight:500; font-size:0.82rem; }

        /* Stat boxes */
        .up2-stat {
          background: #fff;
          border: 1px solid #ebebeb;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .up2-stat:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); transform: translateY(-2px); }
        .up2-stat-icon  { margin: 0 auto 8px; width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; }
        .up2-stat-num   { font-size:1.6rem; font-weight:700; color:#0f0f0f; line-height:1; }
        .up2-stat-lbl   { font-size:0.7rem; font-weight:600; color:#a1a1aa; text-transform:uppercase; letter-spacing:0.06em; margin-top:3px; }

        /* Buttons */
        .up2-btn-dark {
          display:inline-flex; align-items:center; gap:6px;
          padding: 8px 16px; border-radius:9px;
          background:#0f0f0f; color:#fff;
          font-size:0.8rem; font-weight:600;
          border:none; cursor:pointer;
          transition: background 0.18s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .up2-btn-dark:hover { background:#2a2a2a; transform:translateY(-1px); }

        .up2-btn-light {
          display:inline-flex; align-items:center; gap:6px;
          padding: 8px 16px; border-radius:9px;
          background:#fff; color:#0f0f0f;
          font-size:0.8rem; font-weight:600;
          border:1.5px solid #e4e4e7; cursor:pointer;
          transition: border-color 0.18s, box-shadow 0.18s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .up2-btn-light:hover { border-color:#d4d4d8; box-shadow:0 2px 10px rgba(0,0,0,0.07); transform:translateY(-1px); }
      `}</style>

      <div className="flex up2-wrap">
        <div><Sidebar /></div>

        <section className="container mx-auto">
          {/* ── Main card (same structure as original) ── */}
          <Card className="w-full mb-6" style={{ borderRadius: '18px', overflow: 'hidden', border: '1px solid #ebebeb', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>

            {/* Cover photo */}
            <motion.div
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative h-64 w-full overflow-hidden"
            >
              <img src="/images/cate2.jpg" alt="Cover" className="up2-cover-img" />
              <div className="up2-cover-overlay" />
            </motion.div>

            {/* Identity section */}
            <div className="relative px-6 py-8">
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.18, duration: 0.5 }}
                className="flex flex-wrap justify-between items-start gap-4"
              >
                {/* Avatar + name + contact */}
                <div className="flex items-center gap-6">
                  <div className="up2-avatar-shell">
                    <Avatar
                      size="xxl"
                      placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
                      className="h-32 w-32 ring-4 ring-white -mt-20 relative"
                      src={userD?.imageUrl || "/images/user.png"}
                    />
                    <div className="up2-cam-btn" onClick={() => setIsEditModalOpen(true)}>
                      <Camera size={11} color="#fff" strokeWidth={2.5} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <h2 className="up2-name">{userD?.name}</h2>
                    <div className="up2-contact">
                      <Mail size={13} color="#9ca3af" />
                      <span>{userD?.email}</span>
                    </div>
                    <div className="up2-contact">
                      <Phone size={13} color="#9ca3af" />
                      <span>{userD?.contactinfo || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Chips */}
                <div className="flex flex-col items-end gap-2">
                  <span className={`up2-chip ${userD?.isActive ? 'up2-chip-green' : 'up2-chip-gray'}`}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: userD?.isActive ? '#16a34a' : '#71717a', display: 'inline-block' }} />
                    {userD?.isActive ? "Active" : "Inactive"}
                  </span>
                  {userD?.isGoogleUser && (
                    <span className="up2-chip up2-chip-blue">
                      <Shield size={9} />
                      Google Account
                    </span>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Bottom section (same grid as original) */}
            <div className="px-6 pb-6 rounded-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                {/* Account Information */}
                <div className="up2-section">
                  <p className="up2-section-title">Account Information</p>

                  <div className="up2-info-row">
                    <div className="up2-icon-box"><Shield size={13} color="#6b7280" /></div>
                    <div>
                      <p className="up2-info-label">User ID</p>
                      <p className="up2-info-val">#{userD?.id?.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="up2-info-row">
                    <div className="up2-icon-box"><Clock size={13} color="#6b7280" /></div>
                    <div>
                      <p className="up2-info-label">Member Since</p>
                      <p className="up2-info-val">{formatDate(userD?.createdAt)}</p>
                    </div>
                  </div>

                  <div className="up2-info-row">
                    <div className="up2-icon-box"><CalendarDays size={13} color="#6b7280" /></div>
                    <div>
                      <p className="up2-info-label">Last Updated</p>
                      <p className="up2-info-val">{formatDate(userD?.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Activity Summary */}
                <div className="up2-section">
                  <p className="up2-section-title">Activity Summary</p>
                  <div className="grid grid-cols-2 gap-3">

                    <div className="up2-stat">
                      <div className="up2-stat-icon" style={{ background: '#fff1f2' }}>
                        <Heart size={15} color="#f43f5e" strokeWidth={2} />
                      </div>
                      <div className="up2-stat-num">0</div>
                      <div className="up2-stat-lbl">Favorites</div>
                    </div>

                    <div className="up2-stat">
                      <div className="up2-stat-icon" style={{ background: '#f0f9ff' }}>
                        <BookMarked size={15} color="#0ea5e9" strokeWidth={2} />
                      </div>
                      <div className="up2-stat-num">{count}</div>
                      <div className="up2-stat-lbl">Bookings</div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                <button className="up2-btn-dark" onClick={() => setIsEditModalOpen(true)}>
                  <Pencil size={12} strokeWidth={2.5} />
                  Edit Profile
                </button>
                {userD && !userD.isGoogleUser && (
                  <button className="up2-btn-light" onClick={() => setIsPasswordModalOpen(true)}>
                    <KeyRound size={12} strokeWidth={2.5} />
                    Change Password
                  </button>
                )}
              </div>
            </div>
          </Card>
        </section>

        {/* Modals */}
        {userD && (
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            user={userD}
            onSave={handleSaveProfile}
          />
        )}
        {userD && !userD.isGoogleUser && isPasswordModalOpen && (
          <ChangePasswordModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
            onSave={handlePasswordChange}
          />
        )}
      </div>
    </>
  );
};

export default React.memo(UserProfile);