'use client';

import { useEffect, useState } from 'react';
import { Button, Table, Spinner } from 'react-bootstrap';
import SidebarFilter from '../../components/SidebarFilter';
import type { Capacity } from '@/lib/dbSchema';

export default function FacilityGridRoute() {
  const [filters, setFilters] = useState<{
    country: string;
    fuel: number | null;
    includeMicro: boolean;
  }>({ country: '', fuel: null, includeMicro: true });

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
        if (filters.fuel !== null) params.append('fuel', filters.fuel.toString());
        const res = await fetch(`/api/country-capacity?${params.toString()}`, {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_REST_API_KEY! },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to fetch capacity data');
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
    <div>
      {/* Mobile filter toggle */}
      <Button
        variant="primary"
        size="sm"
        className="d-md-none mb-2"
        onClick={() => setShowSidebar((prev) => !prev)}
      >
        {showSidebar ? 'Hide Filters' : 'Show Filters'}
      </Button>

      <div className="d-flex flex-column flex-md-row gap-3">
        {/* Sidebar */}
        {showSidebar && (
          <div style={{ width: '240px', flexShrink: 0 }}>
            <SidebarFilter onFilterChange={setFilters} disableCountry={true} />
          </div>
        )}

        {/* Table card */}
        <div className="flex-grow-1 border rounded bg-white">
          {loading && (
            <div className="d-flex justify-content-center py-4">
              <Spinner animation="border" variant="primary" size="sm" />
            </div>
          )}
          {error && <p className="text-danger text-center py-3 small">Error: {error}</p>}

          {!loading && !error && (
            <>
              <div className="table-responsive">
                <Table striped hover size="sm" className="mb-0">
                  <thead className="table-primary">
                    <tr>
                      <th>Country</th>
                      <th>Total Capacity (MW)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedData.map((row, index) => (
                      <tr key={index}>
                        <td>{row.country_long}</td>
                        <td>{row.capacity_mw}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <span className="text-muted small">Page {page + 1} of {totalPages}</span>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                  disabled={page >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
