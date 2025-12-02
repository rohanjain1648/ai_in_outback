import dotenv from 'dotenv';
import Joi from 'joi';

// Load environment variables
dotenv.config();

// Define configuration schema
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  
  // Database
  MONGODB_URI: Joi.string().required().description('MongoDB connection string'),
  MONGODB_TEST_URI: Joi.string().when('NODE_ENV', {
    is: 'test',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  
  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),
  
  // JWT
  JWT_SECRET: Joi.string().required().description('JWT secret key'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().required().description('JWT refresh secret key'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  
  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
  
  // Security
  BCRYPT_SALT_ROUNDS: Joi.number().default(12),
  
  // External APIs
  OPENAI_API_KEY: Joi.string().allow('').default(''),
  WEATHER_API_KEY: Joi.string().allow('').default(''),
  ELASTICSEARCH_URL: Joi.string().default('http://localhost:9200'),
}).unknown();

// Validate environment variables
const { error, value: envVars } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  
  // Database configuration
  database: {
    uri: envVars.NODE_ENV === 'test' ? envVars.MONGODB_TEST_URI : envVars.MONGODB_URI,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
  
  // Redis configuration
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD || undefined,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
  },
  
  // JWT configuration
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
  },
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    max: envVars.RATE_LIMIT_MAX_REQUESTS,
  },
  
  // CORS configuration
  cors: {
    origin: envVars.CORS_ORIGIN,
    credentials: true,
  },
  
  // Security configuration
  security: {
    bcryptSaltRounds: envVars.BCRYPT_SALT_ROUNDS,
  },
  
  // External APIs configuration
  externalApis: {
    openai: {
      apiKey: envVars.OPENAI_API_KEY,
    },
    weather: {
      apiKey: envVars.WEATHER_API_KEY,
    },
    elasticsearch: {
      url: envVars.ELASTICSEARCH_URL,
    },
  },
};