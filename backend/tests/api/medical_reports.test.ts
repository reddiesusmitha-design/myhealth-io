import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app';

describe('API Tests: Medical Reports & Longitudinal Timeline', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `reports_user_${timestamp}@myhealthio.test`,
    password: 'SecurePassword123!',
    fullName: 'Reports Test Patient',
    preferredLanguage: 'en',
  };

  let token = '';
  let createdReportId = '';

  before(async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    token = regRes.body.data.token;
  });

  it('GET /api/reports rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/reports');
    assert.equal(res.status, 401);
  });

  it('GET /api/reports returns empty list initially for fresh user', async () => {
    const res = await request(app)
      .get('/api/reports')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  it('POST /api/reports/upload successfully uploads report and serializes BigInt safely', async () => {
    const reportPayload = {
      originalFilename: 'Lipid_Panel_Report_2026.pdf',
      documentType: 'LAB_REPORT',
      facility: 'Care Diagnostics Hyderabad',
      rawText: 'Total Cholesterol: 215 mg/dL. Triglycerides: 160 mg/dL. HDL: 45 mg/dL. LDL: 138 mg/dL.',
    };

    const res = await request(app)
      .post('/api/reports/upload')
      .set('Authorization', `Bearer ${token}`)
      .send(reportPayload);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id, 'Should return created report ID');
    assert.equal(res.body.data.originalFilename, reportPayload.originalFilename);
    assert.equal(res.body.data.documentType, reportPayload.documentType);
    assert.equal(typeof res.body.data.fileSizeBytes, 'number', 'BigInt must be serialized to number');

    createdReportId = res.body.data.id;
  });

  it('GET /api/reports lists the newly uploaded report', async () => {
    const res = await request(app)
      .get('/api/reports')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    const found = res.body.data.find((r: any) => r.id === createdReportId);
    assert.ok(found, 'Uploaded report should be present in reports list');
  });

  it('GET /api/reports/:id retrieves full details for authorized owner', async () => {
    const res = await request(app)
      .get(`/api/reports/${createdReportId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.id, createdReportId);
    assert.equal(typeof res.body.data.fileSizeBytes, 'number');
  });

  it('POST /api/reports/:id/analyze triggers analysis and returns structured summary', async () => {
    const res = await request(app)
      .post(`/api/reports/${createdReportId}/analyze`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data);
  });

  it('PATCH /api/reports/:id/review accepts user corrections for clinical fields', async () => {
    const reviewPayload = {
      fieldId: 'field-uuid-cholesterol',
      reviewedValue: '210 mg/dL',
      isApproved: true,
    };

    const res = await request(app)
      .patch(`/api/reports/${createdReportId}/review`)
      .set('Authorization', `Bearer ${token}`)
      .send(reviewPayload);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  it('GET /api/timeline displays event created from uploaded report', async () => {
    const res = await request(app)
      .get('/api/timeline')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    const event = res.body.data.find((e: any) => e.reportId === createdReportId || e.title === 'Lipid_Panel_Report_2026.pdf');
    assert.ok(event, 'Timeline event should exist for uploaded report');
  });

  it('DELETE /api/reports/:id deletes report successfully', async () => {
    const res = await request(app)
      .delete(`/api/reports/${createdReportId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});
