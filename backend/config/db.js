const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Check required env var before attempting connection
    if (!process.env.MONGO_URI) {
      logger.error('FATAL: MONGO_URI environment variable is not set!');
      logger.error('Please add MONGO_URI to your Render environment variables.');
      logger.error('Get it from: MongoDB Atlas → Connect → Drivers → copy the connection string');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
    });

  } catch (error) {
    logger.error(`❌ MongoDB connection FAILED: ${error.message}`);
    logger.error('Common causes:');
    logger.error('  1. MONGO_URI env var is wrong or not set in Render');
    logger.error('  2. MongoDB Atlas Network Access does not allow 0.0.0.0/0');
    logger.error('  3. Wrong username/password in connection string');
    process.exit(1);
  }
};

module.exports = connectDB;
