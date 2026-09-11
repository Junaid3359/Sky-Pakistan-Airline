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
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/flights', flightsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/manage', manageRoutes);
app.use('/api/checkin', checkinRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sky_pakistan';
    await connectDB(mongoUri);
    logger.info('Connected to MongoDB');
    await ensureDemoData();
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }
}

start();
