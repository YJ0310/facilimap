# FaciliMap Frontend (`/frontend`)

Static HTML/CSS/ES-module frontend for **T10 — Frontend & Leaflet Base** and **T16 — Leaflet Map at FCSIT**, aligned with the T09 wireframes and T07/T08 specifications.

## Structure
- `index.html` — Semantic app shell (navbar, search bar, T07 category chips, Leaflet map stage + toolbar + live coordinate readout, detail modal shell, mobile bottom sheet & tab bar).
- `css/styles.css` — Responsive stylesheet supporting desktop split layout (`1440px`) and mobile collapsible bottom sheet (`375px`, zero horizontal overflow).
- `js/config.js` — Shared `FACILIMAP_CONFIG` (`apiBaseUrl`, FCSIT UM center `[3.1282, 101.6506]`, campus `maxBounds`, OpenStreetMap tile URL & attribution, and T07 categories).
- `js/map.js` — Dedicated Leaflet map module (`createCampusMap`): initializes OSM tiles, metric scale bar, FCSIT focus circle & center marker, `facilityLayer` group for `T17`, `centerOnFcsit()`, and `locateUser()`.
- `js/app.js` — Application bootstrap wiring view switching (`invalidateSize()`), filter/search shell state, coordinate pill & toast notifications, and `window.FaciliMapApp`.

## Run Locally
Serve `/frontend` over HTTP (so ES modules load cleanly):
```bash
cd frontend
npx serve -l 5173
```
Or with Python:
```bash
python -m http.server 5173 --directory frontend
```
Then open `http://localhost:5173`.
