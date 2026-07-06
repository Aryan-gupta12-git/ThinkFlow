import express from 'express';
import cors from 'cors';
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

export default app;
