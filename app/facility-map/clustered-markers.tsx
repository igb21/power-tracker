'use client';

import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import { Facility } from '@/lib/dbSchema';
import { fuelColorMap, fuelLabelMap } from '@/lib/fuelColors';

type Props = {
  facilities: Facility[];
  onSelect: (facility: Facility) => void;
};

// Logarithmic radius: small facilities ~3px, large ones ~11px
function getRadius(capacityMw: number): number {
  const clamped = Math.max(1, Math.min(capacityMw, 5000));
  return 3 + (Math.log(clamped) / Math.log(5000)) * 8;
}

// Z-order priority: higher number = drawn last = appears on top.
// Order (top to bottom): Solar, Hydro, Wind, Nuclear, Coal, Gas, then others.
const fuelZOrder: Record<number, number> = {
  8:  6, // Coal
  3:  5, // Gas
  7:  4, // Nuclear
  6:  3, // Wind
  1:  2, // Hydro
  2:  1, // Solar
  // everything else defaults to 0
};

export default function CanvasFacilities({ facilities, onSelect }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!facilities || facilities.length === 0) return;

    // Single shared canvas renderer for all markers — the key to performance
    const renderer = L.canvas({ padding: 0.5 });
    const layerGroup = L.layerGroup().addTo(map);

    // Sort so "others" are added first, primary fuels last (= on top in canvas)
    const sorted = [...facilities].sort(
      (a, b) => (fuelZOrder[a.fuel_code ?? 0] ?? 0) - (fuelZOrder[b.fuel_code ?? 0] ?? 0)
    );

    sorted.forEach((facility) => {
      const fuelCode = facility.fuel_code ?? 0;
      const capacityMw = facility.capacity_mw ?? 1;
      const color = fuelColorMap[fuelCode] ?? '#6c757d';
      const label = fuelLabelMap[fuelCode] ?? 'Unknown';

      const marker = L.circleMarker(
        [facility.latitude, facility.longitude],
        {
          renderer,
          radius: getRadius(capacityMw),
          fillColor: color,
          color: 'rgba(255,255,255,0.6)',
          weight: 0.8,
          fillOpacity: 0.6,
        }
      );

      // Popup using a unique id so we can attach the click handler after open
      const popupId = `vd-${facility.gppd_idnr}`;
      marker.bindPopup(`
        <div style="font-size:13px;min-width:160px;">
          <div style="font-weight:600;margin-bottom:3px;">${facility.name}</div>
          <div style="color:#666;margin-bottom:6px;">${label} &mdash; ${capacityMw.toLocaleString()} MW</div>
          <button id="${popupId}"
            style="background:none;border:none;padding:0;color:#0d6efd;text-decoration:underline;cursor:pointer;font-size:13px;">
            View / Edit
          </button>
        </div>
      `, { maxWidth: 240 });

      marker.on('popupopen', () => {
        document.getElementById(popupId)?.addEventListener('click', () => {
          onSelect(facility);
        });
      });

      layerGroup.addLayer(marker);
    });

    return () => {
      map.removeLayer(layerGroup);
    };
  }, [map, facilities, onSelect]);

  return null;
}
