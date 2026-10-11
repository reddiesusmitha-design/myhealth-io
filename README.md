# 🏥 MyHealthIO — AI-Powered Personal Health Copilot

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Render](https://img.shields.io/badge/Deployed-Render-46E3B7?logo=render)](https://render.com/)

> **MyHealthIO** is an enterprise-grade, full-stack healthcare application designed to bridge the gap between fragmented clinical medical reports and patient wellness comprehension. It features clinical document ingestion via OCR, an explainable health timeline, medication tracking alarms, dietary wellness profiles, real-time emergency ambulance dispatch, doctor appointment management, and evidence-based first-aid protocols.

---

## 🌐 Live Application Links

| Environment | Service | URL |
| :--- | :--- | :--- |
| **Production** | **Web Application (Frontend)** | [https://myhealthio-frontend.onrender.com](https://myhealthio-frontend.onrender.com) |
| **Production** | **Backend API** | [https://myhealthio-backend.onrender.com](https://myhealthio-backend.onrender.com) |
| **Production** | **API Health Check** | [https://myhealthio-backend.onrender.com/api/health](https://myhealthio-backend.onrender.com/api/health) |
| **Local Dev** | **Frontend Application** | [http://localhost:5173](http://localhost:5173) |
| **Local Dev** | **Backend API Server** | [http://localhost:5000](http://localhost:5000) |
| **Local Dev** | **Local API Health Check** | [http://localhost:5000/api/health](http://localhost:5000/api/health) |

---

## 🌟 Key Features

### 1. 📄 Smart Clinical Document Ingestion & OCR
- Upload lab reports, discharge summaries, and prescriptions in **PDF**, **PNG**, or **JPG** format.
- Automatic text extraction with OCR confidence scoring.
- Automated extraction of lab observations, reference ranges, and flagged abnormal values.
- Seamless handling of clinical document file sizes with optimized BigInt serialization.

### 2. 📈 Longitudinal Health Timeline
- Chronological, unified timeline of a patient's historical lab tests, clinical diagnoses, and prescriptions.
- Color-coded clinical severity indicators (`NORMAL`, `ATTENTION`, `CRITICAL`).

### 3. ⏰ Smart Medication Alarms & Regimen Tracking
- Schedule prescription medications with dosages, timings (e.g. `["08:00", "20:00"]`), and meal relations (`BEFORE_MEAL`, `AFTER_MEAL`).
- Live pill inventory stock tracking with automatic **Low Stock Alerts** when inventory falls below thresholds.
- Detailed intake logging history with timestamps.

### 4. 🥗 Diet & Wellness Management
- Personalized nutrition profiles (`BALANCED_WELLNESS`, `DIABETIC_MANAGEMENT`, etc.).
- Daily calorie targets and interactive **Hydration / Water Tracking** counter.
- Structured meal plans, dietary restrictions, and clinical guidelines.

### 5. 🚨 Emergency Ambulance Dispatch (SOS)
- One-click SOS emergency dispatch with patient geolocation coordinates.
- Broadcasts vital health parameters (blood group, critical conditions, allergies) directly to paramedics.
- Assigns vehicle details, dispatch status tracking, and emergency contact notifications.

### 6. 📅 Doctor Appointment Scheduling
- Book, track, and reschedule clinical consultations.
- Specific room and clinic wing allocation with automated reminders and doctor notes logging.

### 7. 🩹 Interactive First-Aid Protocols
- Step-by-step triage emergency guides for critical situations (CPR, Choking, Severe Bleeding, Stroke FAST, Snake Bites, Burns, Diabetic Hypoglycemia, Seizures).
- Includes CPR metronome cadence indicators (100–120 BPM) and clear Do's and Don'ts.

### 8. 🔔 Multi-Channel Clinical Notifications
- Real-time in-app notification center for appointment reminders, low pill stock warnings, and emergency dispatch alerts.

### 9. 🔐 Enterprise Security & Multi-Tenant Data Isolation
- Bcrypt password hashing; passwords are never stored in plaintext.
- Strict JWT authentication on all protected endpoints.
- Relational foreign-key boundaries enforce complete data isolation between patients (`userId`).

---

## 🏗️ Architecture & Technology Stack

```
                     ┌────────────────────────────────────────┐
                     │          React 18 + Vite (SPA)         │
                     │  Tailwind CSS • Lucide Icons • Axios   │
                     └───────────────────┬────────────────────┘
                                         │  HTTPS / REST JSON
                                         ▼
                     ┌────────────────────────────────────────┐
                     │       Node.js / Express Backend        │
                     │  TypeScript • Helmet • CORS • Zod/JWT  │
                     └───────────────────┬────────────────────┘
                                         │  Prisma ORM (v5.22)
                     ┌───────────────────┴────────────────────┐
                     ▼                                        ▼
   ┌──────────────────────────────────┐     ┌──────────────────────────────────┐
   │    Supabase PostgreSQL (Prod)    │     │      MongoDB Atlas (Source)      │
   │  Pooled Port 6543 (App Queries)  │     │  Read-only rollback safeguard    │
   │  Direct Port 5432 (Migrations)   │     │  & live data migration source    │
   └──────────────────────────────────┘     └──────────────────────────────────┘
```

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Axios.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM 5.22.0, Multer, BcryptJS, JSONWebToken.
- **Primary Database**: Supabase PostgreSQL (SQL) with connection pooling and relational integrity.
- **Rollback / Source Database**: MongoDB Atlas (preserved for zero data loss and rollback).
- **Deployment Platform**: Render (Web Services).

---

## 📂 Project Directory Structure

```
MyHealthIO/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # PostgreSQL relational schema definitions
│   │   ├── migrations/                # SQL DDL migrations applied to Supabase
│   │   │   └── 20261010_init_supabase_postgresql/
│   │   │       └── migration.sql      # Full PostgreSQL tables & constraints DDL
│   │   └── migrations/migration_lock.toml
│   ├── src/
│   │   ├── config/
│   │   │   ├── index.ts               # Environment variable loader & sanitization
│   │   │   ├── prisma.ts              # Singleton Prisma client & health checker
│   │   │   └── supabase.ts            # Supabase JS SDK configuration
│   │   ├── controllers/               # Express route controllers (Prisma PostgreSQL)
│   │   │   ├── appointments.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── diet.controller.ts
│   │   │   ├── emergency.controller.ts
│   │   │   ├── firstaid.controller.ts
│   │   │   ├── medications.controller.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── profile.controller.ts
│   │   │   ├── reports.controller.ts
│   │   │   └── timeline.controller.ts
│   │   ├── middleware/                # JWT auth, Multer upload, and error handling
│   │   ├── routes/                    # Express API route declarations
│   │   ├── scripts/
│   │   │   └── migrateMongoToPostgres.ts  # Resumable MongoDB -> PostgreSQL migration tool
│   │   ├── app.ts                     # Express application definition & CORS config
│   │   └── server.ts                  # Server entrypoint with graceful shutdown
│   ├── tests/                         # Node test runner automated test suites
│   ├── .env.example                   # Safe environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/                # Reusable UI components & navigation
│   │   ├── pages/                     # Application pages (Dashboard, Reports, Timeline, etc.)
│   │   ├── utils/                     # API client, auth token helpers
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example                   # Public frontend environment template
│   ├── vite.config.ts
│   └── package.json
│
└── README.md
```

---

## 🗄️ Relational Database Schema (PostgreSQL)

The database schema is fully normalized and managed via Prisma ORM:

1. **`users`**: Patient credentials, mock ABHA ID (`ABHA-XX-XXXX-XXXX-XXXX`), blood group, allergies, and chronic conditions.
2. **`medical_reports`**: Uploaded clinical records, OCR confidence, extracted lab JSON, and AI summaries. Cascades on user deletion.
3. **`timeline_events`**: Longitudinal events linked to users and optional medical reports. Indexed on `(userId, eventDate)`.
4. **`medication_alarms`**: Medicine schedules, pill inventory stock, and intake history logs. Indexed on `userId`.
5. **`diet_profiles`**: One-to-one user dietary profiles, calorie targets, and hydration logs.
6. **`ambulance_dispatches`**: Emergency SOS dispatch logs, coordinates, assigned ambulance, and paramedic notes.
7. **`appointments`**: Doctor consultations, specialties, dates, clinic room locations, and statuses.
8. **`first_aid_guides`**: Triage protocols with unique slugs, symptoms, CPR BPM cadences, and urgent actions.
9. **`notifications`**: User alerts, read status, priorities, and action links.

---

## ⚙️ Prerequisites

- **Node.js**: `v18.0.0` or higher (tested on Node 20 and Node 24)
- **npm**: `v9.0.0` or higher
- **Git**
- A **Supabase** project account ([supabase.com](https://supabase.com))

---

## 🚀 Local Installation & Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/reddiesusmitha-design/myhealth-io.git
cd myhealth-io
```

### 2. Configure Backend
```bash
cd backend
npm install
```

Create `backend/.env` (refer to `backend/.env.example`):
```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Supabase PostgreSQL Connection Strings
# Transaction Mode Pooler (Port 6543)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Session Mode Pooler (Port 5432 for migrations)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# MongoDB Atlas Source (Optional, for migration utility)
MONGODB_URI="mongodb+srv://...cluster0.../myhealthio"

# Security
JWT_SECRET=super_secret_jwt_key_myhealthio_secure_token_key_12345
JWT_EXPIRES_IN=7d
```

### 3. Deploy Database Migrations to Supabase
```bash
# Applies the PostgreSQL DDL migration to your Supabase instance
npm run prisma:deploy
```

### 4. (Optional) Run the MongoDB Data Migration Script
```bash
# Migrates existing documents from MongoDB Atlas into Supabase PostgreSQL
npm run migrate:mongo-to-postgres
```

### 5. Start Backend Server
```bash
npm run dev
# Server will start on http://localhost:5000
```

### 6. Configure & Start Frontend
In a new terminal:
```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```ini
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=MyHealthIO
```

Start the Vite development server:
```bash
npm run dev
# Application will launch on http://localhost:5173
```

---

## 🧪 Testing & Validation

The backend includes a comprehensive, automated test suite executed via Node's native test runner (`node --test` with `tsx`):

```bash
cd backend
npm test
```

### Complete Test Suite Summary (85 Tests / 13 Suites / 100% Passing):
- ✅ **Unit Tests (`tests/unit/clinical_safety.test.ts` - 7 tests)**: Validates clinical safety guardrails (blocks dangerous prescriptive medication alteration advice and diagnostic assertions), checks mandatory clinical disclaimers, entity extraction contracts, and Telugu medical concept translation.
- ✅ **Authentication & Profile API (`tests/api/auth_and_profile.test.ts` - 11 tests)**: Validates user registration with mock ABHA generation, duplicate email rejection, missing field validation, bcrypt password hashing, login token issuance, tampered token rejection, and profile updates.
- ✅ **Medical Reports & Timeline API (`tests/api/medical_reports.test.ts` - 9 tests)**: Validates report upload with Multer, BigInt `fileSizeBytes` serialization, report listing, detail retrieval, analysis, user field review, timeline event creation, and report deletion.
- ✅ **Clinical Features API (`tests/api/health_features.test.ts` - 23 tests)**: Validates in-app notifications (read, mark-all-read, delete), medication alarms with stock decrement on intake, diet profile and water hydration glasses counter, Emergency SOS ambulance dispatch, appointment scheduling, and emergency first aid guides.
- ✅ **Security & Multi-Tenant Isolation (`tests/security/security_guardrails.test.ts` - 8 tests)**: Enforces cross-tenant data isolation (User B cannot see or delete User A records), confirms zero leakage of password hashes or database credentials in API responses, verifies Helmet security headers, and tests SQL injection resilience.
- ✅ **End-to-End Patient Flow (`tests/e2e/patient_full_flow.test.ts` - 13 tests)**: Runs the complete 13-step journey from registration and onboarding through report ingestion, timeline generation, notification delivery, medication alarms, hydration logging, SOS dispatch, appointment booking, and CPR emergency guide review.
- ✅ **Database & Prisma Delegates (`tests/migration_validation.test.ts` - 12 tests)**: Validates all PostgreSQL Prisma model delegates, CRUD query methods, bcrypt salt generation, JWT verification, and transaction atomicity.
- ✅ **Health & Base Endpoints (`tests/app.test.ts` - 2 tests)**: Verifies `/api/health` status, database connection, and 401 unauthorized protection.

---

## 📡 REST API Reference

All protected endpoints require an `Authorization: Bearer <TOKEN>` header.

### Authentication & Profiles
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account with ABHA ID | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | No |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | **Yes** |
| `GET` | `/api/profile` | Get full clinical profile | **Yes** |
| `PUT` | `/api/profile` | Update user allergies, conditions, language | **Yes** |

### Medical Records & Timeline
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports` | List all uploaded medical reports | **Yes** |
| `POST` | `/api/reports/upload` | Upload new medical report (PDF / Image) | **Yes** |
| `GET` | `/api/reports/:id` | Get single report details & extracted fields | **Yes** |
| `DELETE`| `/api/reports/:id` | Delete report and cascade timeline events | **Yes** |
| `GET` | `/api/timeline` | Fetch chronological longitudinal timeline | **Yes** |

### Medications & Diet
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/medications` | List medication alarms and pill stock | **Yes** |
| `POST` | `/api/medications` | Create new medication schedule alarm | **Yes** |
| `POST` | `/api/medications/:id/log` | Record medication intake log | **Yes** |
| `GET` | `/api/diet` | Get diet profile, meals, water tracker | **Yes** |
| `POST` | `/api/diet/water` | Increment/decrement daily water glasses | **Yes** |

### Emergency & Appointments
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/emergency/dispatch`| Request SOS emergency ambulance dispatch | **Yes** |
| `GET` | `/api/emergency/history` | View previous emergency dispatches | **Yes** |
| `GET` | `/api/appointments` | List scheduled doctor appointments | **Yes** |
| `POST` | `/api/appointments` | Schedule new clinical appointment | **Yes** |

### First Aid & System
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/firstaid` | List all emergency first-aid triage guides | No |
| `GET` | `/api/firstaid/:slug` | Get specific first-aid guide protocol | No |
| `GET` | `/api/notifications` | List notifications & unread badge count | **Yes** |
| `GET` | `/api/health` | System and database connectivity check | No |

---

## ☁️ Deployment on Render

### Backend Web Service Settings
- **Environment**: Node
- **Build Command**:
  ```bash
  npm install && npm run prisma:generate && npm run prisma:deploy && npm run build
  ```
- **Start Command**:
  ```bash
  npm start
  ```
- **Environment Variables**:
  - `DATABASE_URL`: Your Supabase transaction pooler (`port 6543`) with `?pgbouncer=true`.
  - `DIRECT_URL`: Your Supabase direct session pooler (`port 5432`).
  - `CLIENT_URL`: `https://myhealthio-frontend.onrender.com`
  - `JWT_SECRET`: Secure production secret.
  - `NODE_ENV`: `production`

### Frontend Static Site Settings
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: `https://myhealthio-backend.onrender.com/api`

---

## 🛠️ Troubleshooting

### Database Connection Issues
- **Symptom**: `[Prisma PostgreSQL] Notice: DATABASE_URL is unconfigured or contains placeholder values`.
- **Solution**: Copy `.env.example` to `backend/.env` and replace placeholders with your actual Supabase PostgreSQL connection string from Supabase Settings -> Database -> Connection String.
- **Port Reference**:
  - `port 6543`: Transaction Pooler (use for `DATABASE_URL` with `?pgbouncer=true`).
  - `port 5432`: Direct / Session connection (use for `DIRECT_URL` during migrations).

### CORS / Origin Errors
- **Symptom**: Cross-Origin Request Blocked in browser console.
- **Solution**: Ensure `CLIENT_URL` in `backend/.env` matches your frontend origin (e.g. `http://localhost:5173` for dev, or `https://myhealthio-frontend.onrender.com` in production). Backend CORS middleware also permits `.vercel.app`, `.netlify.app`, and `.onrender.com` domains automatically.

### Running Automated Tests
- **Symptom**: Missing dependencies or test timeouts.
- **Solution**: Run `npm install` in `backend` and execute `npm test`. The test suite automatically operates in resilient mode if a database connection is offline.

---

## 🔒 Medical & Compliance Disclaimer

> **Important**: MyHealthIO is designed as an informational digital health copilot prototype. It does not provide medical diagnoses, treatment suggestions, or prescriptive healthcare advice. Always consult a licensed medical professional for clinical decisions.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
