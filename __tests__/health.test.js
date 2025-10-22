const request = require('supertest');
const express = require('express');

// Create a simple test without complex mocking
const healthRoutes = require('../src/routes/health-routes');

const app = express();
app.use('/api', healthRoutes);

describe('Health Check API - Simple Tests', () => {
  describe('GET /api/ping', () => {
    it('should return simple health check', async () => {
      const response = await request(app)
        .get('/api/ping')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message', 'IV Tool Backend Service is alive');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/health/simple', () => {
    it('should return simple health check', async () => {
      const response = await request(app)
        .get('/api/health/simple')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message', 'IV Tool Backend Service is alive');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/health', () => {
    it('should return health status (basic test)', async () => {
      const response = await request(app)
        .get('/api/health');

      // Should return either 200 or 503 depending on DB connection
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('services');
    });
  });
});
