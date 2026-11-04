import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { apiV1Router } from './server/api/v1/router.ts';
import { initializeDatabase, flushDatabasePersistence, hasPendingDatabasePersistence } from './server/db/database.ts';

dotenv.config();

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  const PORT = Number(process.env.PORT) || 3000;

  await initializeDatabase();

  // Hold successful API responses until their database snapshot is durable.
  app.use((req, res, next) => {
    const originalSend = res.send.bind(res);
    let waitingForCommit = false;
    res.send = ((body?: any) => {
      if (!hasPendingDatabasePersistence()) return originalSend(body);
      if (waitingForCommit) return res;
      waitingForCommit = true;
      void flushDatabasePersistence()
        .then(() => originalSend(body))
        .catch((error) => {
          console.error('[RoofDoctors] Refusing success response because persistence failed:', error);
          if (res.headersSent) return res.destroy(error as Error);
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.end(JSON.stringify({ error: 'Data could not be saved. Please retry.' }));
        });
      return res;
    }) as typeof res.send;
    next();
  });

  // Mount API routes FIRST
  app.use('/api/v1', apiV1Router);

  // Fallback endpoint for generic health
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'The Roof Doctors Platform' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RoofDoctors] Server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error('[RoofDoctors] Server error:', err);
    if (err.code === 'EADDRINUSE') {
      console.error(`[RoofDoctors] Port ${PORT} is in use. Exiting cleanly to allow supervisor restart.`);
      process.exit(1);
    }
  });

  const shutdown = () => {
    server.close(() => {
      void flushDatabasePersistence().catch((error) => console.error('[RoofDoctors] Final database flush failed:', error)).finally(() => process.exit(0));
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('[RoofDoctors] Failed to start server:', err);
  process.exit(1);
});
