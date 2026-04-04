import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";

import { logout } from "../../../redux/slices/VendorSlice";
import type { VendorData } from "../../../types/vendorTypes";
import { AcceptanceStatus } from "../../../types/vendorTypes";
import { showToastMessage } from "../../../validations/common/toast";
import type {
  ColumnDef,
  FetchParams,
  TabConfig,
} from "../dashboard/GenericTable";
import { GenericTable } from "../dashboard/GenericTable";

import VendorDetailsModal from "./viewdetails";

import {
  blockUnblockVendorService,
  fetchVendorsApi,
  verifyVendorService,
} from "@/services/adminAuthService";

const VENDOR_TABS: TabConfig[] = [
  { label: "All", value: "all" },
  { label: "Accepted", value: "accepted" },
  { label: "Pending", value: "requested" },
  { label: "Rejected", value: "rejected" },
  { label: "Reapplied", value: "reapplied" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ vendor }: { vendor: VendorData }) {
  if (vendor.isAccepted === AcceptanceStatus.Accepted) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        Active
      </span>
    );
  }
  if (vendor.isAccepted === AcceptanceStatus.Rejected) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        Rejected
      </span>
    );
  }
  if (vendor.isAccepted === AcceptanceStatus.Reapplied) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse" />
        Reapplied
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
      Pending
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VendorTable() {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);

  // ── Modal helpers ──────────────────────────────────────────────────────────

  const openModal = (vendor: VendorData) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVendor(null);
  };

  // ── Block / unblock ────────────────────────────────────────────────────────

  const handleBlockUnblock = useCallback(
    async (vendorId: string, currentStatus: boolean) => {
      const action = currentStatus ? "block" : "unblock";
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Do you want to ${action} this vendor?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: currentStatus ? "#d33" : "#3085d6",
        cancelButtonColor: "#6c757d",
        confirmButtonText: `Yes, ${action} vendor!`,
      });

      if (result.isConfirmed) {
        try {
          const response = await blockUnblockVendorService(vendorId);
          showToastMessage(response.message, "success");
          Swal.fire("Success!", response.message, "success");
          if (response.processHandle === "block") {
            dispatch(logout());
          }
        } catch (error) {
          Swal.fire("Error", "Failed to update vendor status", "error");
          console.error("Error while blocking/unblocking vendor", error);
        }
      }
    },
    [dispatch],
  );

  // ── Verify / review ────────────────────────────────────────────────────────

  const handleVerifyVendor = useCallback(
    async (vendorId: string, isReapplied = false) => {
      let status: AcceptanceStatus;
      let rejectionReason: string | undefined;

      const result = await Swal.fire({
        title: isReapplied ? "Review Reapplication" : "Verify Vendor",
        text: isReapplied
          ? "This vendor has reapplied. Do you want to accept or reject?"
          : "Do you want to accept or reject this vendor?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#1a1a2e",
        cancelButtonColor: "#e53e3e",
        confirmButtonText: "Accept",
        cancelButtonText: "Reject",
      });

      if (result.isConfirmed) {
        status = AcceptanceStatus.Accepted;
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        status = AcceptanceStatus.Rejected;
        const reasonResult = await Swal.fire({
          title: "Enter Rejection Reason",
          input: "text",
          inputPlaceholder: "Enter reason (optional)",
          showCancelButton: true,
          confirmButtonText: "Submit",
          cancelButtonText: "Cancel",
        });
        if (reasonResult.isConfirmed) {
          rejectionReason = reasonResult.value || "No reason provided";
        } else {
          return;
        }
      } else {
        return;
      }

      try {
        const response = await verifyVendorService(vendorId, {
          status,
          rejectionReason,
        });
        showToastMessage(response.message, "success");
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to update vendor status", "error");
      }
    },
    [],
  );

  // ── Verify column cell ─────────────────────────────────────────────────────

  const renderVerifyCell = useCallback(
    (vendor: VendorData) => {
      if (
        !vendor.isAccepted ||
        vendor.isAccepted === AcceptanceStatus.Pending
      ) {
        return (
          <button
            onClick={() => handleVerifyVendor(vendor.id, false)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-all duration-150 shadow-sm"
            style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)" }}
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Verify
          </button>
        );
      }

      if (vendor.isAccepted === AcceptanceStatus.Reapplied) {
        return (
          <button
            onClick={() => handleVerifyVendor(vendor.id, true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-150 shadow-sm"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Review
          </button>
        );
      }

      return (
        <div className="flex flex-col gap-1">
          <span
            className={`text-xs font-semibold ${
              vendor.isAccepted === AcceptanceStatus.Accepted
                ? "text-emerald-600"
                : "text-red-500"
            }`}
          >
            {vendor.isAccepted === AcceptanceStatus.Accepted
              ? "✓ Accepted"
              : "✗ Rejected"}
          </span>
          {vendor.isAccepted === AcceptanceStatus.Rejected &&
            vendor.rejectionReason && (
              <span
                className="text-xs text-gray-400 max-w-[130px] truncate"
                title={vendor.rejectionReason}
              >
                {vendor.rejectionReason}
              </span>
            )}
        </div>
      );
    },
    [handleVerifyVendor],
  );

  // ── Column definitions ─────────────────────────────────────────────────────

  const columns: ColumnDef<VendorData>[] = [
    // ── Vendor info ──────────────────────────────────────────────────────────
    {
      header: "Vendor",
      render: (vendor) => (
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <img
              src={vendor?.imageUrl || "/images/user.png"}
              alt={vendor.name}
              className="h-9 w-9 rounded-xl object-cover border border-gray-100"
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                vendor.isActive ? "bg-emerald-500" : "bg-gray-300"
              }`}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {vendor.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {vendor.companyName || "No company"}
            </p>
          </div>
        </div>
      ),
    },
    // ── Mobile ───────────────────────────────────────────────────────────────
    {
      header: "Mobile",
      render: (vendor) => (
        <span className="text-sm text-gray-600">
          {vendor.contactinfo || "—"}
        </span>
      ),
    },
    // ── Joined ───────────────────────────────────────────────────────────────
    {
      header: "Joined",
      render: (vendor) => (
        <span className="text-sm text-gray-600">
          {new Date(vendor.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "2-digit",
          })}
        </span>
      ),
    },
    // ── Status badge ─────────────────────────────────────────────────────────
    {
      header: "Status",
      render: (vendor) => <StatusBadge vendor={vendor} />,
    },
    // ── Report count ─────────────────────────────────────────────────────────
    {
      header: "Reports",
      render: (vendor) => (
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
            (vendor.reportCount ?? 0) > 10
              ? "bg-red-100 text-red-700"
              : (vendor.reportCount ?? 0) > 1
                ? "bg-amber-100 text-amber-700"
                : "bg-gray-100 text-gray-500"
          }`}
        >
          {vendor.reportCount ?? 0}
        </span>
      ),
    },
    // ── Block toggle ─────────────────────────────────────────────────────────
    {
      header: "Block",
      render: (vendor) => (
        <button
          onClick={() => handleBlockUnblock(vendor._id, vendor.isActive)}
          disabled={
            vendor.isAccepted === AcceptanceStatus.Pending ||
            vendor.isAccepted === AcceptanceStatus.Rejected ||
            vendor.isAccepted === AcceptanceStatus.Reapplied
          }
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
            vendor.isActive ? "bg-emerald-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
              vendor.isActive ? "translate-x-4.5" : "translate-x-0.5"
            }`}
          />
        </button>
      ),
    },
    // ── View details ─────────────────────────────────────────────────────────
    {
      header: "Details",
      render: (vendor) => (
        <button
          onClick={() => openModal(vendor)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700
                     bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300
                     transition-all duration-150 shadow-sm"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          View
        </button>
      ),
    },
    {
      header: "Verify",
      render: renderVerifyCell,
    },
  ];

  const fetchVendors = async (params: FetchParams) => {
    const response = await fetchVendorsApi(params);

    const transformedVendors: VendorData[] = response.vendors.map(
      (vendor: VendorData & { _doc?: VendorData }) => {
        const base = vendor._doc ? vendor._doc : vendor;
        return {
          ...base,
          imageUrl: vendor.imageUrl ?? base.imageUrl,
          portfolioImages: vendor.portfolioImages ?? base.portfolioImages ?? [],
        };
      },
    );

    return { data: transformedVendors, totalPages: response.totalPages };
  };

  return (
    <>
      <GenericTable<VendorData>
        title="Vendor Management"
        subtitle="Review and manage vendor applications"
        tabs={VENDOR_TABS}
        columns={columns}
        fetchData={fetchVendors}
        rowKey={(vendor) => vendor._id}
        searchPlaceholder="Search vendors..."
      />

      <VendorDetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        vendor={selectedVendor}
      />
    </>
  );
}
