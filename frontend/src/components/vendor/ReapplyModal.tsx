import { useState } from 'react';
import { X, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updateVendorStatus } from '@/redux/slices/VendorSlice';
import { showToastMessage } from '@/validations/common/toast';
import { axiosInstanceVendor } from '@/config/api/axiosinstance';
import axios from 'axios';
import { AcceptanceStatus } from '@/types/vendorTypes';

interface ReapplyModalProps {
  rejectionReason?: string | null;
  onClose: () => void;
}

const ReapplyModal = ({ rejectionReason, onClose }: ReapplyModalProps) => {
  const dispatch = useDispatch();
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [aadharFront, setAadharFront] = useState<File | null>(null);
  const [aadharBack, setAadharBack] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPortfolioFiles(Array.from(e.target.files));
    }
  };

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    const formData = new FormData();

    portfolioFiles.forEach((file) => {
      formData.append('portfolioImages', file);
    });
    if (aadharFront) formData.append('aadharFront', aadharFront);
    if (aadharBack) formData.append('aadharBack', aadharBack);

    // ✅ ADD THESE TWO LINES — manually attach token
    const token = localStorage.getItem('vendorToken');
    console.log('Token being sent:', token); // ← check console for this

    await axiosInstanceVendor.post('/reapply', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`, // ← add this
      },
    });

    // rest of your code stays same...
    dispatch(updateVendorStatus({ 
      isAccepted: AcceptanceStatus.Reapplied,
      rejectionReason: undefined
    }));

    setSubmitted(true);
    showToastMessage('Reapplication submitted successfully!', 'success');
    setTimeout(() => onClose(), 2000);

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Full error response:', error.response?.data);
      showToastMessage(error.response?.data?.message || 'Failed to submit reapplication', 'error');
    } else {
      showToastMessage('Unexpected error occurred', 'error');
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            <h2 className="text-base font-bold text-gray-900">Reapply for Verification</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          // ✅ Success state
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reapplication Submitted!</h3>
            <p className="text-sm text-gray-500">
              Admin will review your updated documents and notify you via email.
            </p>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">

            {/* Rejection Reason */}
            {rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-red-700 mb-1">
                  ❌ Reason for Rejection:
                </p>
                <p className="text-sm text-red-800">"{rejectionReason}"</p>
              </div>
            )}

            <p className="text-xs text-gray-500">
              Please re-upload the documents mentioned in the rejection reason. 
              You can skip fields that don't need changes.
            </p>

            {/* Portfolio Re-upload */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                📸 Portfolio Images
                <span className="text-xs font-normal text-gray-400 ml-1">(optional, max 5)</span>
              </label>
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                <Upload size={20} className="text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">
                  {portfolioFiles.length > 0 
                    ? `${portfolioFiles.length} file(s) selected` 
                    : 'Click to upload portfolio images'}
                </span>
                <input
                  type="file" multiple accept="image/*" className="hidden"
                  onChange={handlePortfolioChange}
                />
              </label>
            </div>

            {/* Aadhaar Re-upload */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                🪪 Aadhaar Card
                <span className="text-xs font-normal text-gray-400 ml-1">(optional)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Front */}
                <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                  <Upload size={16} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500 text-center px-2">
                    {aadharFront ? aadharFront.name : 'Front Side'}
                  </span>
                  <input
                    type="file" accept="image/*" className="hidden"
                    onChange={(e) => setAadharFront(e.target.files?.[0] || null)}
                  />
                </label>
                {/* Back */}
                <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                  <Upload size={16} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500 text-center px-2">
                    {aadharBack ? aadharBack.name : 'Back Side'}
                  </span>
                  <input
                    type="file" accept="image/*" className="hidden"
                    onChange={(e) => setAadharBack(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting…
                  </span>
                ) : 'Submit Reapplication'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReapplyModal;