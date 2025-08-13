'use client';

/**
 * MapContainerComponent
 * 
 * This component displays a Leaflet map with clustered facility markers.
 * It fetches facility data based on filters, allows editing a facility via a modal,
 * and zooms to the selected facility after an update.
 */

import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useState, useEffect, useRef } from 'react';
import FacilityEditor from '../../components/FacilityEditor';
import { Facility } from '@/lib/dbSchema';
import ClusteredFacilities from './clustered-markers';

type Filters = {
  country: string;
  fuel: number | null;
  includeMicro: boolean;
};

export default function MapContainerComponent({ filters }: { filters: Filters }) {
  // Stores the currently selected facility for editing
  const [modalFacility, setModalFacility] = useState<Facility | null>(null);

  // Stores the list of facilities to display on the map
  const [facilityData, setFacilityData] = useState<Facility[]>([]);

  // Loading and error states for API fetch
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reference to the Leaflet map instance
  const mapRef = useRef<L.Map | null>(null);

  // Stores coordinates of the selected facility to zoom to after update
  const zoomTargetRef = useRef<L.LatLng | null>(null);

  // Fetch facility data when filters change
  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        // Build query parameters from filters
        if (filters.country) params.append('country', filters.country);
        if (filters.fuel !== null) params.append('fuel', filters.fuel.toString());
        params.append('includeMicro', filters.includeMicro.toString());

        const url = `/api/facilities?${params.toString()}`;
        const apiKey = process.env.NEXT_PUBLIC_REST_API_KEY;

        if (!apiKey) throw new Error('Missing API key');

        const res = await fetch(url, {
          headers: { 'x-api-key': apiKey },
        });

        const json = await res.json();

        if (!res.ok) {
          console.error('API error:', json);
          throw new Error(json.error || 'Failed to fetch facilities');
        }

        // Update facility data with response
        setFacilityData(json.data);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [filters.country, filters.fuel, filters.includeMicro]);

  // Recenter or zoom map when facility data updates
  useEffect(() => {
    if (!mapRef.current || facilityData.length === 0) return;

    if (zoomTargetRef.current) {
      // Zoom to the selected facility after update
      mapRef.current.setView(zoomTargetRef.current, 9); 
      zoomTargetRef.current = null; // Clear the target after zooming
    } else {
      // Default behavior: fit map to all facility markers
      const bounds = L.latLngBounds(
        facilityData.map((f) => [f.latitude, f.longitude] as [number, number])
      );
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [facilityData]);

  return (
    <>
      <MapContainer
        center={[40, -100]} // Initial center of the map
        zoom={4} // Initial zoom level
        scrollWheelZoom={true}
        style={{ height: '80vh', width: '100%' }}
        ref={(instance) => {
          if (instance) {
            mapRef.current = instance; // Store map instance for later use
          }
        }}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          attribution="&copy; ESRI"
        />
        <ClusteredFacilities
          facilities={facilityData}
          onSelect={(facility) => {
            // When a marker is selected, open the modal and store its coordinates
            setModalFacility(facility);
            zoomTargetRef.current = L.latLng(facility.latitude, facility.longitude);
          }}
        />
      </MapContainer>

      {/* Show loading message while fetching data */}
      {loading && (
        <div className="text-center mt-4 text-sm text-gray-500">Loading facilities...</div>
      )}

      {/* Show error message if fetch fails */}
      {error && (
        <div className="text-center mt-4 text-sm text-red-500">Error: {error}</div>
      )}

      {/* Show modal editor when a facility is selected */}
      {modalFacility && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <FacilityEditor
            initialData={modalFacility}
            onSubmit={(updated) => {
              // Update the facility in the list
              setFacilityData((prev) =>
                prev.map((f) => (f.gppd_idnr === updated.gppd_idnr ? updated : f))
              );

              // Coordinates already stored in zoomTargetRef
              setModalFacility(null); // Close the modal
            }}
            onClose={() => setModalFacility(null)}
          />
        </div>
      )}
    </>
  );
}