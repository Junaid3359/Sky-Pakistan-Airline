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

/* =========================================================
   SECURITY
========================================================= */

app.use(helmet());

/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://sky-pakistan-airline.vercel.app',
  'https://sky-pakistan-airline-frontend.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman, server-to-server requests, etc.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn(
        { origin, allowedOrigins },
        'CORS origin not allowed'
      );

      return callback(null, true); // Temporary fix for development
    },
    credentials: true,
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  })
);

/* =========================================================
   JSON BODY
========================================================= */

app.use(express.json());

/* =========================================================
   RATE LIMITING
========================================================= */

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
});

app.use(limiter);

/* =========================================================
   API ROUTES
========================================================= */

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/flights', flightsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/manage', manageRoutes);
app.use('/api/checkin', checkinRoutes);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    time: new Date(),
  });
});

/* =========================================================
   DATABASE INITIALIZATION
========================================================= */

let dbConnected = false;

let dbInitializationPromise: Promise<void> | null = null;

async function initializeDatabase(): Promise<void> {
  if (dbConnected) {
    return;
  }

  if (dbInitializationPromise) {
    return dbInitializationPromise;
  }

  dbInitializationPromise = (async () => {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        'MONGODB_URI is missing from environment variables'
      );
    }

    logger.info(
      'Connecting to MongoDB Atlas...'
    );

    await connectDB(mongoUri);

    logger.info(
      'MongoDB connected successfully'
    );

    // Initialize demo data only after successful
    // MongoDB connection.
    await ensureDemoData();

    dbConnected = true;

    logger.info(
      'Database initialization completed'
    );
  })();

  try {
    await dbInitializationPromise;
  } catch (error) {
    dbInitializationPromise = null;
    throw error;
  }
}

/* =========================================================
   VERCEL SERVERLESS HANDLER
========================================================= */

export default async function handler(
  req: express.Request,
  res: express.Response
) {
  try {
    /*
     * IMPORTANT:
     * Browser sends OPTIONS before the actual API request.
     *
     * Handle CORS preflight BEFORE MongoDB initialization.
     * This prevents:
     *
     * OPTIONS /api/flights/search -> 500
     *
     * when MongoDB is slow/unavailable.
     */
    if (req.method === 'OPTIONS') {
      return app(req, res);
    }

    /*
     * Initialize MongoDB for actual API requests.
     */
    await initializeDatabase();

    /*
     * Pass the request to Express.
     */
    return app(req, res);
  } catch (err) {
    logger.error(
      { err },
      'Failed to initialize server'
    );

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Server initialization failed',
      });
    }

    return;
  }
}

/* =========================================================
   LOCAL DEVELOPMENT
========================================================= */

if (process.env.VERCEL !== '1') {
  const PORT = Number(process.env.PORT) || 4000;

  initializeDatabase()
    .then(() => {
      app.listen(PORT, () => {
        logger.info(
          `Server running on port ${PORT}`
        );
      });
    })
    .catch((err) => {
      logger.error(
        { err },
        'Failed to start server'
      );

      process.exit(1);
    });
}

/* =========================================================
   EXPORT EXPRESS APP
========================================================= */

export { app };``