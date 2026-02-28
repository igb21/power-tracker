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
import { Facility, DataCenter } from '@/lib/dbSchema';
import ClusteredFacilities from './clustered-markers';
import DCMarkers, { DC_COLOR } from './dc-markers';

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

  // AI data centers (fetched once, filter-independent)
  const [dcData, setDcData] = useState<DataCenter[]>([]);

  // Loading and error states for API fetch
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reference to the Leaflet map instance
  const mapRef = useRef<L.Map | null>(null);

  // Stores coordinates of the selected facility to zoom to after update
  const zoomTargetRef = useRef<L.LatLng | null>(null);

  // Fetch data centers once on mount
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_REST_API_KEY;
    if (!apiKey) return;
    fetch('/api/data-centers', { headers: { 'x-api-key': apiKey } })
      .then((r) => r.json())
      .then((j) => setDcData(j.data ?? []))
      .catch(console.error);
  }, []);

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
      {/* Map wrapper — position:relative so the legend can overlay */}
      <div style={{ position: 'relative' }}>
        <MapContainer
          center={[40, -100]}
          zoom={4}
          scrollWheelZoom={true}
          style={{ height: '80vh', width: '100%' }}
          ref={(instance) => {
            if (instance) mapRef.current = instance;
          }}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; ESRI"
          />
          <ClusteredFacilities
            facilities={facilityData}
            onSelect={(facility) => {
              setModalFacility(facility);
              zoomTargetRef.current = L.latLng(facility.latitude, facility.longitude);
            }}
          />
          <DCMarkers dataCenters={dcData} />
        </MapContainer>

        {/* Legend overlay — bottom-left, above Leaflet controls */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '10px',
          zIndex: 1000,
          background: 'rgba(255,255,255,0.96)',
          border: '1px solid #dee2e6',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '11px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          maxHeight: '260px',
          overflowY: 'auto',
          minWidth: '130px',
        }}>
          <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '6px', borderBottom: '1px solid #dee2e6', paddingBottom: '4px' }}>
            Fuel Type
          </div>
          {[
            { label: 'Hydro',         color: '#0d6efd' },
            { label: 'Solar',         color: '#ffc107' },
            { label: 'Gas',           color: '#fd7e14' },
            { label: 'Wind',          color: '#20c997' },
            { label: 'Nuclear',       color: '#6f42c1' },
            { label: 'Coal',          color: '#495057' },
            { label: 'Oil',           color: '#212529' },
            { label: 'Biomass',       color: '#198754' },
            { label: 'Geothermal',    color: '#e83e8c' },
            { label: 'Cogeneration',  color: '#dc3545' },
            { label: 'Wave & Tidal',  color: '#0dcaf0' },
            { label: 'Waste',         color: '#795548' },
            { label: 'Storage',       color: '#ced4da' },
            { label: 'Other',         color: '#6c757d' },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0 }} />
              <span>{label}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #dee2e6', marginTop: '6px', paddingTop: '6px' }}>
            <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '5px' }}>AI Data Centers</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
                <polygon points="6,0 12,6 6,12 0,6" fill={DC_COLOR} fillOpacity="0.85" stroke="white" strokeWidth="1.5"/>
              </svg>
              <span>Data Center</span>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #dee2e6', marginTop: '5px', paddingTop: '5px', color: '#888', fontSize: '10px' }}>
            Circle/diamond size = capacity
          </div>
        </div>
      </div>

      {/* Loading / error states */}
      {loading && <div className="text-center mt-3 text-muted small">Loading facilities...</div>}
      {error   && <div className="text-center mt-3 text-danger small">Error: {error}</div>}

      {/* Facility editor modal */}
      {modalFacility && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000,
        }}>
          <FacilityEditor
            initialData={modalFacility}
            onSubmit={(updated) => {
              setFacilityData((prev) =>
                prev.map((f) => (f.gppd_idnr === updated.gppd_idnr ? updated : f))
              );
              setModalFacility(null);
            }}
            onClose={() => setModalFacility(null)}
          />
        </div>
      )}
    </>
  );
}