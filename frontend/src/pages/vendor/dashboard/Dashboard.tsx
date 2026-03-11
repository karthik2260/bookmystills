import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import VendorRootState from '@/redux/rootstate/VendorState';
import DynamicBackground from '@/components/common/DynamicBackground';
import Footer from '../../../layout/user/footer';
import VendorNavbar from '../../../layout/vendor/VendorNavbar';
import HeroBannerVendor from './HeroBannerVendor';
import MainSectionVendor from './MainSectionVendor';
import RejectionBanner from '@/components/vendor/RejectionBanner';
import { updateVendorStatus } from '@/redux/slices/VendorSlice';
import { axiosInstanceVendor } from '@/config/api/axiosinstance';
import { AcceptanceStatus } from '@/types/vendorTypes';

const Dashboard = () => {
  const vendorData = useSelector((state: VendorRootState) => state.vendor.vendorData);
  const dispatch = useDispatch();
useEffect(() => {
  console.log('Current vendor Redux state:', vendorData);
  console.log('isAccepted value:', vendorData?.isAccepted);
}, [vendorData]);

  useEffect(() => {
    const fetchFreshStatus = async () => {
      try {
        const response = await axiosInstanceVendor.get('/profile');
      console.log('vendorDetails response:', response.data); 

        const freshVendor = response.data?.vendor ?? response.data;
      console.log('Fresh isAccepted from vendorDetails:', freshVendor?.isAccepted);

        if (freshVendor?.isAccepted) {
          dispatch(updateVendorStatus({
            isAccepted: freshVendor.isAccepted as AcceptanceStatus,
            rejectionReason: freshVendor.rejectionReason ?? undefined,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch fresh vendor status:', error);
      }
    };

    fetchFreshStatus();
  }, [dispatch]);

  const isAccepted = vendorData?.isAccepted;
  const isLocked = isAccepted === 'requested' ||
                   isAccepted === 'rejected'  ||
                   isAccepted === 'reapplied';

  return (
    <>
      <VendorNavbar />

      {isAccepted && isAccepted !== 'accepted' && (
        <RejectionBanner
          isAccepted={isAccepted}
          rejectionReason={vendorData?.rejectionReason}
        />
      )}

      {isLocked ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Dashboard Locked
          </h2>
          <p className="text-sm text-gray-500 max-w-sm">
            Your dashboard features will be unlocked once your account is verified by our admin team.
          </p>
        </div>
      ) : (
        <>
          <HeroBannerVendor />
          <MainSectionVendor />
          <DynamicBackground
            filepath="/images/vendor1.jpg"
            height="h-[550px]"
            type="image"
            className="w-full"
          />
        </>
      )}

      <Footer />
    </>
  );
};

export default Dashboard;