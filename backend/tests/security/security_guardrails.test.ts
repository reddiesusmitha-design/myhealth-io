import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app';

describe('Security & Multi-Tenant Data Isolation Tests', () => {
  const ts = Date.now();
  const userA = {
    email: `tenant_a_${ts}@myhealthio.test`,
    password: 'PasswordTenantA123!',
    fullName: 'Patient Tenant Alpha',
  };
  const userB = {
    email: `tenant_b_${ts}@myhealthio.test`,
    password: 'PasswordTenantB123!',
    fullName: 'Patient Tenant Beta',
  };

  let tokenA = '';
  let tokenB = '';
  let reportAId = '';
  let alarmAId = '';

  before(async () => {
    const resA = await request(app).post('/api/auth/register').send(userA);
    tokenA = resA.body.data.token;

    const resB = await request(app).post('/api/auth/register').send(userB);
    tokenB = resB.body.data.token;

    // Create Report for User A
    const repRes = await request(app)
      .post('/api/reports/upload')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        originalFilename: 'Confidential_Lab_PatientA.pdf',
        documentType: 'LAB_REPORT',
        facility: 'Apollo Health City',
        rawText: 'Fasting blood sugar 128 mg/dL. Confidential records.',
      });
    reportAId = repRes.body.data.id;

    // Create Medication for User A
    const medRes = await request(app)
      .post('/api/medications/alarms')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        medicineName: 'Atorvastatin 20mg',
        dosage: '1 Tab',
        timings: ['21:00'],
      });
    alarmAId = medRes.body.data.id;
  });

  it('Multi-tenant isolation: User B cannot see User A reports in list', async () => {
    const res = await request(app)
      .get('/api/reports')
      .set('Authorization', `Bearer ${tokenB}`);

    assert.equal(res.status, 200);
    const found = res.body.data.find((r: any) => r.id === reportAId);
    assert.equal(found, undefined, 'User B must never see User A reports in list');
  });

  it('Multi-tenant isolation: User B cannot retrieve User A report details by ID', async () => {
    const res = await request(app)
      .get(`/api/reports/${reportAId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    assert.notEqual(res.body.data?.originalFilename, 'Confidential_Lab_PatientA.pdf');
  });

  it('Multi-tenant isolation: User B cannot delete User A medical report', async () => {
    await request(app)
      .delete(`/api/reports/${reportAId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    // Verify User A still owns the report
    const checkRes = await request(app)
      .get(`/api/reports/${reportAId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    assert.equal(checkRes.status, 200);
    assert.equal(checkRes.body.data.originalFilename, 'Confidential_Lab_PatientA.pdf');
  });

  it('Multi-tenant isolation: User B cannot view User A medication alarms', async () => {
    const res = await request(app)
      .get('/api/medications/alarms')
      .set('Authorization', `Bearer ${tokenB}`);

    assert.equal(res.status, 200);
    const found = res.body.data.find((a: any) => a.id === alarmAId);
    assert.equal(found, undefined, 'User B must not see User A medication alarms');
  });

  it('Secret protection: auth and profile responses never expose passwordHash', async () => {
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenA}`);

    assert.equal(meRes.status, 200);
    const serialized = JSON.stringify(meRes.body);
    assert.ok(!serialized.includes('passwordHash'));
    assert.ok(!serialized.includes('$2a$'));
    assert.ok(!serialized.includes('$2b$'));
  });

  it('Secret protection: health check never exposes database credentials or connection strings', async () => {
    const healthRes = await request(app).get('/api/health');
    assert.equal(healthRes.status, 200);
    const bodyStr = JSON.stringify(healthRes.body);
    assert.ok(!bodyStr.includes('postgresql://'));
    assert.ok(!bodyStr.includes('pooler.supabase.com'));
    assert.ok(!bodyStr.includes('password'));
  });

  it('Helmet security headers are active on responses', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
  });

  it('Sanitization & Injection resilience: malicious input in login does not crash server', async () => {
    const sqlInjectionAttempts = [
      "' OR '1'='1",
      "admin'--",
      "'; DROP TABLE users;--",
    ];

    for (const injection of sqlInjectionAttempts) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: injection, password: 'password' });

      assert.ok(res.status === 400 || res.status === 401 || res.status === 404);
      assert.equal(res.body.success, false);
    }
  });
});
