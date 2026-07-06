import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './routes/api.routes';
import { requestLogger } from './middleware/logging.middleware';

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());

// Request logger middleware
app.use(requestLogger);

// Mount API routes under /api
app.use('/api', apiRoutes);

// General health check route for verification
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend assets in production mode
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));

  // Catch-all route to serve the index.html for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

export default app;

