// Shared fuel type colours and labels — used by both the map markers and charts.
// Keyed by fuel_code integer from the fuel_sources table.

// ── Ember variable colours ────────────────────────────────────────────────────
// Keyed by Ember variable name (matches ember_yearly.variable).
// Stack order (index = bottom → top on area chart):
export const EMBER_FUEL_ORDER = [
  'Coal', 'Gas', 'Other Fossil', 'Nuclear',
  'Hydro', 'Bioenergy', 'Other Renewables', 'Wind', 'Solar',
];

export const emberColorMap: Record<string, string> = {
  'Coal':             '#495057', // dark gray
  'Gas':              '#fd7e14', // orange
  'Other Fossil':     '#6c757d', // gray
  'Nuclear':          '#6f42c1', // purple
  'Hydro':            '#0d6efd', // blue
  'Bioenergy':        '#198754', // green
  'Other Renewables': '#e83e8c', // pink
  'Wind':             '#20c997', // teal
  'Solar':            '#ffc107', // amber
};

// ── GPPD fuel_code → Ember variable name ────────────────────────────────────
// Used to translate the SidebarFilter fuel selection to an Ember query filter.
// null = no direct Ember equivalent for that GPPD fuel type.
export const gppdToEmber: Record<number, string | null> = {
  1:  'Hydro',
  2:  'Solar',
  3:  'Gas',
  4:  'Other Fossil',
  5:  'Other Fossil',    // Oil
  6:  'Wind',
  7:  'Nuclear',
  8:  'Coal',
  9:  'Bioenergy',       // Waste
  10: 'Bioenergy',       // Biomass
  11: 'Other Renewables',// Wave & Tidal
  12: 'Other Fossil',    // Petcoke
  13: 'Other Renewables',// Geothermal
  14: null,              // Storage
  15: null,              // Cogeneration
  16: null,              // None
};

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
