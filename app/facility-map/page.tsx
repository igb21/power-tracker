'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import SidebarFilter from '../../components/SidebarFilter';
import { Badge } from 'react-bootstrap';

const DynamicMap = dynamic(() => import('./map-container'), { ssr: false });

export default function MapPage() {
  const [filters, setFilters] = useState<{
    country: string;
    fuel: number | null;
    includeMicro: boolean;
  }>({
    country: '',
    fuel: null,
    includeMicro: false,
  });

  return (
    <div className="d-flex gap-3">
      {/* Sidebar */}
      <div className="d-none d-md-block" style={{ width: '240px', flexShrink: 0 }}>
        <SidebarFilter onFilterChange={setFilters} />
      </div>

      {/* Map card */}
      <div className="flex-grow-1 border rounded overflow-hidden">
        <div className="bg-primary text-white fw-semibold small px-3 py-2">
          World Facility Map
        </div>
        <DynamicMap filters={filters} />
        {filters.country && (
          <div className="px-2 py-1">
            <Badge bg="primary">Viewing facilities in: {filters.country}</Badge>
          </div>
        )}
      </div>
    </div>
  );
}
