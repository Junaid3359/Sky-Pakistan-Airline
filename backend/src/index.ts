import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pino from 'pino';

import { connectDB } from './config/db';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import flightsRoutes from './routes/flights.routes';
import bookingsRoutes from './routes/bookings.routes';
import paymentsRoutes from './routes/payments.routes';
import ticketsRoutes from './routes/tickets.routes';
import manageRoutes from './routes/manage.routes';
import checkinRoutes from './routes/checkin.routes';

import { ensureDemoData } from './services/demo-data.service';

dotenv.config();

const logger = pino();

const app = express();

// Security
app.use(helmet());

// CORS
const allowedOrigins = [
  'https://sky-pakistan-airline.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// JSON body parser
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
});

app.use(limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/flights', flightsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/manage', manageRoutes);
app.use('/api/checkin', checkinRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date(),
  });
});

const PORT = Number(process.env.PORT) || 4000;

// Start server
export async function start() {
  try {
    // MongoDB URI must come from .env
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        'MONGODB_URI is missing. Please add MONGODB_URI to your .env file.'
      );
    }

    logger.info('Connecting to MongoDB Atlas...');

    await connectDB(mongoUri);

    logger.info('MongoDB connected successfully');

    // Insert demo/initial data
    await ensureDemoData();

    // Start Express server (skipped on Vercel, only runs locally)
    if (process.env.VERCEL !== '1') {
      app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
      });
    }
  } catch (err) {
    logger.error(
      {
        err,
      },
      'Failed to start server'
    );

    process.exit(1);
  }
}

// Start only when running directly
if (require.main === module) {
  start();
}

export { app };