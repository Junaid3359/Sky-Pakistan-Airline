import mongoose from 'mongoose';
import pino from 'pino';

const logger = pino();

let _memoryServer: any = null;

export async function connectDB(uri?: string) {
  try {
    if (!uri) {
      throw new Error('No MONGODB_URI provided');
    }

    await mongoose.connect(uri);

    logger.info('MongoDB Atlas connected successfully');

    return;
  } catch (err) {
    // Show the real MongoDB error
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

    // Fallback to in-memory MongoDB for local development
    if (process.env.NODE_ENV === 'production') {
      throw err;
    }

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