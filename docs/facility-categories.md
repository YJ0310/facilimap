# T07 · FaciliMap Facility Categories

FaciliMap Sprint 1 uses three categories for facilities at the Faculty of Computer Science and Information Technology (FCSIT). Use the labels below in the map legend and category filters, and use the matching icon keys to select map markers.

| Category label | Icon key | Definition | Marker symbol |
| --- | --- | --- | --- |
| Motorcycle Parking | `motorcycle_parking` | A designated area for parking motorcycles. Record the location at the entrance to the parking area. | Motorcycle |
| Water Dispenser | `water_dispenser` | A drinking-water dispenser or bottle refill station. Record the location of the unit and its floor if it is indoors. | Water droplet |
| Toilet | `toilet` | A restroom available to the intended campus users. Record the restroom entrance and floor. | Restroom sign |

## Data and map handoff

- **T08 · Master Data Dictionary.** Record the category label and its corresponding icon key. Use the same spelling and lowercase keys across the data dictionary and category seed data.
- **T11 · GPS Survey.** Assign one category to each surveyed facility. Record building and floor details for indoor facilities so entries with similar map coordinates can still be distinguished.
- **T17 · Category Pins.** Map each icon key to the symbol listed above. Use the category label as the marker’s accessible name when a facility name is unavailable.
