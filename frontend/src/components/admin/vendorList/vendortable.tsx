import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { showToastMessage } from '../../../validations/common/toast';
import { debounce } from 'lodash';
import Swal from 'sweetalert2';
import { AcceptanceStatus, VendorData, VendorResponse } from '../../../types/vendorTypes';
import VendorDetailsModal from './viewdetails';
import Loader from '../../common/Loader';
import { axiosInstanceAdmin } from '@/config/api/axiosinstance';
import { logout } from '../../../redux/slices/VendorSlice';
import { blockUnblockVendorService } from '@/services/adminAuthService';

export function SortableTableVendor() {
    const [vendors, setVendors] = useState<VendorData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);

    const dispatch = useDispatch();

    const handleViewDetails = (vendor: VendorData) => {
        setSelectedVendor(vendor);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVendor(null);
    };

    const fetchData = useCallback(async (page?: number, search?: string) => {
        setIsLoading(true);
        try {
            const response = await axiosInstanceAdmin.get<VendorResponse>('/vendors', {
                params: {
                    page,
                    limit: 5,
                    search,
                    status: activeTab !== 'all' ? activeTab : undefined
                }
            });

// ✅ After
const transformedVendors: VendorData[] = response.data.vendors.map((vendor: VendorData & { _doc?: VendorData }) => {
    const base = vendor._doc ? vendor._doc : vendor;               
                return {
                    ...base,
                    imageUrl: vendor.imageUrl ?? base.imageUrl,
                    portfolioImages: vendor.portfolioImages ?? base.portfolioImages ?? [],
                };
            });

            setVendors(transformedVendors);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    const debouncedFetchData = useCallback(debounce(fetchData, 500), [fetchData]);

    useEffect(() => {
        if (searchTerm.trim().length >= 3) {
            debouncedFetchData(currentPage, searchTerm);
        } else if (searchTerm.trim() === '') {
            debouncedFetchData(currentPage, '');
        }
        return () => { debouncedFetchData.cancel(); };
    }, [currentPage, searchTerm, debouncedFetchData]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setCurrentPage(1);
    };

    const handleBlockUnblock = async (vendorId: string, currentStatus: boolean) => {
        const action = currentStatus ? 'block' : 'unblock';
        const result = await Swal.fire({
            title: `Are you sure?`,
            text: `Do you want to ${action} this vendor?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: currentStatus ? '#d33' : '#3085d6',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Yes, ${action} vendor!`
        });

        if (result.isConfirmed) {
            try {
                const response = await blockUnblockVendorService(vendorId);
                showToastMessage(response.message, 'success');
                Swal.fire('Success!', response.message, 'success');
                setVendors((prev) =>
                    prev.map((vendor) =>
                        vendor._id === vendorId
                            ? { ...vendor, isActive: !currentStatus }
                            : vendor
                    )
                );
                if (response.processHandle === 'block') {
                    dispatch(logout());
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to update vendor status', 'error');
                console.error('Error while blocking/unblocking vendor', error);
            }
        }
    };

    // ✅ Shared verify/review handler — used for both Pending and Reapplied vendors
    const handleVerifyVendor = useCallback(async (vendorId: string, isReapplied = false) => {
        setIsLoading(true);
        let status: AcceptanceStatus;
        let rejectionReason: string | undefined;

        const result = await Swal.fire({
            title: isReapplied ? 'Review Reapplication' : 'Verify Vendor',
            text: isReapplied
                ? 'This vendor has reapplied. Do you want to accept or reject?'
                : 'Do you want to accept or reject this vendor?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1a1a2e',
            cancelButtonColor: '#e53e3e',
            confirmButtonText: 'Accept',
            cancelButtonText: 'Reject'
        });

        if (result.isConfirmed) {
            status = AcceptanceStatus.Accepted;
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            status = AcceptanceStatus.Rejected;
            const reasonResult = await Swal.fire({
                title: 'Enter Rejection Reason',
                input: 'text',
                inputPlaceholder: 'Enter reason (optional)',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                cancelButtonText: 'Cancel'
            });
            if (reasonResult.isConfirmed) {
                rejectionReason = reasonResult.value || 'No reason provided';
            } else {
                setIsLoading(false);
                return;
            }
        } else {
            setIsLoading(false);
            return;
        }

        try {
            const response = await axiosInstanceAdmin.put(`/vendors/${vendorId}/status`, { status, rejectionReason });
            showToastMessage(response.data.message, 'success');
            setVendors(prev => prev.map(v =>
                v._id === vendorId
                    ? { ...v, isAccepted: status, isActive: status === AcceptanceStatus.Accepted, rejectionReason }
                    : v
            ));
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to update vendor status', 'error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ✅ 4 status badges — Accepted, Rejected, Reapplied, Pending
    const getStatusBadge = (vendor: VendorData) => {
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
        // ✅ NEW — Reapplied badge
        if (vendor.isAccepted === AcceptanceStatus.Reapplied) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse" />
                    Reapplied
                </span>
            );
        }
        // Pending / Requested
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
                Pending
            </span>
        );
    };

    // ✅ VERIFY column — 4 cases
    const getVerifyColumn = (vendor: VendorData) => {
        // Pending — show Verify button
        if (!vendor.isAccepted || vendor.isAccepted === AcceptanceStatus.Pending) {
            return (
                <button
                    onClick={() => handleVerifyVendor(vendor._id, false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-all duration-150 shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #1a1a2e, #0f3460)' }}
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verify
                </button>
            );
        }

        // ✅ Reapplied — show Review button (blue)
        if (vendor.isAccepted === AcceptanceStatus.Reapplied) {
            return (
                <button
                    onClick={() => handleVerifyVendor(vendor._id, true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-150 shadow-sm"
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Review
                </button>
            );
        }

        // Accepted / Rejected — show result text
        return (
            <div className="flex flex-col gap-1">
                <span className={`text-xs font-semibold ${
                    vendor.isAccepted === AcceptanceStatus.Accepted
                        ? 'text-emerald-600'
                        : 'text-red-500'
                }`}>
                    {vendor.isAccepted === AcceptanceStatus.Accepted ? '✓ Accepted' : '✗ Rejected'}
                </span>
                {vendor.isAccepted === AcceptanceStatus.Rejected && vendor.rejectionReason && (
                    <span className="text-xs text-gray-400 max-w-[130px] truncate" title={vendor.rejectionReason}>
                        {vendor.rejectionReason}
                    </span>
                )}
            </div>
        );
    };

    // ✅ 5 tabs — added Reapplied
    const tabConfig = [
        { label: 'All',        value: 'all'        },
        { label: 'Accepted',   value: 'accepted'   },
        { label: 'Pending',    value: 'requested'  },
        { label: 'Rejected',   value: 'rejected'   },
        { label: 'Reapplied',  value: 'reapplied'  }, // ✅ NEW
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vendor Management</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Review and manage vendor applications</p>
                    </div>
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Search vendors..."
                            className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 w-64 placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
                    {tabConfig.map(({ label, value }) => (
                        <button
                            key={value}
                            onClick={() => handleTabChange(value)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activeTab === value
                                    ? value === 'reapplied'
                                        ? 'bg-blue-600 text-white shadow-sm'   // ✅ blue for reapplied tab
                                        : 'bg-gray-900 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/80">
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reports</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Block</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Verify</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-16">
                                            <Loader />
                                        </td>
                                    </tr>
                                ) : vendors.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-16">
                                            <div className="flex flex-col items-center gap-2">
                                                <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <p className="text-sm text-gray-400 font-medium">No vendors found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    vendors.map((vendor) => (
                                        <tr
                                            key={vendor._id}
                                            className="hover:bg-gray-50/60 transition-colors duration-150"
                                        >
                                            {/* Vendor Info */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative flex-shrink-0">
                                                        <img
                                                            src={vendor?.imageUrl || "/images/user.png"}
                                                            alt={vendor.name}
                                                            className="h-9 w-9 rounded-xl object-cover border border-gray-100"
                                                        />
                                                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${vendor.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 leading-tight">{vendor.name}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{vendor.companyName || "No company"}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Mobile */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-gray-600">{vendor.contactinfo || "—"}</span>
                                            </td>

                                            {/* Joined */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-gray-600">
                                                    {new Date(vendor.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: '2-digit'
                                                    })}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                {getStatusBadge(vendor)}
                                            </td>

                                            {/* Reports */}
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                                                    (vendor.reportCount ?? 0) > 10
                                                        ? 'bg-red-100 text-red-700'
                                                        : (vendor.reportCount ?? 0) > 1
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {vendor.reportCount ?? 0}
                                                </span>
                                            </td>

                                            {/* Block Toggle */}
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => handleBlockUnblock(vendor._id, vendor.isActive)}
                                                    disabled={
                                                        vendor.isAccepted === AcceptanceStatus.Pending ||
                                                        vendor.isAccepted === AcceptanceStatus.Rejected ||
                                                        vendor.isAccepted === AcceptanceStatus.Reapplied // ✅ also disable for reapplied
                                                    }
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                                                        vendor.isActive ? 'bg-emerald-500' : 'bg-gray-300'
                                                    }`}
                                                >
                                                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                                                        vendor.isActive ? 'translate-x-4.5' : 'translate-x-0.5'
                                                    }`} />
                                                </button>
                                            </td>

                                            {/* View Details */}
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => handleViewDetails(vendor)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 shadow-sm"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View
                                                </button>
                                            </td>

                                            {/* ✅ Verify column — uses getVerifyColumn helper */}
                                            <td className="px-5 py-4">
                                                {getVerifyColumn(vendor)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
                        <span className="text-sm text-gray-500">
                            Page <span className="font-semibold text-gray-800">{currentPage}</span> of <span className="font-semibold text-gray-800">{totalPages}</span>
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                ← Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <VendorDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                vendor={selectedVendor}
            />
        </div>
    );
}