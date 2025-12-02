# Rural Connect AI - Backend API

Backend API server for the Rural Connect AI platform, built with Node.js, Express, TypeScript, MongoDB, and Redis.

## Features

- **Express.js** with TypeScript for robust API development
- **MongoDB** with Mongoose ODM for data persistence
- **Redis** for caching and session management
- **JWT Authentication** with token blacklisting
- **Comprehensive Security** with Helmet, CORS, rate limiting
- **Input Validation** and sanitization
- **Error Handling** with custom error classes
- **Health Checks** for monitoring and deployment
- **Testing** with Jest and Supertest
- **Environment Configuration** with validation

## Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- Redis 6.0+

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment configuration:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration values.

## Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check with database status
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

### API Documentation
- `GET /api/v1` - API information and available endpoints

### Authentication (Placeholder)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

All other endpoints are placeholders that return 501 (Not Implemented) status.

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Building

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Environment Variables

See `.env.example` for all available configuration options.

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Strict rate limiting for auth endpoints (5 requests per 15 minutes)
- Input sanitization
- Request size limiting
- JWT token blacklisting
- Password hashing with bcrypt

## Architecture

The backend follows a modular architecture:

- `src/config/` - Configuration and database connections
- `src/middleware/` - Express middleware (auth, security)
- `src/routes/` - API route definitions
- `src/utils/` - Utility functions and error classes
- `src/__tests__/` - Test files

## Next Steps

This backend foundation is ready for implementing the specific features:

1. User Management System (Task 3)
2. Community Matching AI System (Task 6)
3. Resource Discovery System (Task 7)
4. Agricultural Intelligence Dashboard (Task 8)
5. Emergency Alert System (Task 9)
6. And more...

Each feature will build upon this foundation with proper data models, business logic, and API endpoints.