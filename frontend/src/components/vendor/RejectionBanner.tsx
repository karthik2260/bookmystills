import { useState } from 'react';
import { AlertTriangle, Clock,   } from 'lucide-react';
import ReapplyModal from './ReapplyModal';
interface RejectionBannerProps {
  isAccepted: string;
  rejectionReason?: string | null;
}

const RejectionBanner = ({ isAccepted, rejectionReason }: RejectionBannerProps) => {
  const [showModal, setShowModal] = useState(false);

  // 🟡 Pending
  if (isAccepted === 'requested') {
    return (
      <div className="w-full bg-amber-50 border-b border-amber-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Clock size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Account Under Review</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Your application is being reviewed by our admin team. We'll notify you via email once verified.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 🔴 Rejected
  if (isAccepted === 'rejected') {
    return (
      <>
        <div className="w-full bg-red-50 border-b border-red-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle size={16} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Your vendor application was rejected
                </p>
                {rejectionReason && (
                  <div className="mt-2 bg-red-100 border border-red-200 rounded-lg px-4 py-2.5 max-w-2xl">
                    <p className="text-xs font-medium text-red-700 mb-0.5">Reason from Admin:</p>
                    <p className="text-sm text-red-800">"{rejectionReason}"</p>
                  </div>
                )}
                <p className="text-xs text-red-500 mt-2">
                  Please fix the issues mentioned above and reapply.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex-shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
            >
              View Details & Reapply
            </button>
          </div>
        </div>

        {/* Reapply Modal */}
        {showModal && (
          <ReapplyModal
            rejectionReason={rejectionReason}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  // 🔵 Reapplied - waiting
  if (isAccepted === 'reapplied') {
    return (
      <div className="w-full bg-blue-50 border-b border-blue-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Clock size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-800">Reapplication Under Review</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Your reapplication has been submitted successfully. Admin will review your updated documents shortly.
            </p>
          </div>
          <div className="ml-auto">
            <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-medium">
              ⏳ Pending Review
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default RejectionBanner;