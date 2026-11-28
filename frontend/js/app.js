import { FACILIMAP_CONFIG } from './config.js';

const state = {
  activeView: 'map',
  activeCategory: 'all',
  searchQuery: '',
  sheetExpanded: false,
  map: null,
  tileLayer: null,
};

function getElements() {
  return {
    viewSections: document.querySelectorAll('.view-section'),
    viewTargetButtons: document.querySelectorAll('[data-view-target]'),
    categoryButtons: document.querySelectorAll('#category-chips .chip-btn'),
    searchInput: document.getElementById('search-input'),
    searchClearBtn: document.getElementById('search-clear-btn'),
    resetFiltersBtn: document.getElementById('btn-reset-filters'),
    resultsSummary: document.getElementById('results-summary'),
    emptyTitle: document.getElementById('empty-state-title'),
    emptyDesc: document.getElementById('empty-state-desc'),
    facilityPanel: document.getElementById('facility-panel'),
    sheetToggleBtn: document.getElementById('sheet-toggle-btn'),
    sheetPeekHint: document.querySelector('.sheet-peek-hint'),
    centerMapBtn: document.getElementById('btn-center-map'),
    mapFallback: document.getElementById('map-fallback'),
    facilityModal: document.getElementById('facility-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    statusPillText: document.getElementById('status-pill-text'),
  };
}

function initLeafletMap(els) {
  if (typeof window.L !== 'object' || !window.L.map) {
    if (els.mapFallback) els.mapFallback.hidden = false;
    if (els.statusPillText) els.statusPillText.textContent = 'Map Offline';
    return null;
  }

  const map = window.L.map('map', {
    center: FACILIMAP_CONFIG.defaultCenter,
    zoom: FACILIMAP_CONFIG.defaultZoom,
    minZoom: FACILIMAP_CONFIG.minZoom,
    maxZoom: FACILIMAP_CONFIG.maxZoom,
    zoomControl: true,
  });

  const tileLayer = window.L.tileLayer(FACILIMAP_CONFIG.osmTileUrl, {
    minZoom: FACILIMAP_CONFIG.minZoom,
    maxZoom: FACILIMAP_CONFIG.maxZoom,
    attribution: FACILIMAP_CONFIG.osmAttribution,
  });

  tileLayer.addTo(map);
  state.map = map;
  state.tileLayer = tileLayer;
  return map;
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

  if (viewName === 'map' && state.map) {
    window.requestAnimationFrame(() => state.map.invalidateSize());
  }
}

function updateFilterUI(els) {
  const hasFilter = state.activeCategory !== 'all' || state.searchQuery.trim().length > 0;

  if (els.searchClearBtn) {
    els.searchClearBtn.hidden = state.searchQuery.length === 0;
  }
  if (els.resetFiltersBtn) {
    els.resetFiltersBtn.hidden = !hasFilter;
  }

  if (els.resultsSummary) {
    els.resultsSummary.textContent = hasFilter
      ? 'Filters active (awaiting T16/T17 facility data)'
      : 'Map base initialized (FCSIT)';
  }

  if (els.emptyTitle && els.emptyDesc) {
    if (hasFilter) {
      els.emptyTitle.textContent = 'No matching facilities yet';
      els.emptyDesc.textContent =
        'Filter state is active. Live keyword search and facility markers will be wired in T16–T19.';
    } else {
      els.emptyTitle.textContent = 'No facilities loaded yet';
      els.emptyDesc.textContent =
        'Leaflet & OpenStreetMap base is ready. Facility markers and live search will populate in T16–T19.';
    }
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
      updateFilterUI(els);
    });
  });

  if (els.searchInput) {
    els.searchInput.addEventListener('input', (event) => {
      state.searchQuery = event.target.value;
      updateFilterUI(els);
    });
  }

  if (els.searchClearBtn) {
    els.searchClearBtn.addEventListener('click', () => {
      state.searchQuery = '';
      if (els.searchInput) {
        els.searchInput.value = '';
        els.searchInput.focus();
      }
      updateFilterUI(els);
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
      updateFilterUI(els);
    });
  }

  if (els.centerMapBtn) {
    els.centerMapBtn.addEventListener('click', () => {
      if (state.map) {
        state.map.setView(FACILIMAP_CONFIG.defaultCenter, FACILIMAP_CONFIG.defaultZoom, {
          animate: true,
        });
      }
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
      if (state.map) {
        window.setTimeout(() => state.map.invalidateSize(), 240);
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
    // Backend may be stopped during frontend-only Setup (T10).
  } finally {
    window.clearTimeout(timer);
  }
  return false;
}

function bootstrap() {
  const els = getElements();
  initLeafletMap(els);
  bindEvents(els);
  updateFilterUI(els);

  if (new URLSearchParams(window.location.search).get('probeApi') === '1') {
    checkApiHealth(els);
  }

  window.FaciliMapApp = {
    config: FACILIMAP_CONFIG,
    get map() {
      return state.map;
    },
    getState: () => ({ ...state, map: undefined, tileLayer: undefined }),
    switchView: (viewName) => switchView(viewName, els),
    checkApiHealth: () => checkApiHealth(els),
  };
}

document.addEventListener('DOMContentLoaded', bootstrap);
