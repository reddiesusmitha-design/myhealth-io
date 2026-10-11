import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app';

describe('API Tests: Clinical Features (Meds, Diet, Emergency, Appointments, First Aid, Notifications)', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `features_user_${timestamp}@myhealthio.test`,
    password: 'SecurePassword123!',
    fullName: 'Clinical Features Patient',
    preferredLanguage: 'en',
  };

  let token = '';
  let notificationId = '';
  let alarmId = '';
  let appointmentId = '';
  let dispatchId = '';

  before(async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    token = regRes.body.data.token;
  });

  // --- Notifications ---
  it('GET /api/notifications returns user notifications list', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  it('POST /api/notifications creates a new notification for user', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Medication Refill Reminder',
        message: 'Your Metformin stock is below 5 tablets.',
        type: 'MEDICATION_ALARM',
        priority: 'HIGH',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    notificationId = res.body.data.id;
  });

  it('PATCH /api/notifications/:id/read marks notification as read', async () => {
    const res = await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  it('PATCH /api/notifications/mark-all-read marks all user notifications as read', async () => {
    const res = await request(app)
      .patch('/api/notifications/mark-all-read')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  it('DELETE /api/notifications/:id removes the notification', async () => {
    const res = await request(app)
      .delete(`/api/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  // --- Medication Alarms ---
  it('POST /api/medications/alarms creates a tablet alarm with timings and stock', async () => {
    const res = await request(app)
      .post('/api/medications/alarms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        medicineName: 'Metformin Hydrochloride',
        dosage: '500 mg',
        frequency: 'TWICE_DAILY',
        timings: ['08:00', '20:00'],
        mealRelation: 'AFTER_MEAL',
        pillStock: 25,
        lowStockThreshold: 5,
        active: true,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    assert.equal(res.body.data.medicineName, 'Metformin Hydrochloride');
    alarmId = res.body.data.id;
  });

  it('GET /api/medications/alarms lists active medication alarms', async () => {
    const res = await request(app)
      .get('/api/medications/alarms')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    const found = res.body.data.find((a: any) => a.id === alarmId);
    assert.ok(found);
  });

  it('PATCH /api/medications/alarms/:id/take logs dose intake and updates stock', async () => {
    const res = await request(app)
      .patch(`/api/medications/alarms/${alarmId}/take`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'TAKEN', time: '08:05' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.pillStock <= 24, 'Pill stock should decrease upon dose taken');
  });

  it('DELETE /api/medications/alarms/:id deletes alarm', async () => {
    const res = await request(app)
      .delete(`/api/medications/alarms/${alarmId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  // --- Diet & Hydration ---
  it('GET /api/diet returns diet profile and water tracking goals', async () => {
    const res = await request(app)
      .get('/api/diet')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data);
  });

  it('POST /api/diet/water logs water intake and updates glass count', async () => {
    const res = await request(app)
      .post('/api/diet/water')
      .set('Authorization', `Bearer ${token}`)
      .send({ glasses: 2 });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.waterLoggedGlasses >= 2);
  });

  it('PUT /api/diet/plan updates diet plan parameters', async () => {
    const res = await request(app)
      .put('/api/diet/plan')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planName: 'Diabetic Wellness Nutrition Plan',
        targetDailyCalories: 1900,
        dietaryRestrictions: ['Low Sodium', 'No Refined Sugars'],
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  // --- Emergency SOS & Ambulance ---
  it('POST /api/emergency/sos dispatches emergency ambulance and returns details', async () => {
    const res = await request(app)
      .post('/api/emergency/sos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        address: 'Banjara Hills Road No. 12, Hyderabad',
        severity: 'CRITICAL',
        ambulanceType: 'ADVANCED_CARDIAC_ICU',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    assert.ok(res.body.data.ambulanceDetails);
    dispatchId = res.body.data.id;
  });

  it('GET /api/emergency/latest returns active emergency dispatch', async () => {
    const res = await request(app)
      .get('/api/emergency/latest')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data);
    assert.equal(res.body.data.id, dispatchId);
  });

  it('GET /api/emergency/directory returns hospital and helpline directory', async () => {
    const res = await request(app)
      .get('/api/emergency/directory')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length > 0);
  });

  it('PATCH /api/emergency/:id/status updates emergency dispatch status', async () => {
    const res = await request(app)
      .patch(`/api/emergency/${dispatchId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'ARRIVED', etaMinutes: 0 });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  // --- Appointments ---
  it('POST /api/appointments creates a new medical appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        doctorName: 'Dr. Ramesh Chandra',
        specialty: 'Cardiology',
        clinicName: 'Apollo Hospitals Jubilee Hills',
        date: '2026-10-25',
        time: '10:30 AM',
        type: 'FOLLOW_UP',
        reasonForVisit: 'Quarterly lipid profile and ECG review',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id);
    appointmentId = res.body.data.id;
  });

  it('GET /api/appointments retrieves list of upcoming appointments', async () => {
    const res = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    const found = res.body.data.find((a: any) => a.id === appointmentId);
    assert.ok(found);
  });

  it('PUT /api/appointments/:id updates appointment details', async () => {
    const res = await request(app)
      .put(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'CONFIRMED',
        doctorNotes: 'Patient to fast 8 hours prior for fasting blood sugar test.',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  it('DELETE /api/appointments/:id deletes appointment', async () => {
    const res = await request(app)
      .delete(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  // --- Basic First Aid Guides (Public access) ---
  it('GET /api/firstaid returns list of emergency first aid guides without requiring auth', async () => {
    const res = await request(app).get('/api/firstaid');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length > 0);
  });

  it('GET /api/firstaid/:slug returns detailed guide for CPR', async () => {
    const res = await request(app).get('/api/firstaid/cpr');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.title.includes('CPR'));
    assert.ok(res.body.data.steps);
  });

  it('GET /api/firstaid/:slug returns 404 for non-existent guide', async () => {
    const res = await request(app).get('/api/firstaid/nonexistent-emergency-guide-12345');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});
