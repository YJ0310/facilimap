/**
 * Custom Category Pins Module (T17)
 * Maps T07 icon_key values (motorcycle_parking, water_dispenser, toilet)
 * to distinct marker colors, inline SVG symbols, accessible names, and popups.
 */

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export const CATEGORY_PIN_REGISTRY = Object.freeze({
  motorcycle_parking: Object.freeze({
    icon_key: 'motorcycle_parking',
    label: 'Motorcycle Parking',
    color: '#ea580c',
    bgTint: '#fff7ed',
    borderTint: '#fdba74',
    textColor: '#9a3412',
    svg: `<svg viewBox="0 0 22 22" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
      <circle cx="5.5" cy="14" r="3" />
      <circle cx="16.5" cy="14" r="3" />
      <path d="M5.5 14h3.5l3-5.5h3.5l1 5.5M10 8.5l-2-2M14 6.5h2.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`,
  }),
  water_dispenser: Object.freeze({
    icon_key: 'water_dispenser',
    label: 'Water Dispenser',
    color: '#2563eb',
    bgTint: '#eff6ff',
    borderTint: '#93c5fd',
    textColor: '#1e40af',
    svg: `<svg viewBox="0 0 22 22" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
      <path d="M11 3.5S5.5 10 5.5 13.5a5.5 5.5 0 0 0 11 0C16.5 10 11 3.5 11 3.5Z" stroke-linejoin="round" />
      <path d="M8.8 14c0 1.4 1 2.3 2.2 2.3" stroke-linecap="round" />
    </svg>`,
  }),
  toilet: Object.freeze({
    icon_key: 'toilet',
    label: 'Toilet',
    color: '#0d9488',
    bgTint: '#ecfdf5',
    borderTint: '#6ee7b7',
    textColor: '#115e59',
    svg: `<svg viewBox="0 0 22 22" width="16" height="16" fill="currentColor" aria-hidden="true">
      <circle cx="7.5" cy="5.5" r="1.6" />
      <path d="M5.5 9.5A1.5 1.5 0 0 1 7 8h1a1.5 1.5 0 0 1 1.5 1.5V13h-1v5h-2v-5h-1V9.5Z" />
      <circle cx="14.5" cy="5.5" r="1.6" />
      <path d="M12.7 8.5c.2-.4.7-.5 1.8-.5s1.6.1 1.8.5l1 5.5h-1.6v4h-2.4v-4h-1.6l1-5.5Z" />
    </svg>`,
  }),
  default: Object.freeze({
    icon_key: 'default',
    label: 'Campus Facility',
    color: '#475569',
    bgTint: '#f8fafc',
    borderTint: '#cbd5e1',
    textColor: '#334155',
    svg: `<svg viewBox="0 0 22 22" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <circle cx="11" cy="11" r="2" fill="currentColor" stroke="none" />
    </svg>`,
  }),
});

export function getCategoryPinMeta(iconKey) {
  const key = typeof iconKey === 'string' ? iconKey.trim().toLowerCase() : '';
  return CATEGORY_PIN_REGISTRY[key] ?? CATEGORY_PIN_REGISTRY.default;
}

export function getMarkerAccessibleName(facility) {
  const name = typeof facility?.name === 'string' ? facility.name.trim() : '';
  if (name) return name;
  return getCategoryPinMeta(facility?.icon_key).label;
}

export function getStatusBadgeClass(status) {
  const normalized = String(status ?? 'Operational').trim().toLowerCase();
  if (normalized === 'maintenance') return 'status-maintenance';
  if (normalized === 'closed' || normalized === 'inactive') return 'status-closed';
  return 'status-operational';
}

