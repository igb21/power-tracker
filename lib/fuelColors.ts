// Shared fuel type colours and labels — used by both the map markers and charts.
// Keyed by fuel_code integer from the fuel_sources table.

export const fuelColorMap: Record<number, string> = {
  1:  '#0d6efd', // Hydro        — Bootstrap blue
  2:  '#ffc107', // Solar        — amber
  3:  '#fd7e14', // Gas          — orange
  4:  '#6c757d', // Other        — gray
  5:  '#212529', // Oil          — near-black
  6:  '#20c997', // Wind         — teal
  7:  '#6f42c1', // Nuclear      — purple
  8:  '#495057', // Coal         — dark gray
  9:  '#795548', // Waste        — brown
  10: '#198754', // Biomass      — green
  11: '#0dcaf0', // Wave & Tidal — cyan
  12: '#adb5bd', // Petcoke      — silver
  13: '#e83e8c', // Geothermal   — pink
  14: '#ced4da', // Storage      — light gray
  15: '#dc3545', // Cogeneration — red
  16: '#6c757d', // None         — gray
};

export const fuelLabelMap: Record<number, string> = {
  1:  'Hydro',
  2:  'Solar',
  3:  'Gas',
  4:  'Other',
  5:  'Oil',
  6:  'Wind',
  7:  'Nuclear',
  8:  'Coal',
  9:  'Waste',
  10: 'Biomass',
  11: 'Wave & Tidal',
  12: 'Petcoke',
  13: 'Geothermal',
  14: 'Storage',
  15: 'Cogeneration',
  16: 'None',
};
