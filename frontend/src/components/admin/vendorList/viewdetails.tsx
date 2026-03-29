import React, { useState } from "react";
import { format } from "date-fns";
import { AcceptanceStatus, VendorData } from "../../../types/vendorTypes";
import { XMarkIcon } from "@heroicons/react/24/solid";
import {
  BuildingOffice2Icon,
  PhoneIcon,
  MapPinIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  FlagIcon,
  CheckBadgeIcon,
  PhotoIcon,
  IdentificationIcon,  // ← add
} from "@heroicons/react/24/outline";

interface VendorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: VendorData | null;
}

const VendorDetailsModal: React.FC<VendorDetailsModalProps> = ({
  isOpen,
  onClose,
  vendor,
}) => {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  if (!isOpen || !vendor) return null;

  const joinedDate = new Date(vendor.createdAt);

  const getAcceptanceBadge = (status: AcceptanceStatus) => {
    switch (status) {
      case AcceptanceStatus.Accepted:
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", label: "Accepted" };
      case AcceptanceStatus.Rejected:
        return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", label: "Rejected" };
      case AcceptanceStatus.Pending:
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400", label: "Pending Review" };
      default:
        return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", dot: "bg-gray-400", label: status };
    }
  };

  const badge = getAcceptanceBadge(vendor.isAccepted);

  const infoFields = [
    { icon: BuildingOffice2Icon, label: "Company", value: vendor.companyName || "Not Added" },
    { icon: PhoneIcon, label: "Contact", value: vendor.contactinfo?.toString() || "Not Added" },
    { icon: MapPinIcon, label: "City", value: vendor.city || "Not Added" },
    { icon: CalendarDaysIcon, label: "Joined", value: format(joinedDate, "PPP") },
    { icon: DocumentTextIcon, label: "Total Posts", value: vendor.postCount?.toString() || "0" },
    { icon: FlagIcon, label: "Reports", value: vendor.reportCount?.toString() || "0" },
  ];

  const aadharLabels = ["Front Side", "Back Side"];

  return (
    <>
      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setLightboxImg(null)}
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
          <img
            src={lightboxImg}
            alt="Portfolio"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Modal Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div
          className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col"
          style={{ background: "#f8f7f4" }}
        >

          {/* Header */}
          <div
            className="relative flex-shrink-0 px-6 py-4 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
          >
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-10 pointer-events-none"
              style={{ background: "radial-gradient(circle, #e94560, transparent)" }} />
            <div className="absolute -bottom-8 left-16 w-24 h-24 rounded-full opacity-10 pointer-events-none"
              style={{ background: "radial-gradient(circle, #0f3460, transparent)" }} />

            <div>
              <p className="text-white/50 text-xs font-medium tracking-widest uppercase">Vendor Profile</p>
              <h2 className="text-white text-lg font-bold tracking-tight leading-tight">Vendor Details</h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

            {/* Profile card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <img
                  src={vendor?.imageUrl || "/images/user.png"}
                  alt={vendor.name}
                  className="h-16 w-16 rounded-xl object-cover shadow-md"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    vendor.isActive ? "bg-emerald-500" : "bg-gray-400"
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-gray-900 font-bold text-base leading-tight">{vendor.name || "Vendor Name"}</h3>
                    <p className="text-gray-500 text-sm truncate">{vendor.email}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${badge.bg} ${badge.text} ${badge.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {badge.label}
                  </div>
                </div>
                {vendor.about && (
                  <p className="text-gray-400 text-xs mt-1.5 line-clamp-1">{vendor.about}</p>
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div>
              <h4 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Business Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {infoFields.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="p-2 rounded-lg bg-gray-50 flex-shrink-0">
                      <Icon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                      <p className="text-sm text-gray-800 font-semibold truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Row */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckBadgeIcon className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-400 font-medium">Account Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${vendor.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {vendor.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">Wallet</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  ₹{vendor.walletBalance?.toLocaleString() || "0"}
                </span>
              </div>
              {vendor.isAccepted === AcceptanceStatus.Rejected && vendor.rejectionReason && (
                <>
                  <div className="h-4 w-px bg-gray-200" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400 font-medium">Rejection Reason:</span>
                    <span className="text-xs text-red-600 font-medium">{vendor.rejectionReason}</span>
                  </div>
                </>
              )}
            </div>

            {/* Portfolio Images */}
            {vendor.portfolioImages && vendor.portfolioImages.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <PhotoIcon className="h-4 w-4 text-gray-400" />
                  <h4 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                    Portfolio Images
                  </h4>
                  <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {vendor.portfolioImages.length} image{vendor.portfolioImages.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {vendor.portfolioImages.map((url, index) => (
                    <div
                      key={index}
                      className="group relative overflow-hidden rounded-xl cursor-pointer aspect-video bg-gray-100"
                      onClick={() => setLightboxImg(url)}
                    >
                      <img
                        src={url}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                        <span className="text-white text-xs font-medium">Click to expand</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-center">
                <PhotoIcon className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-400 font-medium">No portfolio images uploaded</p>
                <p className="text-xs text-gray-300 mt-0.5">Vendor hasn't added portfolio images yet</p>
              </div>
            )}

            {/* ── Aadhaar Verification Images ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <IdentificationIcon className="h-4 w-4 text-gray-400" />
                <h4 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                  Aadhaar Verification
                </h4>
                {vendor.aadharImages && vendor.aadharImages.length === 2 && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Both sides uploaded
                  </span>
                )}
              </div>

              {vendor.aadharImages && vendor.aadharImages.length > 0 ? (
                <>
                  {/* Confidential notice */}
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                    <svg className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-amber-700 font-medium">Confidential — for admin verification only</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {vendor.aadharImages.map((url, index) => (
                      <div key={index} className="space-y-2">
                        {/* Side label */}
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-xs font-semibold text-gray-600">{aadharLabels[index]}</span>
                        </div>

                        {/* Image card */}
                        <div
                          className="group relative overflow-hidden rounded-xl cursor-pointer bg-gray-100 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                          style={{ aspectRatio: "1.6 / 1" }}
                          onClick={() => setLightboxImg(url)}
                        >
                          <img
                            src={url}
                            alt={`Aadhaar ${aadharLabels[index]}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                            <span className="text-white text-xs font-medium flex items-center gap-1">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                              Click to expand
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl border border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-center">
                  <IdentificationIcon className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400 font-medium">No Aadhaar images uploaded</p>
                  <p className="text-xs text-gray-300 mt-0.5">Vendor hasn't submitted identity documents yet</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default VendorDetailsModal;