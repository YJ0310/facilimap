import { FACILIMAP_CONFIG } from './config.js';
import { createCampusMap } from './map.js';
import {
  renderFacilityPins,
  getCategoryPinMeta,
  getMarkerAccessibleName,
  getStatusBadgeClass,
  escapeHtml,
} from './pins.js';
import { SAMPLE_FCSIT_FACILITIES } from './sampleFacilities.js';

const state = {
  activeView: 'map',
  activeCategory: 'all',
  searchQuery: '',
  sheetExpanded: false,
  facilities: [...SAMPLE_FCSIT_FACILITIES],
  selectedFacilityId: null,
  markersById: new Map(),
  mapController: null,
};

let toastTimer = null;

function getElements() {
  return {
    viewSections: document.querySelectorAll('.view-section'),
    viewTargetButtons: document.querySelectorAll('[data-view-target]'),
    categoryButtons: document.querySelectorAll('#category-chips .chip-btn'),
    searchInput: document.getElementById('search-input'),
    searchClearBtn: document.getElementById('search-clear-btn'),
    resetFiltersBtn: document.getElementById('btn-reset-filters'),
    resultsSummary: document.getElementById('results-summary'),
    facilityList: document.getElementById('facility-list'),
    emptyStateCard: document.getElementById('empty-state-card'),
    emptyTitle: document.getElementById('empty-state-title'),
    emptyDesc: document.getElementById('empty-state-desc'),
    facilityPanel: document.getElementById('facility-panel'),
    sheetToggleBtn: document.getElementById('sheet-toggle-btn'),
    sheetPeekTitle: document.getElementById('sheet-peek-title'),
    sheetPeekHint: document.querySelector('.sheet-peek-hint'),
    centerMapBtn: document.getElementById('btn-center-map'),
    locateMeBtn: document.getElementById('btn-locate-me'),
    coordsPill: document.getElementById('map-coords-pill'),
    mapToast: document.getElementById('map-toast'),
    mapFallback: document.getElementById('map-fallback'),
    facilityModal: document.getElementById('facility-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    statusPillText: document.getElementById('status-pill-text'),
  };
}

function showMapToast(els, message) {
  if (!els.mapToast) return;
  els.mapToast.textContent = message;
  els.mapToast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    els.mapToast.hidden = true;
  }, 2800);
}

function updateCoordsReadout(els, viewport) {
  if (!els.coordsPill || !viewport) return;
  els.coordsPill.textContent = `${viewport.lat.toFixed(4)}, ${viewport.lng.toFixed(4)} · Z${viewport.zoom}`;
}

function getFilteredFacilities() {
  const query = state.searchQuery.trim().toLowerCase();
  return state.facilities.filter((item) => {
    if (state.activeCategory !== 'all' && item.icon_key !== state.activeCategory) {
      return false;
    }
    if (!query) return true;
    const haystack = [item.name, item.building, item.floor, item.category_name]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  });
}

function openFacilityModal(facility, els) {
  if (!els.facilityModal || !els.modalTitle || !els.modalBody) return;
  const meta = getCategoryPinMeta(facility.icon_key);
  const statusClass = getStatusBadgeClass(facility.status);
  els.modalTitle.textContent = getMarkerAccessibleName(facility);
  els.modalBody.innerHTML = `
    <div class="facility-popup-badges" style="margin-bottom:14px;">
      <span class="cat-pill" style="background:${meta.bgTint};border-color:${meta.borderTint};color:${meta.textColor};">
        ${escapeHtml(facility.category_name || meta.label)} (${escapeHtml(meta.icon_key)})
      </span>
      <span class="state-pill ${statusClass}">${escapeHtml(facility.status || 'Operational')}</span>
    </div>
    <div class="facility-popup-meta" style="gap:8px;font-size:0.88rem;">
      <div><strong>Building:</strong> ${escapeHtml(facility.building || 'FCSIT')}</div>
      <div><strong>Floor:</strong> ${escapeHtml(facility.floor || 'Ground')}</div>
      <div><strong>Opening Hours:</strong> ${escapeHtml(facility.opening_hours || '07:00 – 22:00')}</div>
      <div><strong>Coordinates:</strong> ${Number(facility.latitude).toFixed(5)}, ${Number(facility.longitude).toFixed(5)}</div>
      <div><strong>Last Verified:</strong> ${escapeHtml(facility.last_verified_at || 'Pending')}</div>
    </div>
  `;
  els.facilityModal.hidden = false;
}

