import { Router, Request, Response } from 'express';
import { database } from '../config/database';
import { redisClient } from '../config/redis';

const router = Router();

// Basic health check
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Rural Connect AI API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Detailed health check with database and Redis status
router.get('/detailed', async (req: Request, res: Response) => {
  const healthStatus = {
    success: true,
    message: 'Health check completed',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      api: 'healthy',
      database: 'unknown',
      redis: 'unknown',
    },
    system: {
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
    },
  };

  // Check database connection
  try {
    const dbStatus = database.getConnectionStatus();
    healthStatus.services.database = dbStatus ? 'healthy' : 'unhealthy';
  } catch (error) {
    healthStatus.services.database = 'error';
    healthStatus.success = false;
  }

  // Check Redis connection
  try {
    const redisStatus = redisClient.getConnectionStatus();
    healthStatus.services.redis = redisStatus ? 'healthy' : 'unhealthy';
  } catch (error) {
    healthStatus.services.redis = 'error';
    healthStatus.success = false;
  }

  // Return appropriate status code
  const statusCode = healthStatus.success ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// Readiness probe (for Kubernetes/Docker)
router.get('/ready', async (req: Request, res: Response) => {
  try {
    const dbReady = database.getConnectionStatus();
    const redisReady = redisClient.getConnectionStatus();

    if (dbReady && redisReady) {
      res.status(200).json({
        success: true,
        message: 'Service is ready',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Service is not ready',
        timestamp: new Date().toISOString(),
        issues: {
          database: !dbReady ? 'not connected' : 'connected',
          redis: !redisReady ? 'not connected' : 'connected',
        },
      });
    }
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service is not ready',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// Liveness probe (for Kubernetes/Docker)
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Service is alive',
    timestamp: new Date().toISOString(),
  });
});

export default router;