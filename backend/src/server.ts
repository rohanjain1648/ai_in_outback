import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config';
import { database } from './config/database';
import { redisClient } from './config/redis';
import { elasticsearchService } from './services/elasticsearchService';
import EmergencyService from './services/emergencyService';
import SocketService from './services/socketService';
import {
  corsMiddleware,
  rateLimitMiddleware,
  helmetMiddleware,
  compressionMiddleware,
  loggingMiddleware,
  sanitizeInput,
  securityErrorHandler,
  requestSizeLimit,
} from './middleware/security';
import routes from './routes';

class Server {
  private app: express.Application;
  private httpServer: any;
  private io: SocketIOServer;
  private port: number;
  private emergencyService: EmergencyService;
  private socketService: SocketService;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: config.env === 'production' ? false : ['http://localhost:3000', 'http://localhost:5173'],
        methods: ['GET', 'POST']
      }
    });
    this.port = config.port;
    this.emergencyService = new EmergencyService(this.io);
    this.socketService = new SocketService(this.io);
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeSocketIO();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmetMiddleware);
    this.app.use(corsMiddleware);
    this.app.use(rateLimitMiddleware);
    this.app.use(compressionMiddleware);
    
    // Request parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(requestSizeLimit('10mb'));
    
    // Logging and sanitization
    this.app.use(loggingMiddleware);
    this.app.use(sanitizeInput);
  }

  private initializeRoutes(): void {
    // Make services available to routes
    this.app.locals.emergencyService = this.emergencyService;
    this.app.locals.socketService = this.socketService;
    this.app.use('/', routes);
  }

  private initializeSocketIO(): void {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Join user to their personal room for targeted notifications
      socket.on('join_user_room', (userId: string) => {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined personal room`);
      });

      // Join location-based rooms for regional alerts
      socket.on('join_location_room', (location: { lat: number; lng: number; radius: number }) => {
        const roomName = `location:${Math.round(location.lat * 100)}_${Math.round(location.lng * 100)}`;
        socket.join(roomName);
        console.log(`User joined location room: ${roomName}`);
      });

      // Handle emergency alert acknowledgments
      socket.on('emergency:acknowledge', async (data: { alertId: string; userId: string }) => {
        try {
          await this.emergencyService.respondToAlert(data.alertId, data.userId, {
            responseType: 'acknowledged'
          });
        } catch (error) {
          socket.emit('error', { message: 'Failed to acknowledge alert' });
        }
      });

      // Handle safety status updates
      socket.on('emergency:safety_status', async (data: { 
        alertId: string; 
        userId: string; 
        status: 'safe' | 'need_help';
        message?: string;
        location?: [number, number];
      }) => {
        try {
          await this.emergencyService.respondToAlert(data.alertId, data.userId, {
            responseType: data.status,
            message: data.message,
            location: data.location
          });
        } catch (error) {
          socket.emit('error', { message: 'Failed to update safety status' });
        }
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });

    // Periodic check for official alerts
    setInterval(async () => {
      try {
        await this.emergencyService.integrateOfficialAlerts();
      } catch (error) {
        console.error('Error checking official alerts:', error);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  private initializeErrorHandling(): void {
    // Security error handler
    this.app.use(securityErrorHandler);
    
    // Global error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', error);
      
      res.status(500).json({
        success: false,
        message: config.env === 'production' ? 'Internal server error' : error.message,
        ...(config.env !== 'production' && { stack: error.stack }),
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Connect to databases
      console.log('Connecting to databases...');
      await database.connect();
      await redisClient.connect();
      
      // Initialize Elasticsearch (optional - will continue without it if unavailable)
      console.log('Initializing Elasticsearch...');
      try {
        await elasticsearchService.initialize();
        console.log('✅ Elasticsearch initialized successfully');
      } catch (error) {
        console.warn('⚠️  Elasticsearch not available, search will use MongoDB fallback:', error instanceof Error ? error.message : 'Unknown error');
      }
      
      // Start the server
      this.httpServer.listen(this.port, () => {
        console.log(`🚀 Rural Connect AI API server running on port ${this.port}`);
        console.log(`📊 Environment: ${config.env}`);
        console.log(`🔗 API Base URL: http://localhost:${this.port}/api/v1`);
        console.log(`❤️  Health Check: http://localhost:${this.port}/health`);
        console.log(`🔌 Socket.IO enabled for real-time emergency alerts`);
      });
      
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      console.log('Shutting down server...');
      await database.disconnect();
      await redisClient.disconnect();
      console.log('Server shut down successfully');
    } catch (error) {
      console.error('Error during server shutdown:', error);
      throw error;
    }
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Create and start server
const server = new Server();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await server.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await server.stop();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  server.start();
}

export default server;