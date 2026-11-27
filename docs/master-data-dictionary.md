# T08 · FaciliMap Master Data Dictionary

## DFD-to-SQLite mapping

| DFD data store | SQLite tables | Data represented |
| --- | --- | --- |
| D1 · Facilities | `FACILITY`, `CATEGORY` | Campus facility records and the shared categories used for map pins and filters. |
| D2 · Issue Reports | `ISSUE_REPORT`, `ADMIN_REVIEW_LOG` | Submitted issues, their current status, and the history of administrator review actions. |
| D3 · Users & Admins | `USER` | User identities and role information used to distinguish regular users from administrators. |

## Table and field definitions

The table names follow the repository README. The field names below are proposed logical names for the T05 schema. Match physical column names, SQL types, and constraints to the schema when it lands.

| Table | Proposed fields | Meaning |
| --- | --- | --- |
| `CATEGORY` | `category_id`, `name`, `icon_key` | Category identifier, display name, and marker lookup key. T07 defines Motorcycle Parking, Water Dispenser, and Toilet. |
| `FACILITY` | `facility_id`, `category_id`, `name`, `building`, `floor`, `latitude`, `longitude`, `opening_hours`, `status`, `last_verified_at` | Facility identifier, category, display name, location and coordinates, hours, operational status, and the most recent verification time. |
| `ISSUE_REPORT` | `report_id`, `reporter_user_id`, `facility_id`, `description`, `latitude`, `longitude`, `photo_ref`, `status`, `created_at` | Report identifier, reporter, linked facility when applicable, issue details, submitted pin location, optional photo reference, current status, and submission time. |
| `ADMIN_REVIEW_LOG` | `review_id`, `report_id`, `admin_user_id`, `previous_status`, `new_status`, `reviewed_at` | One review event, including the report reviewed, the reviewing administrator, the status change, and its timestamp. |
| `USER` | `user_id`, `role` | Stable account identifier and the role used to distinguish regular users from administrators. |

## Relationships

- Each facility belongs to one category. A category can be used by multiple facilities.
- A report belongs to its submitting user and can reference a facility where applicable.
- Each review event references one report and one administrator from `USER`. A report can have multiple review events. `ISSUE_REPORT` holds the current status and `ADMIN_REVIEW_LOG` records the changes.

## Sources

- Spirit Systems, *WIA2006 Task for Week 6*, “Diagram 0 DFD (Data Flow Diagram Level 0)”
- [FaciliMap README](https://github.com/YJ0310/facilimap#3-database-setup-database), database setup
- [T07 facility categories](https://github.com/YJ0310/facilimap/pull/1), category labels and icon keys
