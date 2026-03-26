import React, { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash';
import Loader from '../../common/Loader';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TabConfig {
  label: string;
  value: string;
}

export interface ColumnDef<T> {
  header: string;
  render: (row: T) => React.ReactNode;
}

export interface FetchParams {
  page: number;
  limit: number;
  search: string;
  status?: string;
}

export interface FetchResult<T> {
  data: T[];
  totalPages: number;
}

export interface GenericTableProps<T> {
  /** Page heading */
  title: string;
  /** Subheading shown below the title */
  subtitle: string;
  /** Tab options — first tab should always be "all" */
  tabs: TabConfig[];
  /** Column definitions — header label + cell renderer */
  columns: ColumnDef<T>[];
  /** Async data fetcher called on page / search / tab change */
  fetchData: (params: FetchParams) => Promise<FetchResult<T>>;
  /** Key extractor for React list rendering */
  rowKey: (row: T) => string;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Number of rows per page (default: 5) */
  pageSize?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GenericTable<T>({
  title,
  subtitle,
  tabs,
  columns,
  fetchData,
  rowKey,
  searchPlaceholder = 'Search...',
  pageSize = 5,
}: GenericTableProps<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0]?.value ?? 'all');

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const loadData = useCallback(
    async (page: number, search: string) => {
      setIsLoading(true);
      try {
        const result = await fetchData({
          page,
          limit: pageSize,
          search,
          status: activeTab !== 'all' ? activeTab : undefined,
        });
        setRows(result.data);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error('GenericTable fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, fetchData, pageSize]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedLoad = useCallback(
    debounce((page: number, search: string) => {
      loadData(page, search);
    }, 500),
    [loadData]
  );

  useEffect(() => {
    if (searchTerm.trim().length >= 3 || searchTerm.trim() === '') {
      debouncedLoad(currentPage, searchTerm);
    }
    return () => {
      debouncedLoad.cancel();
    };
  }, [currentPage, searchTerm, activeTab, debouncedLoad]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder={searchPlaceholder}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400
                         w-64 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
          {tabs.map(({ label, value }) => (
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
                  {columns.map((col) => (
                    <th
                      key={col.header}
                      className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-16">
                      <Loader />
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="h-10 w-10 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <p className="text-sm text-gray-400 font-medium">No records found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={rowKey(row)}
                      className="hover:bg-gray-50/60 transition-colors duration-150"
                    >
                      {columns.map((col) => (
                        <td key={col.header} className="px-5 py-4">
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer — Pagination */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
            <span className="text-sm text-gray-500">
              Page{' '}
              <span className="font-semibold text-gray-800">{currentPage}</span> of{' '}
              <span className="font-semibold text-gray-800">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200
                           rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all shadow-sm"
              >
                ← Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200
                           rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all shadow-sm"
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