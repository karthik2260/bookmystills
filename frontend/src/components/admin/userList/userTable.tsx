import React, { useCallback, useEffect, useState } from 'react';
import { UserData } from "../../../types/userTypes";
import { useDispatch } from 'react-redux';
import { showToastMessage } from '../../../validations/common/toast';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { debounce } from 'lodash';
import { formatDate } from '@/utils/userUtils';
import Loader from '../../common/Loader';
import { blockUnblockUserService, getUsersService } from '@/services/userAuthService';

const tabConfig = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export function SortableTable() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const dispatch = useDispatch();
  const navigate = useNavigate();

const fetchData = useCallback(
  async (page?: number, search?: string) => {
    setIsLoading(true);

    try {
      const data = await getUsersService({
        page,
        limit: 5,
        search,
        status: activeTab !== "all" ? activeTab : undefined,
      });

      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToastMessage(error.message, "error");
      } else {
        showToastMessage("Error loading users", "error");
      }
    } finally {
      setIsLoading(false); // ⭐ IMPORTANT
    }
  },
  [activeTab]
);

  const debouncedFetchData = useCallback(
    debounce((page?: number, search?: string) => { fetchData(page, search); }, 500),
    [fetchData]
  );

  useEffect(() => {
    if (searchTerm.trim().length >= 3 || searchTerm.trim() === '') {
      debouncedFetchData(currentPage, searchTerm);
    }
    return () => { debouncedFetchData.cancel(); };
  }, [currentPage, searchTerm, activeTab, debouncedFetchData]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleBlockUnblock = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'block' : 'unblock';
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${action} this user?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: currentStatus ? '#d33' : '#1a1a2e',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Yes, ${action} user!`
    });

    if (result.isConfirmed) {
try {
  const response = await blockUnblockUserService(userId);

  showToastMessage(response.message, "success");

  setUsers(prev =>
    prev.map(user =>
      user._id === userId
        ? { ...user, isActive: !currentStatus }
        : user
    )
  );

} catch (error) {
  console.error("Error blocking user:", error);
  showToastMessage("Failed to update user status", "error");
}
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage and monitor user accounts</p>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search users..."
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
                  ? 'bg-gray-900 text-white shadow-sm'
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
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Google</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Block</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <Loader />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm text-gray-400 font-medium">No users found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50/60 transition-colors duration-150">

                      {/* User Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <img
                              src=
                              
                              "/images/user.png"
                              alt={user.name}
                              className="h-9 w-9 rounded-xl object-cover border border-gray-100"
                            />
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${user.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Mobile */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600">{user.contactinfo || "—"}</span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600">{formatDate(user?.createdAt) || '—'}</span>
                      </td>

                      {/* Google User */}
                      <td className="px-5 py-4">
                        {user.isGoogleUser ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.004.048.023.094.055.122a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                            </svg>
                            Google
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-500 border border-gray-200">
                            Email
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          user.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Block Toggle */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleBlockUnblock(user._id, user.isActive)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                            user.isActive ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                            user.isActive ? 'translate-x-4' : 'translate-x-0.5'
                          }`} />
                        </button>
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
    </div>
  );
}