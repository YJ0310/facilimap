import express from 'express';
import cors from 'cors';

export function createApp(config) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({
    origin(origin, callback) {
      callback(null, origin === config.corsOrigin);
    },
  }));
  app.use(express.json({ limit: '100kb' }));

  // Liveness only: database and authentication are separate future tasks.
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
  app.use((error, _req, res, _next) => {
    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
    if (error.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Request body too large' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  });
  return app;
}
