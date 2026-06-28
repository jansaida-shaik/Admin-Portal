/**
 * Global location constants — single source of truth for all modules.
 * Add new cities/branches here and they propagate everywhere automatically.
 */

export const CITIES = [
  { value: 'Vijayawada',    label: 'Vijayawada',    color: '#F58220' },
  { value: 'Hyderabad',     label: 'Hyderabad',     color: '#245fb4' },
  { value: 'Visakhapatnam', label: 'Visakhapatnam', color: '#10b981' },
];

/** SearchableSelect-ready options with "All" prepended */
export const CITY_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Locations' },
  ...CITIES.map(c => ({ value: c.value, label: c.label })),
];

/** Plain <select> <option> list */
export const CITY_SELECT_OPTIONS = CITIES.map(c => ({
  value: c.value,
  label: c.label,
}));

/** Color map for dot indicators */
export const CITY_COLOR = Object.fromEntries(CITIES.map(c => [c.value, c.color]));

/** Raw city name strings */
export const CITY_NAMES = CITIES.map(c => c.value);
