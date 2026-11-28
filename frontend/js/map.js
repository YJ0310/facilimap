/**
 * FCSIT Campus Leaflet Map Controller (T16)
 * Renders the interactive Leaflet map centered on FCSIT UM (3.1282, 101.6506),
 * manages campus bounds, focus overlay, metric scale, geolocation, and facility layer.
 */
export function createCampusMap(containerId, config, callbacks = {}) {
  if (typeof window.L !== 'object' || !window.L.map) {
    return null;
  }

  const L = window.L;
  const map = L.map(containerId, {
    center: config.defaultCenter,
    zoom: config.defaultZoom,
    minZoom: config.minZoom,
    maxZoom: config.maxZoom,
    maxBounds: config.campusBounds,
    maxBoundsViscosity: 0.7,
    zoomControl: true,
  });

  L.tileLayer(config.osmTileUrl, {
    minZoom: config.minZoom,
    maxZoom: config.maxZoom,
    attribution: config.osmAttribution,
  }).addTo(map);

  L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

  // Subtle FCSIT campus focus boundary & center reference marker
  const campusOverlay = L.layerGroup().addTo(map);
  L.circle(config.defaultCenter, {
    radius: config.fcsitFocusRadiusMeters,
    color: '#2563eb',
    weight: 1.5,
    dashArray: '6 6',
    fillColor: '#2563eb',
    fillOpacity: 0.05,
    interactive: false,
  }).addTo(campusOverlay);

  L.circleMarker(config.defaultCenter, {
    radius: 6,
    color: '#ffffff',
    weight: 2,
    fillColor: '#0f172a',
    fillOpacity: 0.9,
  })
    .bindTooltip(
      `${config.campusLabel} (${config.defaultCenter[0].toFixed(4)}, ${config.defaultCenter[1].toFixed(4)})`,
      { direction: 'top', offset: [0, -6] },
    )
    .addTo(campusOverlay);

  // Dedicated layer group handed off to T17 Custom Category Pins
  const facilityLayer = L.layerGroup().addTo(map);
  const userLocationLayer = L.layerGroup().addTo(map);

  function getViewport() {
    const center = map.getCenter();
    return {
      lat: center.lat,
      lng: center.lng,
      zoom: map.getZoom(),
    };
  }

  function emitViewport() {
    if (typeof callbacks.onViewportChange === 'function') {
      callbacks.onViewportChange(getViewport());
    }
  }

  map.on('moveend zoomend', emitViewport);
  emitViewport();

  function centerOnFcsit() {
    map.setView(config.defaultCenter, config.defaultZoom, { animate: true });
    if (typeof callbacks.onStatusMessage === 'function') {
      callbacks.onStatusMessage(
        `Centered on FCSIT UM (${config.defaultCenter[0].toFixed(4)}, ${config.defaultCenter[1].toFixed(4)})`,
      );
    }
  }

  function locateUser() {
    if (!navigator.geolocation) {
      if (typeof callbacks.onStatusMessage === 'function') {
        callbacks.onStatusMessage('Geolocation is not supported by this browser.');
      }
      return;
    }

    if (typeof callbacks.onStatusMessage === 'function') {
      callbacks.onStatusMessage('Locating your position...');
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        userLocationLayer.clearLayers();
        L.circle(coords, {
          radius: Math.min(pos.coords.accuracy || 25, 80),
          color: '#2563eb',
          weight: 1,
          fillColor: '#2563eb',
          fillOpacity: 0.14,
          interactive: false,
        }).addTo(userLocationLayer);
        L.circleMarker(coords, {
          radius: 7,
          color: '#ffffff',
          weight: 2.5,
          fillColor: '#2563eb',
          fillOpacity: 1,
        })
          .bindTooltip('Your current location', { direction: 'top' })
          .addTo(userLocationLayer);

        map.setView(coords, Math.max(map.getZoom(), config.defaultZoom), { animate: true });
        if (typeof callbacks.onStatusMessage === 'function') {
          callbacks.onStatusMessage(
            `Location updated (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`,
          );
        }
      },
      () => {
        if (typeof callbacks.onStatusMessage === 'function') {
          callbacks.onStatusMessage('Location unavailable — staying centered on FCSIT UM.');
        }
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 },
    );
  }

  function invalidateSize() {
    map.invalidateSize();
  }

  return {
    map,
    facilityLayer,
    campusOverlay,
    centerOnFcsit,
    locateUser,
    invalidateSize,
    getViewport,
  };
}
