# MyHealthIO — REST API Specification

Base URL: `http://localhost:5000/api`

---

## 1. System Health & Diagnostics

### `GET /api/health`
Checks the operational status of server, database connection, and AI pipeline.
- **Access**: Public
- **Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-10-09T12:35:00.000Z",
  "database": "connected",
  "aiProvider": "template"
}
```

---

## 2. Authentication

### `POST /api/auth/register`
Registers a new user and creates an associated patient profile with a mock ABHA ID.
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "fullName": "Kiran Varma",
  "preferredLanguage": "en"
}
```

### `POST /api/auth/login`
Authenticates a user and returns a JWT access token.
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```
- **Response**:
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "uuid-...",
    "email": "user@example.com",
    "fullName": "Kiran Varma",
    "mockAbhaId": "ABHA-91-8842-1092-4412"
  }
}
```

### `POST /api/auth/logout`
Invalidates client authentication state.

---

## 3. Patient Profile

### `GET /api/profile`
Retrieves the logged-in user's profile and mock ABHA identifier.
- **Headers**: `Authorization: Bearer <token>`

---

## 4. Medical Reports & Document Processing

### `GET /api/reports`
Lists all medical reports belonging to the authenticated user.
- **Headers**: `Authorization: Bearer <token>`

### `POST /api/reports/upload`
Uploads a new medical report file (PDF, PNG, JPG).
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body**: `file: <binary_data>`, `documentType: "LAB_REPORT"`

### `GET /api/reports/:id`
Retrieves report details including raw extracted text, clinical fields, and source snippets.
- **Headers**: `Authorization: Bearer <token>`

### `POST /api/reports/:id/analyze`
Executes grounded summarization and Telugu translation pipeline on extracted data.
- **Headers**: `Authorization: Bearer <token>`

### `PATCH /api/reports/:id/review`
Submits user corrections or validations for specific extracted fields.
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "fieldId": "uuid-...",
  "reviewedValue": "118 mg/dL",
  "isApproved": true
}
```

### `DELETE /api/reports/:id`
Deletes a medical report and its associated extracted fields, lab observations, and files.
- **Headers**: `Authorization: Bearer <token>`

---

## 5. Longitudinal Health Timeline

### `GET /api/timeline`
Retrieves chronological timeline events (reports, medications, lab observations).
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `?limit=20&startDate=2024-01-01`
