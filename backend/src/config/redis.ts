import { createClient, RedisClientType } from 'redis';
import { config } from './index';

class RedisClient {
  private static instance: RedisClient;
  private client: RedisClientType | null = null;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      console.log('Redis already connected');
      return;
    }

    try {
      this.client = createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port,
        },
        password: config.redis.password,
      });

      // Handle Redis events
      this.client.on('error', (error) => {
        console.error('Redis connection error:', error);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis client connected');
      });

      this.client.on('ready', () => {
        console.log('Redis client ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        console.log('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      console.log(`Redis connected successfully to: ${config.redis.host}:${config.redis.port}`);

      // Handle process termination
      process.on('SIGINT', async () => {
        await this.disconnect();
      });

    } catch (error) {
      console.error('Redis connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
      console.log('Redis disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting from Redis:', error);
      throw error;
    }
  }

  public getClient(): RedisClientType {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client is not connected');
    }
    return this.client;
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && this.client !== null;
  }

  // Utility methods for common Redis operations
  public async set(key: string, value: string, expireInSeconds?: number): Promise<void> {
    const client = this.getClient();
    if (expireInSeconds) {
      await client.setEx(key, expireInSeconds, value);
    } else {
      await client.set(key, value);
    }
  }

  public async get(key: string): Promise<string | null> {
    const client = this.getClient();
    return await client.get(key);
  }

  public async del(key: string): Promise<number> {
    const client = this.getClient();
    return await client.del(key);
  }

  public async exists(key: string): Promise<number> {
    const client = this.getClient();
    return await client.exists(key);
  }

  public async flushAll(): Promise<void> {
    if (config.env !== 'test') {
      throw new Error('Redis can only be flushed in test environment');
    }
    const client = this.getClient();
    await client.flushAll();
    console.log('Redis cache cleared');
  }
}

export const redisClient = RedisClient.getInstance();