import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app';

describe('API Tests: Authentication & Profile Endpoints', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `test_user_${timestamp}@myhealthio.test`,
    password: 'SecurePassword123!',
    fullName: 'Dr. Test Patient',
    preferredLanguage: 'en',
  };

  let authToken = '';
  let userId = '';

  it('POST /api/auth/register creates a new user and returns JWT + user profile', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token, 'Should return a signed JWT token');
    assert.ok(res.body.data.user, 'Should return user profile data');
    assert.equal(res.body.data.user.email, testUser.email);
    assert.equal(res.body.data.user.fullName, testUser.fullName);
    assert.ok(res.body.data.user.mockAbhaId.startsWith('ABHA-91-'), 'Should assign mock ABHA ID');

    authToken = res.body.data.token;
    userId = res.body.data.user.id;
  });

  it('POST /api/auth/register rejects duplicate email with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    const errText = (res.body.message || res.body.error || '').toLowerCase();
    assert.ok(errText.includes('already exists'));
  });

  it('POST /api/auth/register rejects missing required fields with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'incomplete@example.com' });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('POST /api/auth/login authenticates with valid credentials and returns JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.email, testUser.email);
  });

  it('POST /api/auth/login rejects incorrect password with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'IncorrectPassword999!',
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    const errText = (res.body.message || res.body.error || '').toLowerCase();
    assert.ok(errText.includes('invalid'));
  });

  it('POST /api/auth/login rejects non-existent email with 401/404', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent_account_12345@myhealthio.test',
        password: 'SomePassword123!',
      });

    assert.ok(res.status === 401 || res.status === 404);
    assert.equal(res.body.success, false);
  });

  it('GET /api/auth/me returns authenticated user details when Bearer token is provided', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.email, testUser.email);
    assert.equal(res.body.data.fullName, testUser.fullName);
    assert.equal(res.body.data.passwordHash, undefined, 'Must never expose passwordHash');
  });

  it('GET /api/auth/me rejects requests without Authorization header with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('GET /api/auth/me rejects tampered or invalid token with 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.tampered.token');

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('GET /api/profile returns full patient profile', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data);
  });

  it('PUT /api/profile updates patient profile fields successfully', async () => {
    const updatePayload = {
      bloodGroup: 'B+',
      emergencyContact: '+91 98765 43210',
      allergies: ['Penicillin', 'Peanuts'],
      chronicConditions: ['Mild Hypertension'],
    };

    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatePayload);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.bloodGroup, 'B+');
    assert.equal(res.body.data.emergencyContact, '+91 98765 43210');
  });
});
