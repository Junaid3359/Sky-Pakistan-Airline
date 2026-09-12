import mongoose from 'mongoose';
import pino from 'pino';

const logger = pino();

let _memoryServer: any = null;

export async function connectDB(uri?: string) {
  try {
    if (!uri) {
      throw new Error('MONGODB_URI is missing');
    }

    logger.info('Attempting MongoDB connection...');

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    logger.info('MongoDB Atlas connected successfully');

    return;
  } catch (err) {
    if (err instanceof Error) {
      logger.error(
        {
          message: err.message,
          name: err.name,
          stack: err.stack,
        },
        'MongoDB connection error'
      );
    } else {
      logger.error(
        { err },
        'MongoDB connection error'
      );
    }

    // Never start MongoMemoryServer on Vercel/production
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
      throw err;
    }

    // Local development fallback only
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');

      _memoryServer = await MongoMemoryServer.create();

      const memUri = _memoryServer.getUri();

      await mongoose.connect(memUri);

      logger.info('Connected to in-memory MongoDB');

      return;
    } catch (memErr) {
      logger.error(
        { err: memErr },
        'Failed to start in-memory MongoDB'
      );

      throw memErr;
    }
  }
}

export async function stopMemoryServer() {
  if (_memoryServer) {
    await mongoose.disconnect();
    await _memoryServer.stop();
    _memoryServer = null;
  }
}