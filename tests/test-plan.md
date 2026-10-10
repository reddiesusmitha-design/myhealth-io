# MyHealthIO Comprehensive Test Plan

## 1. Scope & Objective
Validate the accuracy, security, and usability of MyHealthIO across end-to-end user workflows:
- Document upload and format validation
- OCR & clinical entity extraction with source snippet grounding
- Explainable summarization & Telugu translation with safety guardrails
- Timeline generation and user profile management
- Access control and multi-tenant patient data segregation

---

## 2. Test Suites

### A. Authentication & Authorization
- **AUTH-01**: User registration with valid email, strong password, and profile metadata.
- **AUTH-02**: Login with valid credentials returns signed JWT / session token.
- **AUTH-03**: Login fails gracefully with invalid password or unregistered email.
- **AUTH-04**: Direct access to `/api/reports/:id` or `/api/timeline` without authorization returns `401 Unauthorized`.
- **AUTH-05**: Cross-tenant data isolation — User A cannot view, mutate, or delete User B's reports (`403 Forbidden` / `404 Not Found`).

### B. File Upload & Validation
- **UPL-01**: Successful upload of standard lab PDF report (< 10MB).
- **UPL-02**: Successful upload of clear image reports (PNG, JPG).
- **UPL-03**: Rejection of unsupported file types (`.exe`, `.zip`, `.docx`).
- **UPL-04**: Rejection of oversized files (> 10MB limit).
- **UPL-05**: Content-type / magic-byte verification to prevent spoofed MIME extensions.

### C. Clinical Extraction & OCR Grounding
- **EXT-01**: Accurate identification of lab test names, numeric values, and units.
- **EXT-02**: Source snippet association — every extracted field links to exact verbatim text in raw document.
- **EXT-03**: Identification of reference intervals and determination of status (NORMAL, HIGH, LOW).
- **EXT-04**: Handling unstated reference ranges without guessing (flags as UNCERTAIN).
- **EXT-05**: Detection of low-confidence OCR regions and flagging for user review.

### D. AI Summarizer, Safety & Telugu Localization
- **AI-01**: Plain-language English summary generated purely on verified extracted fields.
- **AI-02**: Fallback to honest template-based summarization when AI provider API key is not configured.
- **AI-03**: Safety guardrail validation — summary never recommends altering prescriptions or inventing diagnoses.
- **AI-04**: Telugu translation generation retaining medical precision and verified terms.
- **AI-05**: Mandatory clinical disclaimer attached to every summary view.

### E. User Review, Mutation & Health Timeline
- **REV-01**: User reviews and modifies extracted lab value or medication dosage.
- **REV-02**: Modified value marked with `isUserReviewed: true` and audit timestamp.
- **REV-03**: Longitudinal timeline aggregates events chronologically with severity tags.
- **REV-04**: Report deletion cascades cleanly to associated extracted fields, summaries, and timeline events.
- **REV-05**: Uploaded document files securely removed on report deletion.

---

## 3. Tooling
- **Unit / Integration**: Vitest + Supertest
- **End-to-End**: Playwright
