const winston = require('winston');
const path = require('path');

/**
 * Logger Configuration
 * Configurable logging based on environment variables
 * 
 * Environment Variables:
 * - LOG_ENABLED: Enable/disable logging (default: true)
 * - LOG_TYPE: CONSOLE or LOG_FILE (default: CONSOLE)
 * - LOG_LEVEL: VERBOSE, INFO, WARNING, ERROR (default: VERBOSE)
 */

// Map custom log levels to Winston levels
const LOG_LEVEL_MAP = {
  VERBOSE: 'debug',
  INFO: 'info',
  WARNING: 'warn',
  ERROR: 'error',
};

// Get configuration from environment
const logEnabled = process.env.LOG_ENABLED === 'true';
const logType = process.env.LOG_TYPE || 'CONSOLE';
const logLevel = LOG_LEVEL_MAP[process.env.LOG_LEVEL] || 'debug';

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    return log;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Define transports based on LOG_TYPE
const transports = [];

if (logEnabled) {
  if (logType === 'CONSOLE') {
    transports.push(
      new winston.transports.Console({
        format: consoleFormat,
      })
    );
  } else if (logType === 'LOG_FILE') {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        format: fileFormat,
      }),
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        format: fileFormat,
      })
    );
  }
}

// Create logger instance
const logger = winston.createLogger({
  level: logLevel,
  silent: !logEnabled,
  transports,
  exitOnError: false,
});

// Add custom log level methods to match our naming convention
logger.verbose = logger.debug;

// Log the logger configuration on startup
if (logEnabled) {
  logger.info('Logger initialized', {
    enabled: logEnabled,
    type: logType,
    level: process.env.LOG_LEVEL || 'VERBOSE',
  });
}

module.exports = logger;
