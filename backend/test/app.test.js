import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import path from 'node:path';
import { createApp } from '../src/app.js';
import { loadConfig, backendDirectory } from '../src/config.js';

test('API bootstrap: liveness, CORS, 404 and JSON errors', async (t) => {
  const config = loadConfig({ ADMIN_SECRET: 'test-only-secret' });
  const server = createApp(config).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;

  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: 'ok' });
  assert.equal(health.headers.get('x-powered-by'), null);

  const allowed = await fetch(`${base}/api/health`, { headers: { Origin: config.corsOrigin } });
  assert.equal(allowed.headers.get('access-control-allow-origin'), config.corsOrigin);
  const denied = await fetch(`${base}/api/health`, { headers: { Origin: 'https://other.example' } });
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
  const preflight = await fetch(`${base}/api/health`, {
    method: 'OPTIONS', headers: { Origin: config.corsOrigin, 'Access-Control-Request-Method': 'GET' },
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), config.corsOrigin);

  const missing = await fetch(`${base}/api/not-implemented`);
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: 'Not found' });
  const invalid = await fetch(`${base}/api/not-implemented`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken',
  });
  assert.equal(invalid.status, 400);
  assert.deepEqual(await invalid.json(), { error: 'Invalid JSON' });
  const oversized = await fetch(`${base}/api/not-implemented`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify('x'.repeat(110000)),
  });
  assert.equal(oversized.status, 413);
});

test('configuration defaults, overrides and invalid values', () => {
  const defaults = loadConfig({});
  assert.equal(defaults.port, 3000);
  assert.equal(defaults.databasePath, path.resolve(backendDirectory, '../database/facilimap.db'));
  const custom = loadConfig({ PORT: '3100', CORS_ORIGIN: 'http://127.0.0.1:5500', DB_PATH: '../database/test.db' });
  assert.equal(custom.port, 3100);
  assert.equal(custom.corsOrigin, 'http://127.0.0.1:5500');
  for (const PORT of ['', '0', '65536', 'abc', '3000.5', '3e3']) {
    assert.throws(() => loadConfig({ PORT }), /PORT/);
  }
  for (const CORS_ORIGIN of ['*', 'null', 'file:///tmp', 'http://localhost:5173/', 'http://localhost:5173/path']) {
    assert.throws(() => loadConfig({ CORS_ORIGIN }), /CORS_ORIGIN/);
  }
  assert.throws(() => loadConfig({ DB_PATH: '' }), /DB_PATH/);
});
