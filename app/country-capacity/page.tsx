'use client';

/**
 * FacilityGridRoute
 *
 * This page displays a table of country-level energy capacity data.
 * Users can filter by fuel type using the sidebar, and results are fetched from an API.
 * The table includes pagination (25 rows per page) with "Previous" and "Next" buttons.
 * Country filtering is disabled, and the data is dynamically updated when filters change.
 */

import { useEffect, useState } from 'react';
import SidebarFilter from '../../components/SidebarFilter';
import type { Capacity } from '@/lib/dbSchema'; // Type for each row of capacity data

export default function FacilityGridRoute() {
  // State to track selected filters from the sidebar
  const [filters, setFilters] = useState<{
  country: string;
  fuel: number | null;
  includeMicro: boolean;
}>({
  country: '',
  fuel: null,
  includeMicro: true,
});


  // State to hold fetched data from the API
  const [data, setData] = useState<Capacity[]>([]);

  // State to track loading and error status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state: current page number
  const [page, setPage] = useState(0);

  // Number of rows to show per page
  const pageSize = 25;

  // Fetch data from the API whenever the fuel filter changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Show loading indicator
      setError(null);   // Clear previous errors

      try {
        // Build query string based on selected filters
        const params = new URLSearchParams();
        if (filters.fuel !== null) {
          params.append('fuel', filters.fuel.toString());
        }

        // Make request to backend API
        const res = await fetch(`/api/country-capacity?${params.toString()}`, {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY!, // Secure API key
          },
        });

        const json = await res.json();

        // If response is not OK, throw an error
        if (!res.ok) {
          throw new Error(json.error || 'Failed to fetch capacity data');
        }

        // Save data and reset pagination to first page
        setData(json.data);
        setPage(0);
      } catch (err: any) {
        // Show error message if something goes wrong
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false); // Hide loading indicator
      }
    };

    fetchData();
  }, [filters.fuel]); // Re-run when fuel filter changes

  // Slice the full dataset to show only rows for the current page
  const pagedData = data.slice(page * pageSize, (page + 1) * pageSize);

  // Calculate total number of pages based on data length
  const totalPages = Math.ceil(data.length / pageSize);

  return (
    <div className="h-full w-full px-4 pt-1 pb-1 z-10 relative">
      <div className="flex gap-6">
        {/* Sidebar filter component (country filter is disabled) */}
        <SidebarFilter onFilterChange={setFilters} disableCountry={true} />

        {/* Main table container */}
        <div className="flex-1 h-full overflow-y-auto rounded-lg shadow-sm border border-gray-200 bg-white pb-6">
          {/* Show loading message while data is being fetched */}
          {loading && (
            <div className="text-center mt-4 text-sm text-gray-500">Loading data...</div>
          )}

          {/* Show error message if fetch fails */}
          {error && (
            <div className="text-center mt-4 text-sm text-red-500">Error: {error}</div>
          )}

          {/* Show table only when data is loaded and no error */}
          {!loading && !error && (
            <>
              {/* Table with country and capacity columns */}
              <table className="w-full table-auto text-sm z-10">
                <thead className="bg-blue-900 text-white sticky top-0 z-10 text-left">
                  <tr>
                    <th className="px-4 py-2">Country</th>
                    <th className="px-4 py-2">Total Capacity (MW)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Render each row of paged data */}
                  {pagedData.map((row, index) => (
                    <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2 bg-white">{row.country_long}</td>
                      <td className="px-4 py-2 bg-white">{row.capacity_mw}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination controls below the table */}
              <div className="flex justify-between items-center px-4 py-3 text-sm">
                {/* Previous page button */}
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  disabled={page === 0}
                  className="px-3 py-1 rounded bg-blue-100 text-blue-800 disabled:opacity-50"
                >
                  Previous
                </button>

                {/* Current page indicator */}
                <span>
                  Page {page + 1} of {totalPages}
                </span>

                {/* Next page button */}
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1 rounded bg-blue-100 text-blue-800 disabled:opacity-50"
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