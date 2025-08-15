'use client';

/**
 * FacilityGridRoute
 *
 * Displays a table of country-level energy capacity data.
 * Sidebar filters by fuel type. Table includes pagination.
 * Mobile-friendly layout with responsive sidebar and table.
 */

import { useEffect, useState } from 'react';
import SidebarFilter from '../../components/SidebarFilter';
import type { Capacity } from '@/lib/dbSchema';

export default function FacilityGridRoute() {
  const [filters, setFilters] = useState<{
    country: string;
    fuel: number | null;
    includeMicro: boolean;
  }>({
    country: '',
    fuel: null,
    includeMicro: true,
  });

  const [data, setData] = useState<Capacity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const pageSize = 25;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (filters.fuel !== null) {
          params.append('fuel', filters.fuel.toString());
        }

        const res = await fetch(`/api/country-capacity?${params.toString()}`, {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY!,
          },
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || 'Failed to fetch capacity data');
        }

        setData(json.data);
        setPage(0);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.fuel]);

  const pagedData = data.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(data.length / pageSize);

  return (
    <div className="h-full w-full px-4 pt-1 pb-1 z-10 relative">
      {/* Mobile-only toggle button for sidebar */}
      <button
        className="md:hidden mb-2 px-3 py-2 bg-blue-900 text-white rounded"
        onClick={() => setShowSidebar((prev) => !prev)}
      >
        {showSidebar ? 'Hide Filters' : 'Show Filters'}
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar: visible on desktop, toggleable on mobile */}
        {showSidebar && (
          <div className="md:w-64 w-full">
            <SidebarFilter onFilterChange={setFilters} disableCountry={true} />
          </div>
        )}

        {/* Table container */}
        <div className="flex-1 h-full overflow-y-auto rounded-lg shadow-sm border border-gray-200 bg-white pb-6">
          {loading && (
            <div className="text-center mt-4 text-sm text-gray-500">Loading data...</div>
          )}

          {error && (
            <div className="text-center mt-4 text-sm text-red-500">Error: {error}</div>
          )}

          {!loading && !error && (
            <>
              {/* Scrollable table wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-fixed">
                  <thead className="bg-blue-900 text-white sticky top-0 z-10 text-left">
                    <tr>
                      <th className="px-4 py-2 w-1/2">Country</th>
                      <th className="px-4 py-2 w-1/2">Total Capacity (MW)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedData.map((row, index) => (
                      <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2 bg-white">{row.country_long}</td>
                        <td className="px-4 py-2 bg-white">{row.capacity_mw}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="flex justify-between items-center px-4 py-4 text-sm">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  disabled={page === 0}
                  className="px-4 py-2 rounded bg-blue-100 text-blue-800 disabled:opacity-50"
                >
                  Previous
                </button>

                <span>
                  Page {page + 1} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 rounded bg-blue-100 text-blue-800 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}