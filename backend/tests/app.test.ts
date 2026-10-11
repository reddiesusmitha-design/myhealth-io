import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app';

describe('Backend Application Health & Base Endpoints', () => {
  it('GET /api/health returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
  });

  it('GET /api/reports without token returns 401 Unauthorized', async () => {
    const res = await request(app).get('/api/reports');
    assert.equal(res.status, 401);
  });
});