function renderFacilityCards(filtered, els) {
  if (!els.facilityList || !els.emptyStateCard) return;

  els.facilityList.querySelectorAll('.facility-card').forEach((node) => node.remove());

  if (filtered.length === 0) {
    els.emptyStateCard.hidden = false;
    return;
  }

  els.emptyStateCard.hidden = true;
  const fragment = document.createDocumentFragment();

  filtered.forEach((facility) => {
    const meta = getCategoryPinMeta(facility.icon_key);
    const statusClass = getStatusBadgeClass(facility.status);
    const isSelected =
      state.selectedFacilityId != null && String(facility.facility_id) === String(state.selectedFacilityId);

    const card = document.createElement('button');
    card.type = 'button';
    card.className = `facility-card${isSelected ? ' is-selected' : ''}`;
    card.dataset.facilityId = String(facility.facility_id);
    card.innerHTML = `
      <div class="facility-card-top">
        <span class="facility-card-name">${escapeHtml(getMarkerAccessibleName(facility))}</span>
        <span class="state-pill ${statusClass}">${escapeHtml(facility.status || 'Operational')}</span>
      </div>
      <div class="facility-card-cat" style="color:${meta.textColor};">
        ${meta.svg}
        <span>${escapeHtml(facility.category_name || meta.label)}</span>
      </div>
      <div class="facility-card-meta">
        <span>${escapeHtml([facility.building, facility.floor].filter(Boolean).join(' · '))}</span>
        <span>${escapeHtml(facility.opening_hours || '07:00 – 22:00')} · Verified ${escapeHtml(facility.last_verified_at || 'Pending')}</span>
      </div>
    `;

    card.addEventListener('click', () => selectFacility(facility.facility_id, els));
    fragment.appendChild(card);
  });

  els.facilityList.prepend(fragment);
}

function renderFacilities(els) {
  const filtered = getFilteredFacilities();
  const hasFilter = state.activeCategory !== 'all' || state.searchQuery.trim().length > 0;

  if (els.searchClearBtn) {
    els.searchClearBtn.hidden = state.searchQuery.length === 0;
  }
  if (els.resetFiltersBtn) {
    els.resetFiltersBtn.hidden = !hasFilter;
  }

  if (els.resultsSummary) {
    els.resultsSummary.textContent = `Showing ${filtered.length} of ${state.facilities.length} FCSIT facilities`;
  }
  if (els.sheetPeekTitle) {
    els.sheetPeekTitle.textContent = `${filtered.length} Facilities near FCSIT`;
  }

  if (els.emptyTitle && els.emptyDesc) {
    if (hasFilter && filtered.length === 0) {
      els.emptyTitle.textContent = 'No facilities found for query';
      els.emptyDesc.textContent = 'Clear search keywords or switch category filter.';
    } else {
      els.emptyTitle.textContent = 'No facilities loaded yet';
      els.emptyDesc.textContent = 'Waiting for facility coordinates.';
    }
  }

  renderFacilityCards(filtered, els);

  if (state.mapController?.facilityLayer) {
    state.markersById = renderFacilityPins(state.mapController.facilityLayer, filtered, {
      selectedFacilityId: state.selectedFacilityId,
      onSelect: (id, meta) => selectFacility(id, els, meta),
      onOpenDetails: (facility) => openFacilityModal(facility, els),
    });
  }
}

function selectFacility(facilityId, els, { fromMarker = false } = {}) {
  state.selectedFacilityId = facilityId;
  renderFacilities(els);

  const marker = state.markersById.get(String(facilityId));
  if (!marker) return;

  if (!fromMarker && state.mapController?.map) {
    state.mapController.map.panTo(marker.getLatLng(), { animate: true });
  }
  marker.openPopup();
}

function initCampusMap(els) {
  const controller = createCampusMap('map', FACILIMAP_CONFIG, {
    onViewportChange: (viewport) => updateCoordsReadout(els, viewport),
    onStatusMessage: (msg) => showMapToast(els, msg),
  });

  if (!controller) {
    if (els.mapFallback) els.mapFallback.hidden = false;
    if (els.statusPillText) els.statusPillText.textContent = 'Map Offline';
    return null;
  }

  state.mapController = controller;
  return controller;
}

function switchView(viewName, els) {
  state.activeView = viewName;

  els.viewSections.forEach((section) => {
    const isTarget = section.id === `view-${viewName}`;
    section.hidden = !isTarget;
    section.classList.toggle('is-active', isTarget);
  });

  els.viewTargetButtons.forEach((btn) => {
    const isMatch = btn.dataset.viewTarget === viewName;
    if (btn.classList.contains('nav-btn') || btn.classList.contains('mobile-nav-btn')) {
      btn.classList.toggle('is-active', isMatch);
      if (isMatch) {
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.removeAttribute('aria-current');
      }
    }
  });

  if (viewName === 'map' && state.mapController) {
    window.requestAnimationFrame(() => state.mapController.invalidateSize());
  }
}