export function createCategoryDivIcon(iconKey, { selected = false } = {}) {
  const meta = getCategoryPinMeta(iconKey);
  const selectedClass = selected ? ' is-selected' : '';
  const html = `
    <div class="facility-pin${selectedClass}" data-icon-key="${escapeHtml(meta.icon_key)}" style="--pin-color: ${meta.color};">
      <span class="facility-pin-halo" aria-hidden="true"></span>
      <svg class="facility-pin-drop" viewBox="0 0 36 44" width="36" height="44" aria-hidden="true">
        <path d="M18 1C8.6 1 1 8.6 1 18c0 12.6 17 25 17 25s17-12.4 17-25C35 8.6 27.4 1 18 1Z" fill="${meta.color}" stroke="#ffffff" stroke-width="2.5" />
      </svg>
      <span class="facility-pin-glyph" aria-hidden="true">${meta.svg}</span>
    </div>
  `;

  return window.L.divIcon({
    className: 'facility-pin-wrapper',
    html,
    iconSize: [36, 46],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40],
  });
}

function buildPopupHtml(facility, meta) {
  const locationParts = [facility.building, facility.floor].filter(Boolean);
  const locationText = locationParts.length > 0 ? locationParts.join(' · ') : 'FCSIT Campus';
  const statusText = facility.status || 'Operational';
  const statusClass = getStatusBadgeClass(statusText);

  return `
    <div class="facility-popup">
      <div class="facility-popup-title">${escapeHtml(getMarkerAccessibleName(facility))}</div>
      <div class="facility-popup-badges">
        <span class="cat-pill" style="background:${meta.bgTint};border-color:${meta.borderTint};color:${meta.textColor};">
          ${escapeHtml(facility.category_name || meta.label)}
        </span>
        <span class="state-pill ${statusClass}">${escapeHtml(statusText)}</span>
      </div>
      <div class="facility-popup-meta">
        <div><strong>Location:</strong> ${escapeHtml(locationText)}</div>
        <div><strong>Hours:</strong> ${escapeHtml(facility.opening_hours || '07:00 – 22:00')}</div>
        <div><strong>Verified:</strong> ${escapeHtml(facility.last_verified_at || 'Pending')}</div>
      </div>
      <button type="button" class="btn btn-primary btn-sm popup-details-btn" data-facility-id="${escapeHtml(facility.facility_id)}">
        View Details &rarr;
      </button>
    </div>
  `;
}

export function createFacilityMarker(facility, { selected = false, onSelect, onOpenDetails } = {}) {
  const lat = Number(facility?.latitude);
  const lng = Number(facility?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const meta = getCategoryPinMeta(facility.icon_key);
  const accessibleName = getMarkerAccessibleName(facility);
  const icon = createCategoryDivIcon(meta.icon_key, { selected });

  const marker = window.L.marker([lat, lng], {
    icon,
    title: accessibleName,
    alt: accessibleName,
    keyboard: true,
    riseOnHover: true,
  });

  marker.bindPopup(buildPopupHtml(facility, meta), {
    maxWidth: 270,
    minWidth: 220,
    closeButton: true,
  });

  marker.on('click', () => {
    if (typeof onSelect === 'function') {
      onSelect(facility.facility_id, { fromMarker: true });
    }
  });

  marker.on('popupopen', (event) => {
    const popupEl = event.popup.getElement();
    const detailsBtn = popupEl?.querySelector('.popup-details-btn');
    if (detailsBtn && typeof onOpenDetails === 'function') {
      detailsBtn.addEventListener('click', () => onOpenDetails(facility));
    }
  });

  return marker;
}

export function renderFacilityPins(facilityLayer, facilities = [], options = {}) {
  const markersById = new Map();
  if (!facilityLayer || typeof window.L !== 'object') {
    return markersById;
  }

  facilityLayer.clearLayers();
  const { selectedFacilityId = null, onSelect, onOpenDetails } = options;

  facilities.forEach((facility) => {
    const isSelected = selectedFacilityId != null && String(facility.facility_id) === String(selectedFacilityId);
    const marker = createFacilityMarker(facility, {
      selected: isSelected,
      onSelect,
      onOpenDetails,
    });
    if (marker) {
      marker.addTo(facilityLayer);
      markersById.set(String(facility.facility_id), marker);
    }
  });

  return markersById;
}
