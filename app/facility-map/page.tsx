'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import SidebarFilter from '../../components/SidebarFilter';
import { Badge, Button, Offcanvas } from 'react-bootstrap';
import { SlidersHorizontal } from 'lucide-react';

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

  const [showFilters, setShowFilters] = useState(false);

  const activeCount = [filters.country, filters.fuel !== null && filters.fuel !== undefined].filter(Boolean).length;

  return (
    <div className="d-flex gap-3">

      {/* Mobile filter drawer */}
      <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="fw-semibold">Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <SidebarFilter
            onFilterChange={(f) => {
              setFilters(f);
              setShowFilters(false);
            }}
          />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Desktop sidebar */}
      <div className="d-none d-md-block" style={{ width: '240px', flexShrink: 0 }}>
        <SidebarFilter onFilterChange={setFilters} />
      </div>

      {/* Map card */}
      <div className="flex-grow-1 border rounded overflow-hidden">
        <div className="bg-primary text-white fw-semibold small px-3 py-2 d-flex justify-content-between align-items-center">
          <span>World Facility Map</span>
          {/* Mobile filter toggle — only visible below md */}
          <Button
            variant="light"
            size="sm"
            className="d-md-none d-flex align-items-center gap-1 py-0 px-2"
            onClick={() => setShowFilters(true)}
          >
            <SlidersHorizontal size={13} />
            <span className="small">Filters</span>
            {activeCount > 0 && (
              <Badge bg="primary" className="ms-1" style={{ fontSize: '10px' }}>{activeCount}</Badge>
            )}
          </Button>
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
