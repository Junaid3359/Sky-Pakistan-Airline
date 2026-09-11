import mongoose from 'mongoose';
import pino from 'pino';

const logger = pino();

let _memoryServer: any = null;

export async function connectDB(uri?: string) {
  try {
    if (!uri) throw new Error('No MONGO_URI');
    await mongoose.connect(uri);
    logger.info('MongoDB connected');
    return;
  } catch (err) {
    logger.error('MongoDB connection error', err);
    // fallback to in-memory MongoDB for local development
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
      logger.error('Failed to start in-memory MongoDB', memErr);
      throw memErr;
    }
  }
}

export async function stopMemoryServer() {
  if (_memoryServer) {
    await mongoose.disconnect();
    await _memoryServer.stop();
  }
}
