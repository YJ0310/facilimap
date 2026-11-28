/**
 * FaciliMap Frontend Configuration (T10)
 * Aligns map defaults, API endpoint, and T07 facility categories.
 */
export const FACILIMAP_CONFIG = Object.freeze({
  apiBaseUrl: 'http://localhost:3000/api',
  defaultCenter: Object.freeze([3.1282, 101.6507]), // FCSIT, Universiti Malaya
  defaultZoom: 17,
  minZoom: 14,
  maxZoom: 19,
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
