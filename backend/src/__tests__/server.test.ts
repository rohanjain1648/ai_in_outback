import request from 'supertest';
import server from '../server';

describe('Server', () => {
  let app: any;

  beforeAll(async () => {
    app = server.getApp();
  });

  describe('Health Check', () => {
    it('should return 200 for basic health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Rural Connect AI API is running',
      });
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });

    it('should return API information for root API endpoint', async () => {
      const response = await request(app)
        .get('/api/v1')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Rural Connect AI API v1',
        version: '1.0.0',
      });
      expect(response.body.endpoints).toBeDefined();
    });
  });

  describe('API Routes', () => {
    it('should return 404 for undefined API endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'API endpoint not found',
      });
    });

    it('should return 501 for not yet implemented auth endpoints', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(501);

      expect(response.body).toMatchObject({
        success: false,
        message: 'User registration not yet implemented',
      });
    });
  });

  describe('Security Middleware', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check for helmet security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(response.headers['x-xss-protection']).toBe('0');
    });

    it('should handle CORS properly', async () => {
      const response = await request(app)
        .options('/api/v1')
        .set('Origin', 'http://localhost:5173')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });
});