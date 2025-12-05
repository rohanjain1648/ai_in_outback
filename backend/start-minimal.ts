/**
 * Minimal Backend Startup Script
 * This starts the backend with only essential routes to identify issues
 */

import express from 'express';
import { createServer } from 'http';
import { config } from './src/config';
import { database } from './src/config/database';
import {
    corsMiddleware,
    helmetMiddleware,
    compressionMiddleware,
} from './src/middleware/security';

const app = express();
const httpServer = createServer(app);
const port = config.port;

// Basic middleware
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(compressionMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Backend is running',
        timestamp: new Date().toISOString(),
        database: database.getConnectionStatus() ? 'connected' : 'disconnected'
    });
});

// API info
app.get('/api/v1', (req, res) => {
    res.json({
        success: true,
        message: 'Rural Connect AI API v1 - Minimal Mode',
        version: '1.0.0',
        status: 'running'
    });
});

// Start server
async function start() {
    try {
        console.log('🚀 Starting minimal backend...');

        // Connect to database
        console.log('📊 Connecting to MongoDB...');
        await database.connect();
        console.log('✅ MongoDB connected');

        // Start HTTP server
        httpServer.listen(port, () => {
            console.log(`✅ Server running on port ${port}`);
            console.log(`🔗 Health check: http://localhost:${port}/health`);
            console.log(`🔗 API info: http://localhost:${port}/api/v1`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down...');
    await database.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down...');
    await database.disconnect();
    process.exit(0);
});

start();
