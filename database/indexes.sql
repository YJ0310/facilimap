-- T06: indexes for foreign-key lookups and anticipated list screens.
-- The leading columns of composite indexes also cover their foreign keys.
BEGIN;
CREATE INDEX IF NOT EXISTS idx_facility_category ON FACILITY(category_id);
CREATE INDEX IF NOT EXISTS idx_report_reporter_created ON ISSUE_REPORT(reporter_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_report_facility ON ISSUE_REPORT(facility_id);
CREATE INDEX IF NOT EXISTS idx_report_status_created ON ISSUE_REPORT(status, created_at);
CREATE INDEX IF NOT EXISTS idx_review_report_time ON ADMIN_REVIEW_LOG(report_id, reviewed_at);
CREATE INDEX IF NOT EXISTS idx_review_admin ON ADMIN_REVIEW_LOG(admin_user_id);
COMMIT;
