const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const schema = readFileSync(join(__dirname, '../schema.sql'), 'utf8');
const indexes = readFileSync(join(__dirname, '../indexes.sql'), 'utf8');

function database(t) {
  const db = new DatabaseSync(':memory:');
  t.after(() => db.close());
  db.exec(schema);
  db.exec(indexes);
  db.exec(`INSERT INTO "USER" VALUES ('student-1', 'user'), ('admin-1', 'admin');
    INSERT INTO CATEGORY VALUES (1, 'Water Dispenser', 'water_dispenser');
    INSERT INTO FACILITY (facility_id, category_id, name, latitude, longitude, status)
      VALUES (1, 1, 'Test dispenser', 3.12, 101.65, 'test-operational');`);
  return db;
}
function report(db, user = 'student-1', facility = 1, lat = 3.12, lon = 101.65, status = 'test-pending') {
  return db.prepare(`INSERT INTO ISSUE_REPORT
    (reporter_user_id, facility_id, description, latitude, longitude, status)
    VALUES (?, ?, 'Test issue', ?, ?, ?)`).run(user, facility, lat, lon, status).lastInsertRowid;
}

test('five tables, six indexes, repeatable index script and valid database', t => {
  const db = database(t);
  assert.equal(db.prepare("SELECT count(*) n FROM sqlite_master WHERE type='table'").get().n, 5);
  db.exec(indexes);
  assert.equal(db.prepare("SELECT count(*) n FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'").get().n, 6);
  assert.equal(db.prepare('PRAGMA foreign_keys').get().foreign_keys, 1);
  assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
  assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
});

test('reports require an existing user; facility link is optional but must be valid', t => {
  const db = database(t);
  assert.throws(() => report(db, null), /NOT NULL/);
  assert.throws(() => report(db, 'missing'), /FOREIGN KEY/);
  assert.throws(() => report(db, 'student-1', 999), /FOREIGN KEY/);
  assert.doesNotThrow(() => report(db, 'student-1', null));
  assert.throws(() => db.exec('UPDATE FACILITY SET category_id=999 WHERE facility_id=1'), /FOREIGN KEY/);
});

test('one report supports zero or multiple review records with valid references', t => {
  const db = database(t);
  const id = report(db);
  assert.equal(db.prepare('SELECT count(*) n FROM ADMIN_REVIEW_LOG WHERE report_id=?').get(id).n, 0);
  const insert = db.prepare(`INSERT INTO ADMIN_REVIEW_LOG
    (report_id, admin_user_id, previous_status, new_status) VALUES (?, ?, ?, ?)`);
  insert.run(id, 'admin-1', 'test-pending', 'test-reviewed');
  insert.run(id, 'admin-1', 'test-reviewed', 'test-resolved');
  assert.equal(db.prepare('SELECT count(*) n FROM ADMIN_REVIEW_LOG WHERE report_id=?').get(id).n, 2);
  assert.throws(() => insert.run(999, 'admin-1', 'a', 'b'), /FOREIGN KEY/);
  assert.throws(() => insert.run(id, 'missing', 'a', 'b'), /FOREIGN KEY/);
});

test('linked parents cannot be deleted or have identifiers changed', t => {
  const db = database(t);
  const id = report(db);
  db.prepare(`INSERT INTO ADMIN_REVIEW_LOG
    (report_id, admin_user_id, previous_status, new_status) VALUES (?, 'admin-1', 'a', 'b')`).run(id);
  for (const sql of [
    'DELETE FROM CATEGORY WHERE category_id=1',
    'DELETE FROM FACILITY WHERE facility_id=1',
    'DELETE FROM "USER" WHERE user_id IN (\'student-1\', \'admin-1\')',
    'DELETE FROM ISSUE_REPORT',
    'UPDATE FACILITY SET facility_id=2 WHERE facility_id=1',
    'UPDATE "USER" SET user_id=\'other\' WHERE user_id=\'student-1\''
  ]) assert.throws(() => db.exec(sql), /FOREIGN KEY/);
});

test('reject invalid coordinates, empty content, duplicate categories and invalid roles', t => {
  const db = database(t);
  for (const [lat, lon] of [[91, 0], [0, -181], ['invalid', 0], [null, 0]]) {
    assert.throws(() => report(db, 'student-1', null, lat, lon));
  }
  assert.doesNotThrow(() => report(db, 'student-1', null, -90, 180));
  assert.throws(() => report(db, 'student-1', null, 0, 0, '   '), /CHECK/);
  const id = report(db);
  assert.throws(() => db.prepare("UPDATE ISSUE_REPORT SET description='' WHERE report_id=?").run(id), /CHECK/);
  assert.throws(() => db.exec("INSERT INTO CATEGORY VALUES (2, 'Other', 'water_dispenser')"), /UNIQUE/);
  assert.throws(() => db.exec("INSERT INTO CATEGORY VALUES (2, 'Water Dispenser', 'other')"), /UNIQUE/);
  assert.throws(() => db.exec(`INSERT INTO "USER" VALUES ('x', 'unknown')`), /CHECK/);
  assert.match(db.prepare('SELECT created_at FROM ISSUE_REPORT WHERE report_id=?').get(id).created_at,
    /^\d{4}-\d{2}-\d{2}T.*Z$/);
});
