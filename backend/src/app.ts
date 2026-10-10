import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import reportsRoutes from './routes/reports.routes';
import timelineRoutes from './routes/timeline.routes';
import profileRoutes from './routes/profile.routes';
import notificationsRoutes from './routes/notifications.routes';
import medicationsRoutes from './routes/medications.routes';
import dietRoutes from './routes/diet.routes';
import emergencyRoutes from './routes/emergency.routes';
import appointmentsRoutes from './routes/appointments.routes';
import firstaidRoutes from './routes/firstaid.routes';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config';
import { getDatabaseStatus, isDatabaseConnected, connectDatabase } from './config/database';

const app: Application = express();

// Security and utility middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = [
  config.clientUrl.replace(/\/+$/, ''),
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:4173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.netlify.app') ||
        origin.endsWith('.onrender.com');

      if (isAllowed || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', async (req: Request, res: Response) => {
  if (!isDatabaseConnected()) {
    await connectDatabase();
  }
  res.status(200).json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    aiProvider: config.aiProvider,
    database: getDatabaseStatus(),
  });
});

// Mount Core & Feature Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/profile', profileRoutes);

// New Feature Routes
app.use('/api/notifications', notificationsRoutes);
app.use('/api/medications', medicationsRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/firstaid', firstaidRoutes);

// Central error handler
app.use(errorHandler);

export default app;
