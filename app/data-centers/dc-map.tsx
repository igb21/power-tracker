'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { DataCenter } from '@/lib/dbSchema';
import DCMarkers from '../facility-map/dc-markers';

export default function DCMap({ facilities }: { facilities: DataCenter[] }) {
  const mapRef = useRef<L.Map | null>(null);

  // Fit map to filtered facilities whenever the set changes
  useEffect(() => {
    if (!mapRef.current || facilities.length === 0) return;
    const bounds = L.latLngBounds(
      facilities.map((dc) => [dc.latitude, dc.longitude] as [number, number])
    );
    mapRef.current.fitBounds(bounds, { padding: [40, 40] });
  }, [facilities]);

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer
        center={[38, -97]}
        zoom={4}
        scrollWheelZoom={true}
        style={{ height: '420px', width: '100%' }}
        ref={(instance) => { if (instance) mapRef.current = instance; }}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          attribution="&copy; ESRI"
        />
        <DCMarkers facilities={facilities} />
      </MapContainer>

      {/* Stage legend */}
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
        minWidth: '120px',
      }}>
        <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '6px', borderBottom: '1px solid #dee2e6', paddingBottom: '4px' }}>
          Stage
        </div>
        {[
          { label: 'Active',       color: '#6f42c1' },
          { label: 'Construction', color: '#fd7e14' },
          { label: 'Announcement', color: '#ffc107' },
          { label: 'Land Bank',    color: '#20c997' },
          { label: 'Other',        color: '#adb5bd' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
            <div style={{ width: 10, height: 10, borderRadius: '2px', background: color, border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0 }} />
            <span>{label}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #dee2e6', marginTop: '5px', paddingTop: '5px', color: '#888', fontSize: '10px' }}>
          Square size = capacity
        </div>
      </div>
    </div>
  );
}
