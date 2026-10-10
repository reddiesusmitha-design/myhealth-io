import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Backend Application Health & Base Endpoints', () => {
  it('GET /api/health returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET /api/reports without token returns 401 Unauthorized', async () => {
    const res = await request(app).get('/api/reports');
    expect(res.status).toBe(401);
  });
});