function bindEvents(els) {
  els.viewTargetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.viewTarget;
      if (target) switchView(target, els);
    });
  });

  els.categoryButtons.forEach((chip) => {
    chip.addEventListener('click', () => {
      const selected = chip.dataset.category || 'all';
      state.activeCategory = selected;
      els.categoryButtons.forEach((item) => {
        const active = item === chip;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      renderFacilities(els);
    });
  });

  if (els.searchInput) {
    els.searchInput.addEventListener('input', (event) => {
      state.searchQuery = event.target.value;
      renderFacilities(els);
    });
  }

  if (els.searchClearBtn) {
    els.searchClearBtn.addEventListener('click', () => {
      state.searchQuery = '';
      if (els.searchInput) {
        els.searchInput.value = '';
        els.searchInput.focus();
      }
      renderFacilities(els);
    });
  }

  if (els.resetFiltersBtn) {
    els.resetFiltersBtn.addEventListener('click', () => {
      state.activeCategory = 'all';
      state.searchQuery = '';
      if (els.searchInput) els.searchInput.value = '';
      els.categoryButtons.forEach((chip) => {
        const isAll = chip.dataset.category === 'all';
        chip.classList.toggle('is-active', isAll);
        chip.setAttribute('aria-pressed', String(isAll));
      });
      renderFacilities(els);
    });
  }

  if (els.centerMapBtn) {
    els.centerMapBtn.addEventListener('click', () => {
      state.mapController?.centerOnFcsit();
    });
  }

  if (els.locateMeBtn) {
    els.locateMeBtn.addEventListener('click', () => {
      state.mapController?.locateUser();
    });
  }

  if (els.sheetToggleBtn && els.facilityPanel) {
    els.sheetToggleBtn.addEventListener('click', () => {
      state.sheetExpanded = !state.sheetExpanded;
      els.facilityPanel.classList.toggle('is-expanded', state.sheetExpanded);
      els.sheetToggleBtn.setAttribute('aria-expanded', String(state.sheetExpanded));
      if (els.sheetPeekHint) {
        els.sheetPeekHint.textContent = state.sheetExpanded ? 'Tap to collapse' : 'Tap to expand';
      }
      if (state.mapController) {
        window.setTimeout(() => state.mapController.invalidateSize(), 240);
      }
    });
  }

  if (els.modalCloseBtn && els.facilityModal) {
    els.modalCloseBtn.addEventListener('click', () => {
      els.facilityModal.hidden = true;
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !els.facilityModal.hidden) {
        els.facilityModal.hidden = true;
      }
    });
  }
}

async function checkApiHealth(els) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 1500);
  try {
    const res = await fetch(`${FACILIMAP_CONFIG.apiBaseUrl}/health`, {
      signal: controller.signal,
    });
    if (res.ok && els?.statusPillText) {
      els.statusPillText.textContent = 'API + OSM Ready';
      return true;
    }
  } catch {
    // Backend may be stopped during frontend-only development.
  } finally {
    window.clearTimeout(timer);
  }
  return false;
}

function bootstrap() {
  const els = getElements();
  initCampusMap(els);
  bindEvents(els);
  renderFacilities(els);

  if (new URLSearchParams(window.location.search).get('probeApi') === '1') {
    checkApiHealth(els);
  }

  window.FaciliMapApp = {
    config: FACILIMAP_CONFIG,
    get map() {
      return state.mapController?.map ?? null;
    },
    get facilityLayer() {
      return state.mapController?.facilityLayer ?? null;
    },
    setFacilities: (list) => {
      state.facilities = Array.isArray(list) ? list : [];
      state.selectedFacilityId = null;
      renderFacilities(els);
    },
    selectFacility: (id) => selectFacility(id, els),
    centerOnFcsit: () => state.mapController?.centerOnFcsit(),
    locateUser: () => state.mapController?.locateUser(),
    getViewport: () => state.mapController?.getViewport() ?? null,
    getState: () => ({
      ...state,
      markersById: undefined,
      mapController: undefined,
    }),
    switchView: (viewName) => switchView(viewName, els),
    checkApiHealth: () => checkApiHealth(els),
  };
}

document.addEventListener('DOMContentLoaded', bootstrap);
