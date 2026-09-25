import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/index.js';
import { storage } from './database/storage.js';
import { apiRouter } from './routes/api.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, '../../client/dist');

// Mount API routes
app.use('/api', apiRouter);

// Serve client static build if exists
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Root fallback info
  app.get('/', (req, res) => {
    res.json({
      app: 'NepaReady API Server',
      tagline: 'Your Nepal. Always Ready.',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        emergency: '/api/emergency',
        locations: '/api/locations',
        guides: '/api/guides',
        offlinePacks: '/api/offline-packs'
      }
    });
  });
}

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Initialize database and start listening
async function bootstrap() {
  try {
    await storage.init();
    app.listen(config.port, () => {
      console.log(`🇳🇵 NepaReady API server listening at http://localhost:${config.port}`);
      console.log(`📡 Healthcheck available at http://localhost:${config.port}/api/health`);
    });
  } catch (err) {
    console.error('Failed to start NepaReady server:', err);
    process.exit(1);
  }
}

bootstrap();
