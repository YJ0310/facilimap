-- T05: five tables. T06: foreign keys and value constraints.
-- Run against a NEW database, outside any existing transaction.
PRAGMA foreign_keys = ON;
BEGIN;

CREATE TABLE "USER" (
    user_id TEXT PRIMARY KEY NOT NULL CHECK (length(trim(user_id)) > 0),
    role TEXT NOT NULL CHECK (role IN ('user', 'admin'))
);

CREATE TABLE CATEGORY (
    category_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE CHECK (length(trim(name)) > 0),
    icon_key TEXT NOT NULL UNIQUE CHECK (length(trim(icon_key)) > 0)
);

CREATE TABLE FACILITY (
    facility_id INTEGER PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES CATEGORY(category_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    building TEXT,
    floor TEXT,
    latitude REAL NOT NULL CHECK (typeof(latitude) IN ('real', 'integer') AND latitude BETWEEN -90 AND 90),
    longitude REAL NOT NULL CHECK (typeof(longitude) IN ('real', 'integer') AND longitude BETWEEN -180 AND 180),
    opening_hours TEXT,
    status TEXT NOT NULL CHECK (length(trim(status)) > 0),
    last_verified_at TEXT
);

CREATE TABLE ISSUE_REPORT (
    report_id INTEGER PRIMARY KEY,
    reporter_user_id TEXT NOT NULL REFERENCES "USER"(user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    facility_id INTEGER REFERENCES FACILITY(facility_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    description TEXT NOT NULL CHECK (length(trim(description)) > 0),
    latitude REAL NOT NULL CHECK (typeof(latitude) IN ('real', 'integer') AND latitude BETWEEN -90 AND 90),
    longitude REAL NOT NULL CHECK (typeof(longitude) IN ('real', 'integer') AND longitude BETWEEN -180 AND 180),
    photo_ref TEXT,
    status TEXT NOT NULL CHECK (length(trim(status)) > 0),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE ADMIN_REVIEW_LOG (
    review_id INTEGER PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES ISSUE_REPORT(report_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    admin_user_id TEXT NOT NULL REFERENCES "USER"(user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    previous_status TEXT NOT NULL CHECK (length(trim(previous_status)) > 0),
    new_status TEXT NOT NULL CHECK (length(trim(new_status)) > 0),
    reviewed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

COMMIT;
