# MyHealthIO — Automated Test Suite Documentation

## 1. Prerequisites
- **Node.js**: v20+ recommended (native test runner `node --test` with `--import tsx` is used).
- **Package Manager**: npm v10+.
- **Database (Optional / Automatically Resilient)**:
  - If a live Supabase PostgreSQL connection string (`DATABASE_URL` and `DIRECT_URL`) is present in `backend/.env`, tests will execute against live database delegates.
  - If unconfigured or offline, the application runtime automatically operates in resilient test mode with in-memory persistence delegates so that tests execute reliably in isolated CI/CD environments.

---

## 2. Environment Variables Required for Testing
Configured in `backend/.env` (reference `backend/.env.example`):
- `PORT`: (default: `5000`)
- `NODE_ENV`: `test` or `development`
- `DATABASE_URL`: Supabase Transaction Pooler connection string (`postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`)
- `DIRECT_URL`: Supabase direct connection string (`postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres`)
- `JWT_SECRET`: Secret key for signing and verifying test JWT bearer tokens.
- `JWT_EXPIRES_IN`: Token validity period (e.g. `7d` or `1h`).
- `UPLOAD_DIR`: Local file staging directory (default: `./uploads`).

---

## 3. Test Suites & Commands

All automated tests are organized under `backend/tests/` and run using the Node.js native test runner via `tsx`.

### Run Complete Test Suite (85 Tests)
```bash
cd backend
npm test
```

### Run Unit Tests Only (Clinical Safety & AI Modules)
```bash
cd backend
npx tsx --test tests/unit/clinical_safety.test.ts
```
Covers:
- Medical advice prevention guardrail (`validateClinicalSafety`).
- Unauthorized diagnostic assertion detection.
- Grounded health summary generation and mandatory disclaimer verification.
- Entity extraction contracts and Telugu concept translation.

### Run Authentication & Profile API Tests
```bash
cd backend
npx tsx --test tests/api/auth_and_profile.test.ts
```
Covers:
- User registration (`POST /api/auth/register`) with mock ABHA generation.
- Duplicate email prevention and missing field rejection.
- Login authentication (`POST /api/auth/login`) with bcrypt password verification.
- Profile inspection (`GET /api/auth/me`) and modification (`PUT /api/profile`).

### Run Medical Reports & Longitudinal Timeline Tests
```bash
cd backend
npx tsx --test tests/api/medical_reports.test.ts
```
Covers:
- Report upload (`POST /api/reports/upload`) with Multer disk staging.
- BigInt `fileSizeBytes` serialization to JSON numbers.
- Timeline event generation.
- Report detail retrieval and cascade deletion.

### Run Clinical Features API Tests (Meds, Diet, Emergency, Appointments, First Aid)
```bash
cd backend
npx tsx --test tests/api/health_features.test.ts
```
Covers:
- Notifications (`GET /api/notifications`, `PATCH /read`, `PATCH /mark-all-read`, `DELETE`).
- Medication alarms (`GET /alarms`, `POST /alarms`, `PATCH /take` stock decrement, `DELETE`).
- Diet & hydration tracking (`GET /diet`, `POST /water` glass increment, `PUT /plan`).
- Emergency SOS ambulance dispatch (`POST /emergency/sos`, `GET /latest`, `GET /directory`).
- Doctor appointments (`GET /appointments`, `POST /appointments`, `PUT`, `DELETE`).
- Emergency first aid guides (`GET /firstaid`, `GET /firstaid/cpr`).

### Run Security & Multi-Tenant Isolation Tests
```bash
cd backend
npx tsx --test tests/security/security_guardrails.test.ts
```
Covers:
- Multi-tenant tenant boundary checks (User B cannot access, read, or delete User A records).
- Credential protection (never leaking `passwordHash` or `DATABASE_URL` in responses).
- Helmet security header validation.
- SQL injection string sanitization and server crash resilience.

### Run End-to-End User Journey Tests
```bash
cd backend
npx tsx --test tests/e2e/patient_full_flow.test.ts
```
Executes the complete multi-step journey:
1. Patient registration with Telugu language selection.
2. Login and JWT bearer issuance.
3. Profile inspection and ABHA verification.
4. Profile vitals and allergies update.
5. Ingestion of clinical lab report.
6. Automatic creation of longitudinal health timeline event.
7. Verification of in-app notification.
8. Creation of medication alarm and recording pill dose intake.
9. Daily water hydration glass logging.
10. Triggering of Emergency SOS ambulance dispatch.
11. Booking follow-up consultation with endocrinologist.
12. Reviewing CPR emergency resuscitation guidance.
13. Safe report deletion and cleanup.

---

## 4. How to Interpret Test Results

- `✔`: Test passed with timing in milliseconds.
- `✖`: Test failed with call stack and assertion difference.
- Summary block indicates:
  - `ℹ tests`: Total number of tests executed.
  - `ℹ suites`: Total number of describe blocks.
  - `ℹ pass`: Total passing tests.
  - `ℹ fail`: Total failed tests.
  - `ℹ duration_ms`: Overall test execution duration.
