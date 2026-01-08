const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * Database Configuration
 * Handles MongoDB connection and event management
 */

class Database {
  constructor() {
    this.connection = null;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_db';
      
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      this.connection = await mongoose.connect(uri, options);

      logger.info(`✅ MongoDB Connected: ${this.connection.connection.host}`);

      // Connection event handlers
      mongoose.connection.on('error', (err) => {
        logger.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️ MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('✅ MongoDB reconnected');
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      return this.connection;
    } catch (error) {
      logger.error('❌ MongoDB connection failed:', error);
      process.exit(1);
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
    } catch (error) {
      logger.error('Error closing MongoDB connection:', error);
    }
  }

  /**
   * Get connection status
   */
  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Get database statistics
   */
  async getStats() {
    if (!this.isConnected()) {
      return { connected: false };
    }

    try {
      const stats = await mongoose.connection.db.stats();
      return {
        connected: true,
        database: mongoose.connection.name,
        collections: stats.collections,
        dataSize: stats.dataSize,
        indexSize: stats.indexSize,
      };
    } catch (error) {
      logger.error('Error getting database stats:', error);
      return { connected: true, error: error.message };
    }
  }
}

module.exports = new Database();
