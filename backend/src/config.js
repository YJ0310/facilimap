import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

export const backendDirectory = fileURLToPath(new URL('../', import.meta.url));

export function loadConfig(env = process.env) {
  const portText = env.PORT ?? '3000';
  const port = Number(portText);
  if (!/^\d+$/.test(portText) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer from 1 to 65535.');
  }

  const corsOrigin = env.CORS_ORIGIN ?? 'http://localhost:5173';
  let originUrl;
  try {
    originUrl = new URL(corsOrigin);
  } catch {
    throw new Error('CORS_ORIGIN must be an HTTP(S) origin, such as http://localhost:5173.');
  }
  if (!['http:', 'https:'].includes(originUrl.protocol) || originUrl.origin !== corsOrigin) {
    throw new Error('CORS_ORIGIN must contain only scheme, host and optional port (no trailing slash).');
  }

  const databasePath = env.DB_PATH ?? '../database/facilimap.db';
  if (!databasePath.trim()) throw new Error('DB_PATH must not be empty.');

  return Object.freeze({
    port,
    corsOrigin,
    databasePath: path.resolve(backendDirectory, databasePath),
    // Reserved for later authentication work. Never log or return this value.
    adminSecret: env.ADMIN_SECRET ?? '',
  });
}

export function loadEnvironment() {
  // Existing environment variables take precedence over the local file.
  dotenv.config({ path: path.join(backendDirectory, '.env'), quiet: true });
  return loadConfig();
}
