import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app';

describe('End-to-End User Journey: Comprehensive Patient Care Workflow', () => {
  const ts = Date.now();
  const patient = {
    email: `e2e_patient_${ts}@myhealthio.test`,
    password: 'PatientPassword2026!',
    fullName: 'Ananya Reddy',
    preferredLanguage: 'te',
  };

  let token = '';
  let patientId = '';
  let reportId = '';
  let alarmId = '';
  let appointmentId = '';
  let emergencyId = '';

  it('Step 1: Patient registers new account with preferred language', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(patient);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.ok(res.body.data.user.mockAbhaId.startsWith('ABHA-91-'));

    token = res.body.data.token;
    patientId = res.body.data.user.id;
  });

  it('Step 2: Patient logs in and receives verified session', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: patient.email, password: patient.password });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
  });

  it('Step 3: Patient profile is retrieved and verifies identity', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.email, patient.email);
    assert.equal(res.body.data.preferredLanguage, 'te');
  });

  it('Step 4: Patient updates blood group and emergency contact details', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bloodGroup: 'A+',
        emergencyContact: '+91 91234 56789',
        allergies: ['Sulfonamides'],
        chronicConditions: ['Type 2 Diabetes'],
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.bloodGroup, 'A+');
    assert.equal(res.body.data.emergencyContact, '+91 91234 56789');
  });

  it('Step 5: Patient uploads new clinical lab report', async () => {
    const res = await request(app)
      .post('/api/reports/upload')
      .set('Authorization', `Bearer ${token}`)
      .send({
        originalFilename: 'HbA1c_Quarterly_Report_Oct2026.pdf',
        documentType: 'LAB_REPORT',
        facility: 'Vijaya Diagnostics Hyderabad',
        rawText: 'Glycosylated Hemoglobin (HbA1c): 6.8% (Pre-diabetic/Diabetic Control). Fasting Glucose: 122 mg/dL.',
      });

    assert.equal(res.status, 201);
    assert.ok(res.body.data.id);
    assert.equal(typeof res.body.data.fileSizeBytes, 'number');
    reportId = res.body.data.id;
  });

  it('Step 6: Patient timeline reflects newly uploaded diagnostic record', async () => {
    const res = await request(app)
      .get('/api/timeline')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    const event = res.body.data.find((e: any) => e.reportId === reportId);
    assert.ok(event, 'Timeline event must be automatically created upon upload');
  });

  it('Step 7: In-app notification confirms report processing', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.length > 0, 'Should have received welcome and report upload notifications');
  });

  it('Step 8: Patient configures prescription alarm and logs dosage intake', async () => {
    const medRes = await request(app)
      .post('/api/medications/alarms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        medicineName: 'Metformin 500mg',
        dosage: '1 Tablet',
        frequency: 'TWICE_DAILY',
        timings: ['08:30', '20:30'],
        mealRelation: 'AFTER_MEAL',
        pillStock: 60,
        lowStockThreshold: 10,
      });

    assert.equal(medRes.status, 201);
    alarmId = medRes.body.data.id;

    // Log dose taken
    const takeRes = await request(app)
      .patch(`/api/medications/alarms/${alarmId}/take`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'TAKEN', time: '08:32' });

    assert.equal(takeRes.status, 200);
    assert.equal(takeRes.body.data.pillStock, 59);
  });

  it('Step 9: Patient logs daily water hydration progress', async () => {
    const res = await request(app)
      .post('/api/diet/water')
      .set('Authorization', `Bearer ${token}`)
      .send({ glasses: 3 });

    assert.equal(res.status, 200);
    assert.ok(res.body.data.waterLoggedGlasses >= 3);
  });

  it('Step 10: Patient triggers Emergency SOS ambulance dispatch', async () => {
    const res = await request(app)
      .post('/api/emergency/sos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        address: 'Hitech City Phase 2, Madhapur, Hyderabad',
        severity: 'URGENT',
        ambulanceType: 'BASIC_LIFE_SUPPORT',
      });

    assert.equal(res.status, 201);
    assert.ok(res.body.data.id);
    assert.ok(res.body.data.ambulanceDetails);
    emergencyId = res.body.data.id;
  });

  it('Step 11: Patient books follow-up consultation with endocrinologist', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        doctorName: 'Dr. Sunita Varma',
        specialty: 'Endocrinology',
        clinicName: 'Care Hospitals Banjara Hills',
        date: '2026-11-05',
        time: '11:00 AM',
        type: 'CONSULTATION',
        reasonForVisit: 'Review 3-month HbA1c progress and diet adherence',
      });

    assert.equal(res.status, 201);
    assert.ok(res.body.data.id);
    appointmentId = res.body.data.id;
  });

  it('Step 12: Patient consults emergency first aid protocol for CPR', async () => {
    const res = await request(app).get('/api/firstaid/cpr');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.cprCadenceBpm >= 100);
  });

  it('Step 13: Clean up and delete report', async () => {
    const res = await request(app)
      .delete(`/api/reports/${reportId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
  });
});
