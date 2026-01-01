import React, { useCallback, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Typography,
  Chip,
} from "@material-tailwind/react";
import { CalendarDays, Mail, Phone, Badge, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { axiosInstance } from "@/config/api/axiosinstance";
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


const UserProfile = () => {
  const dispatch = useDispatch();
  const userD = useSelector((state: UserRootState) => state.user.userData);  
 

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [count, setCount] = useState(0);

  const handlePasswordChange = async (passwordData: PasswordFormData) => {
    try {
      const token = localStorage.getItem('usertok');
      await axiosInstance.put('/change-password', passwordData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      showToastMessage("Password changed successfully", 'success');
    } catch (error) {
      console.error("Error changing password", error);
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || 'Error changing password';
        showToastMessage(errorMessage, "error");
      } else {
        showToastMessage("Unexpected error occurred", "error");
      }
      throw error;
    }
  };
 


  const handleSaveProfile = useCallback(async (updates: FormData) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        showToastMessage('Authentication required', 'error');
        return;
      }
      const response = await axiosInstance.put('/profile', updates, {
        headers: { "Content-Type": 'multipart/form-data' }
      });

      dispatch(setUserInfo(response.data.user));
      showToastMessage('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToastMessage('Error updating profile', 'error');
    }
  }, [dispatch]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  if (!userD) {
    return <div><Loader /></div>;
  }

  return (
    <div className="flex">
      <div>
        <Sidebar />
      </div>

      <section className="container mx-auto">
        <Card className="w-full mb-6">
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative h-64 w-full overflow-hidden"
          >
            <img src={"/images/cate2.jpg"} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>

          <div className="relative px-6 py-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-wrap justify-between items-start gap-4"
            >
              <div className="flex items-center gap-6">
                <Avatar
                  size="xxl"
                  placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
                  className="h-32 w-32 ring-4 ring-white -mt-20 relative"
                  src={userD?.imageUrl || "/images/user.png"}
                />
                <div className="space-y-1">
                  <Typography variant="h4" className="text-2xl font-bold text-black">
                    {userD?.name}
                  </Typography>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-black" />
                    <Typography className="text-gray-600">
                      {userD?.email}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-black" />
                    <Typography className="text-gray-600">
                      {userD?.contactinfo}
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Chip
                  color={userD?.isActive ? "green" : "gray"}
                  value={userD?.isActive ? "Active" : "Inactive"}
                  className="rounded-full text-sm"
                />
                {userD?.isGoogleUser && (
                  <Chip
                    color="blue"
                    value="Google Account"
                    className="rounded-full text-sm"
                  />
                )}
              </div>
            </motion.div>
          </div>

          <div className="px-6 pb-6 rounded-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card className="p-4 bg-gray-50">
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Account Information
                </Typography>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="h-5 w-5 text-black" />
                    <Typography className="text-sm">
                      ID: {userD?._id?.slice(-6)}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-black" />
                    <Typography className="text-sm">
                      Member since: {formatDate(userD?.createdAt)}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-black" />
                    <Typography className="text-sm">
                      Last updated: {formatDate(userD?.updatedAt)}
                    </Typography>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gray-50">
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Activity Summary
                </Typography>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <Typography className="text-2xl font-bold text-black">
                      {userD?.favourite?.length || 0}
                    </Typography>
                    <Typography className="text-sm text-gray-600">
                      Favorites
                    </Typography>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <Typography className="text-2xl font-bold text-black">
                      {count}
                    </Typography>
                    <Typography className="text-sm text-gray-600">
                      Bookings
                    </Typography>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 bg-black h-7 px-2 text-sm"
              >
                Edit Profile
              </Button>
              {userD && !userD.isGoogleUser && (
                <Button
                  size="sm"
                  variant="outlined"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="flex items-center gap-2 bg-white h-7 px-2 text-sm"
                >
                  Change Password
                </Button>
              )}
            </div>
          </div>
        </Card>
      </section>

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
  );
};

export default React.memo(UserProfile);