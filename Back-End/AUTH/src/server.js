require('dotenv').config();
const app = require('./app');
const database = require('./config/database');
const logger = require('./config/logger');

/**
 * Server Initialization
 * Starts the Express server and connects to MongoDB
 */

const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start Server
 */
async function startServer() {
  try {
    // Connect to MongoDB
    await database.connect();

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server started successfully`);
      logger.info(`📍 Environment: ${NODE_ENV}`);
      logger.info(`🌐 Server running on port ${PORT}`);
      logger.info(`🔗 API URL: http://localhost:${PORT}`);
      logger.info(`❤️  Health Check: http://localhost:${PORT}/health`);
      logger.info(`📊 Health Details: http://localhost:${PORT}/health-in-detail`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs (coming soon)`);
      logger.info('=====================================');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        await database.disconnect();
        logger.info('MongoDB connection closed');
        
        logger.info('Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      
      // In development, log the error but don't crash the server
      // In production, initiate graceful shutdown
      if (NODE_ENV === 'production') {
        gracefulShutdown('UNHANDLED_REJECTION');
      } else {
        logger.warn('Server continues running in development mode despite unhandled rejection');
      }
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
