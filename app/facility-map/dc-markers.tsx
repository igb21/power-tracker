'use client';

import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import { DataCenter } from '@/lib/dbSchema';

type Props = { dataCenters: DataCenter[] };

export const DC_COLOR = '#9b59b6'; // distinct purple, not used by any fuel type

// Diamond size scales logarithmically with capacity (10–26px)
function getDiamondSize(capacityMw: number | null): number {
  if (!capacityMw) return 12;
  const clamped = Math.max(1, Math.min(capacityMw, 800));
  return 10 + (Math.log(clamped) / Math.log(800)) * 16;
}

function makeDiamondIcon(size: number): L.DivIcon {
  const half = size / 2;
  return L.divIcon({
    className: '',
    html: `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <polygon
        points="${half},0 ${size},${half} ${half},${size} 0,${half}"
        fill="${DC_COLOR}" fill-opacity="0.85"
        stroke="white" stroke-width="1.5"/>
    </svg>`,
    iconSize:   [size, size],
    iconAnchor: [half, half],
    popupAnchor:[0, -half],
  });
}

export default function DCMarkers({ dataCenters }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!dataCenters || dataCenters.length === 0) return;

    const layerGroup = L.layerGroup().addTo(map);

    dataCenters.forEach((dc) => {
      const size   = getDiamondSize(dc.capacity_mw);
      const marker = L.marker([dc.latitude, dc.longitude], { icon: makeDiamondIcon(size) });

      const capStr   = dc.capacity_mw ? `${dc.capacity_mw.toLocaleString()} MW` : 'capacity TBC';
      const ownerStr = dc.owner ?? 'Unknown';

      marker.bindPopup(`
        <div style="font-size:13px;min-width:180px;">
          <div style="font-weight:600;margin-bottom:3px;">${dc.name}</div>
          <div style="color:#666;margin-bottom:2px;">${ownerStr}</div>
          <div style="color:#666;margin-bottom:4px;">${capStr}</div>
          ${dc.users   ? `<div style="color:#888;font-size:11px;">Users: ${dc.users}</div>` : ''}
          ${dc.project ? `<div style="color:#888;font-size:11px;">Project: ${dc.project}</div>` : ''}
        </div>
      `, { maxWidth: 250 });

      layerGroup.addLayer(marker);
    });

    return () => { map.removeLayer(layerGroup); };
  }, [map, dataCenters]);

  return null;
}
