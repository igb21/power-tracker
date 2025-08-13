'use client';

import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Facility } from '@/lib/dbSchema';

//  Component props definition
type Props = {
  facilities: Facility[];
  onSelect: (facility: Facility) => void;
};

// Fuel code metadata map (label + icon)
const fuelCodeMap: Record<number, { label: string; iconUrl: string }> = {
  1: { label: 'Hydro', iconUrl: '/icons/hydro.svg' },
  2: { label: 'Solar', iconUrl: '/icons/solar.svg' },
  3: { label: 'Gas', iconUrl: '/icons/gas.svg' },
  4: { label: 'Other', iconUrl: '/icons/unknown.svg' },
  5: { label: 'Oil', iconUrl: '/icons/oil.svg' },
  6: { label: 'Wind', iconUrl: '/icons/wind.svg' },
  7: { label: 'Nuclear', iconUrl: '/icons/nuclear.svg' },
  8: { label: 'Coal', iconUrl: '/icons/coal.svg' },
  9: { label: 'Waste', iconUrl: '/icons/biomass.svg' },
  10: { label: 'Biomass', iconUrl: '/icons/biomass.svg' },
  11: { label: 'Wave and Tidal', iconUrl: '/icons/wave.svg' },
  12: { label: 'Petcoke', iconUrl: '/icons/unknown.svg' },
  13: { label: 'Geothermal', iconUrl: '/icons/geothermal.svg' },
  14: { label: 'Storage', iconUrl: '/icons/unknown.svg' },
  15: { label: 'Cogeneration', iconUrl: '/icons/cogeneration.svg' },
  16: { label: 'None', iconUrl: '/icons/unknwn.svg' },
};

// Calculates icon size based on facility capacity
function getIconSize(capacityMw: number): [number, number] {
  const minCapacity = 1;
  const maxCapacity = 1000;
  const minSize = 24;
  const maxSize = 48;

  const clamped = Math.max(minCapacity, Math.min(capacityMw, maxCapacity));
  const size = minSize + ((clamped - minCapacity) / (maxCapacity - minCapacity)) * (maxSize - minSize);
  return [size, size];
}

// Generates a Leaflet DivIcon for a facility marker
function getFuelIcon(fuelCode: number, capacityMw: number): L.DivIcon {
  const size = getIconSize(capacityMw);
  const fuelMeta = fuelCodeMap[fuelCode];
  const iconUrl = fuelMeta?.iconUrl ?? '/icons/default.svg';

  return L.divIcon({
    className: '', // Prevents Leaflet default styles
    html: `
      <div style="
        width:${size[0]}px;
        height:${size[1]}px;
        display:inline-block;
        overflow:hidden;">
        <img src="${iconUrl}" style="width:${size[0]}px; height:${size[1]}px;" />
      </div>
    `,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1] / 2],
  });
}

// Creates a custom cluster icon with centered count and blue styling
function createClusterCustomIcon(cluster: L.MarkerCluster): L.DivIcon {
  const count = cluster.getChildCount();

  return L.divIcon({
    html: `
      <div class="w-10 h-10 rounded-full bg-blue-900 border-2 border-white flex items-center justify-center">
        <div class="text-white text-sm font-semibold">${count}</div>
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: [40, 40],
  });
}

//  Main component: renders clustered facility markers on the map
export default function ClusteredFacilities({ facilities, onSelect }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!facilities || facilities.length === 0) return;

    // Create cluster group with custom icon renderer
    const clusterGroup = L.markerClusterGroup({
      disableClusteringAtZoom: 7,
      iconCreateFunction: createClusterCustomIcon,
    });

    // Add each facility marker to the cluster group
    facilities.forEach((facility) => {
      const fuelCode = facility.fuel_code ?? 0;
      const capacityMw = facility.capacity_mw ?? 1;
      const icon = getFuelIcon(fuelCode, capacityMw);
      const fuelLabel = fuelCodeMap[fuelCode]?.label ?? 'Unknown';

      const marker = L.marker([facility.latitude, facility.longitude], { icon });

      // Create popup content with facility info and action
      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div class="space-y-1">
          <div class="font-semibold text-sm">${facility.name}</div>
          <div class="text-xs text-gray-600">${fuelLabel} — ${capacityMw} MW</div>
          <button class="text-blue-700 underline font-medium hover:text-blue-500 transition">View Details</button>
        </div>
      `;

      //  Handle popup button click
      popupContent.querySelector('button')?.addEventListener('click', () => {
        onSelect(facility);
      });

      marker.bindPopup(popupContent);
      clusterGroup.addLayer(marker);
    });

    //  Add cluster group to map
    map.addLayer(clusterGroup);

    // Cleanup on unmount
    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, facilities, onSelect]);

  return null;
}