import request from 'supertest';
import app from './app';

describe('App Endpoints', () => {
  it('GET / - should return 200 and a welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Welcome to K10 Football Academy Platform API');
  });

  it('GET /health - should return 200 and health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('K10 Football Academy Platform API is healthy');
    expect(res.body.data).toHaveProperty('uptime');
  });

  it('GET /api/v1/invalid-route - should return 404', async () => {
    const res = await request(app).get('/api/v1/invalid-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
