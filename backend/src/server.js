import { createApp } from './app.js';
import { loadEnvironment } from './config.js';

try {
  const config = loadEnvironment();
  const server = createApp(config).listen(config.port, () => {
    console.log(`FaciliMap API listening on port ${config.port}`);
    console.log(`Health check: http://localhost:${config.port}/api/health`);
  });

  server.on('error', (error) => {
    console.error(`Unable to start API (${error.code ?? 'unknown error'}). Check PORT and try again.`);
    process.exitCode = 1;
  });

  function shutdown() {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  }
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
} catch (error) {
  console.error(`Configuration error: ${error.message}`);
  process.exitCode = 1;
}
