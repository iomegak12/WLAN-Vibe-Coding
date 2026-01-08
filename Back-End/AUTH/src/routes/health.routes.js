const express = require('express');
const router = express.Router();
const database = require('../config/database');
const emailConfig = require('../config/email');
const ResponseUtil = require('../utils/response.util');

/**
 * Health Check Routes
 * Provides simple and detailed health status endpoints
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Simple health check
 *     description: Returns basic health status of the service
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: OK
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 */
router.get('/health', (req, res) => {
  ResponseUtil.success(res, 200, { status: 'OK' }, 'Service is healthy');
});

/**
 * @swagger
 * /health-in-detail:
 *   get:
 *     summary: Detailed health check
 *     description: Returns comprehensive health metrics including database stats, memory usage, and uptime
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Detailed health information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: OK
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     uptime:
 *                       type: string
 *                       example: 2h 15m 30s
 *                     database:
 *                       type: object
 *                       properties:
 *                         connected:
 *                           type: boolean
 *                         stats:
 *                           type: object
 *                     email:
 *                       type: object
 *                       properties:
 *                         enabled:
 *                           type: boolean
 *                     memory:
 *                       type: object
 *                     nodeVersion:
 *                       type: string
 */
router.get('/health-in-detail', async (req, res) => {
  try {
    // Get database status
    const dbConnected = database.isConnected();
    const dbStats = dbConnected ? await database.getStats() : null;

    // Get email service status
    const emailEnabled = emailConfig.isEnabled();

    // Get system uptime
    const uptime = process.uptime();
    const uptimeFormatted = formatUptime(uptime);

    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = {
      rss: (memoryUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
      heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
      heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
      external: (memoryUsage.external / 1024 / 1024).toFixed(2) + ' MB',
    };

    // Build health response
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: uptimeFormatted,
      uptimeSeconds: uptime,
      environment: process.env.NODE_ENV || 'development',
      version: '0.1.0',
      nodeVersion: process.version,
      platform: process.platform,
      services: {
        api: {
          status: 'healthy',
          port: process.env.PORT || 5001,
        },
        database: {
          status: dbConnected ? 'connected' : 'disconnected',
          type: 'MongoDB',
          ...(dbStats && {
            database: dbStats.database,
            collections: dbStats.collections,
          }),
        },
        email: {
          status: emailEnabled ? 'enabled' : 'disabled',
          service: emailEnabled ? process.env.EMAIL_SERVICE : 'N/A',
        },
      },
      system: {
        memory: memoryUsageMB,
        pid: process.pid,
      },
    };

    ResponseUtil.success(res, 200, healthData, 'Detailed health check completed');
  } catch (error) {
    ResponseUtil.serverError(res, 'Failed to retrieve health details');
  }
});

/**
 * Helper function to format uptime in human-readable format
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);

  return parts.join(' ') || '0s';
}

module.exports = router;
