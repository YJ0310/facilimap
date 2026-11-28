/**
 * FaciliMap Frontend Configuration (T10 / T16)
 * Aligns FCSIT UM map bounds, center coordinates, API endpoint, and T07 categories.
 */
export const FACILIMAP_CONFIG = Object.freeze({
  apiBaseUrl: 'http://localhost:3000/api',
  campusLabel: 'FCSIT, Universiti Malaya',
  defaultCenter: Object.freeze([3.1282, 101.6506]), // FCSIT UM (T16)
  defaultZoom: 17,
  minZoom: 15,
  maxZoom: 19,
  fcsitFocusRadiusMeters: 145,
  campusBounds: Object.freeze([
    Object.freeze([3.1225, 101.6445]),
    Object.freeze([3.1340, 101.6570]),
  ]),
  osmTileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  osmAttribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
  categories: Object.freeze([
    Object.freeze({
      name: 'Motorcycle Parking',
      icon_key: 'motorcycle_parking',
      markerSymbol: 'Motorcycle',
      color: '#ea580c',
    }),
    Object.freeze({
      name: 'Water Dispenser',
      icon_key: 'water_dispenser',
      markerSymbol: 'Water droplet',
      color: '#2563eb',
    }),
    Object.freeze({
      name: 'Toilet',
      icon_key: 'toilet',
      markerSymbol: 'Restroom sign',
      color: '#0d9488',
    }),
  ]),
});
