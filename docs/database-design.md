# MyHealthIO — Database Design & FHIR Mapping

## 1. Relational Entity Relationship (PostgreSQL)

The database schema is designed to model multi-tenant personal health documents, extracted clinical observations, AI summaries, and longitudinal timeline data.

### Core Tables & Models

1. **`User`**:
   - `id`: UUID (Primary Key)
   - `email`: Unique email string
   - `passwordHash`: Bcrypt/Argon2 hashed password
   - `fullName`: Display name
   - `createdAt`, `updatedAt`

2. **`PatientProfile` (FHIR `Patient`)**:
   - `id`: UUID
   - `userId`: Foreign key to `User(id)` (1-to-1)
   - `mockAbhaId`: Formatted mock ABHA ID (e.g. `ABHA-91-8842-1092-4412`)
   - `dateOfBirth`, `gender`, `bloodGroup`, `emergencyContact`
   - `preferredLanguage`: `'en'` or `'te'`

3. **`MedicalDocument` (FHIR `DocumentReference` & `DiagnosticReport`)**:
   - `id`: UUID
   - `userId`: Foreign key to `User(id)` (1-to-Many)
   - `originalFilename`, `filePath`, `mimeType`, `fileSizeBytes`
   - `documentType`: `LAB_REPORT`, `PRESCRIPTION`, `DISCHARGE_SUMMARY`
   - `documentDate`: Extracted or declared document date
   - `extractedRawText`: Full verbatim parsed text
   - `processingStatus`: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`
   - `ocrConfidence`: Overall percentage (0-100)

4. **`ExtractedField` (Clinical Traceability)**:
   - `id`: UUID
   - `documentId`: Foreign key to `MedicalDocument(id)`
   - `fieldCategory`: `LAB_RESULT`, `MEDICATION`, `DIAGNOSIS`, `VITAL`
   - `fieldKey`: Name of the metric or medicine
   - `fieldValue`: Extracted value string
   - `confidenceScore`: Extraction confidence (0-100)
   - `isUncertain`: Flag if text was ambiguous, blurred, or lacking unit
   - `uncertaintyReason`: Explanation of uncertainty
   - `sourceSnippet`: Verbatim line / segment from the document text
   - `isUserReviewed`: Whether user verified or edited
   - `userOverrideValue`: User-corrected value if altered

5. **`LabObservation` (FHIR `Observation`)**:
   - `id`: UUID
   - `documentId`, `userId`: Foreign keys
   - `testName`: Standardized or verbatim test name
   - `valueNumeric`: Float value if quantifiable
   - `valueString`: Raw value representation
   - `unit`: Unit of measurement (mg/dL, %, mmol/L)
   - `referenceLow`, `referenceHigh`, `referenceText`: Established lab limits
   - `interpretation`: `NORMAL`, `HIGH`, `LOW`, `UNCERTAIN`
   - `observationDate`: Date of sample/test

6. **`MedicationRecord` (FHIR `MedicationStatement`)**:
   - `id`: UUID
   - `documentId`, `userId`: Foreign keys
   - `medicationName`: Active ingredient or brand name
   - `dosage`: e.g. `500 mg`
   - `frequency`: e.g. `Once daily after dinner`
   - `duration`: e.g. `30 days`
   - `instructions`: Patient instructions

7. **`HealthSummary`**:
   - `id`: UUID
   - `documentId`: Foreign key to `MedicalDocument(id)` (1-to-1)
   - `summaryEn`: Plain English patient-friendly explanation
   - `summaryTe`: Verified Telugu translation
   - `keyFindings`: JSONB array of key points with status and source snippets
   - `aiProvider`: `'gemini'`, `'openai'`, or `'template'`
   - `disclaimerText`: Standard non-diagnostic safety disclaimer

8. **`TimelineEvent`**:
   - `id`: UUID
   - `userId`: Foreign key to `User(id)`
   - `documentId`: Foreign key to `MedicalDocument(id)` (nullable)
   - `eventDate`: Chronological timestamp
   - `eventType`: Event category
   - `title`: Short title
   - `summaryPreview`: High-level summary
   - `severityLevel`: `INFO`, `ATTENTION`, `NORMAL`

---

## 2. FHIR & ABDM Alignment Matrix

| MyHealthIO Model | FHIR R4 Resource | ABDM Equivalent Module | Notes |
| :--- | :--- | :--- | :--- |
| `PatientProfile` | `Patient` | ABHA Health ID & Profile | Fictional mock ABHA identifier used (`ABHA-XX-XXXX-XXXX-XXXX`) |
| `MedicalDocument` | `DocumentReference` | Health Record Artifact | Encapsulates storage location, MIME, hash, and status |
| `LabObservation` | `Observation` | Diagnostic Report Observation | Code, valueQuantity, referenceRange, interpretation |
| `MedicationRecord` | `MedicationStatement` | Prescription Record | Dosage, timing, route |
| `MedicalDocument` | `DiagnosticReport` | Diagnostic Report Resource | Represents the composite laboratory panel |

### ABDM Integration Roadmap Note
In a live production setting under India's Ayushman Bharat Digital Mission (ABDM), integration requires:
1. Registration with National Health Authority (NHA) Sandbox.
2. M1, M2, and M3 milestone certification for consent management, health information provider (HIP), and health information user (HIU) workflows.
3. Cryptographic end-to-end encryption via Diffie-Hellman key exchange for FHIR data transfers.
