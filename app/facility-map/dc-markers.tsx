'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { DataCenter } from '@/lib/dbSchema';

// Color each stage
const STAGE_COLOR: Record<string, string> = {
  'Active':                   '#6f42c1',   // purple
  'Construction':             '#fd7e14',   // orange
  'Announcement':             '#ffc107',   // yellow
  'Land Bank':                '#20c997',   // teal
  'Delayed':                  '#6c757d',   // gray
  'Cancelled':                '#dc3545',   // red
  'Not Approved/Withdrawn':   '#dc3545',   // red
};

function stageColor(stage: string | null): string {
  return STAGE_COLOR[stage ?? ''] ?? '#adb5bd';
}

function dcIcon(dc: DataCenter): L.DivIcon {
  const color  = stageColor(dc.stage);
  const size   = dc.capacity_mw
    ? Math.max(8, Math.min(28, 6 + Math.sqrt(dc.capacity_mw) * 0.7))
    : 9;
  const border = dc.is_ai ? '2px solid #fff' : '1.5px solid rgba(0,0,0,0.25)';
  const shape  = 'border-radius:2px';   // square = data center, circle = power plant

  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px; height:${size}px;
      background:${color};
      border:${border};
      ${shape};
      opacity:0.88;
    "></div>`,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function DCMarkers({ facilities }: { facilities: DataCenter[] }) {
  return (
    <>
      {facilities.map((dc, i) => (
        <Marker key={dc.id ?? `dc-${i}`} position={[dc.latitude, dc.longitude]} icon={dcIcon(dc)}>
          <Popup>
            <strong>{dc.name ?? 'Unnamed'}</strong><br />
            {dc.operator && <><em>{dc.operator}</em><br /></>}
            {dc.city && dc.state && <>{dc.city}, {dc.state}<br /></>}
            Stage: {dc.stage ?? 'Unknown'}<br />
            {dc.capacity_mw != null && <>Capacity: {dc.capacity_mw.toLocaleString()} MW<br /></>}
            {dc.is_ai === 1 && <span style={{ color: '#6f42c1', fontWeight: 600 }}>AI Facility</span>}
          </Popup>
        </Marker>
      ))}
    </>
  );
}
