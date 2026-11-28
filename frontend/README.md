# FaciliMap Frontend (`/frontend`)

Static HTML/CSS/ES-module frontend base for **T10 — Frontend & Leaflet Base**, aligned with the T09 wireframes and T07/T08 specifications.

## Structure
- `index.html` — Semantic app shell (navbar, search bar, T07 category chips, Leaflet map stage, mobile bottom sheet & tab bar, modal shell).
- `css/styles.css` — Responsive stylesheet supporting desktop split layout (`1440px`) and mobile collapsible bottom sheet (`375px`, zero horizontal overflow).
- `js/config.js` — Shared `FACILIMAP_CONFIG` (`apiBaseUrl`, FCSIT default coordinates, OpenStreetMap tile URL, and T07 categories).
- `js/app.js` — Leaflet 1.9.4 + OSM tile initialization, view switching, filter/search shell state, and `window.FaciliMapApp` hook for downstream `T16`–`T44` tasks.

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
