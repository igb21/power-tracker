      // This page displays a map of energy facilities with filters for country, fuel type, and year range.
      // It allows users to view facilities on a map and filter them based on selected criteria.
      // The map is implemented in a separate component for better modularity within this directory.
      // the filter is implemented in a separate component in the components directory.

      'use client';

      import { useState } from 'react';
      import dynamic from 'next/dynamic';
      import SidebarFilter from '../../components/SidebarFilter';

    // Dynamically import the MapContainer component with server-side rendering disabled.
    // This ensures the map only renders on the client, avoiding issues with Leaflet in SSR environments.
    const DynamicMap = dynamic(() => import('./map-container'), { ssr: false });

    // Main page component for rendering the map and managing filter state
    export default function MapPage() {
      // Local state to manage map filters: country, fuel type, and year range
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
          <div className="flex gap-6 p-1">
            {/* Sidebar on the left */}
            <aside className="hidden md:block w-64 self-start pt-1">
              <SidebarFilter
                onFilterChange={(newFilters) => setFilters(newFilters)}
              />
            </aside>
            {/* Map on the right */}
            <main className="flex-1  bg-white p-1">
              {/* 🔵 Header Bar Above Map */}
              <div className="bg-blue-900 text-white font-bold text-sm px-4 py-2 rounded-t  border border-gray-200">
                World Facility Map
              </div>
              {/* 🗺️ Dynamic Map Component */}
              <DynamicMap filters={filters} />

              {/* Country Label Below Map */}
              {filters.country && (
                <div className="mt-1 px-2 py-1 bg-blue-50 text-blue-800 font-semibold text-sm rounded inline-block">
                  Viewing facilities in: {filters.country}
                </div>
              )}
            </main>
          </div>
        );
      }