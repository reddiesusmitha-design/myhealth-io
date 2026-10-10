# MyHealthIO — System Architecture & Workflow

## 1. System Overview

MyHealthIO is an AI-powered personal health copilot designed to empower patients to ingest, understand, and organize their personal health documents. It combines secure multi-tenant cloud storage, multi-modal clinical text extraction, safety-guarded explainability in English and Telugu, and FHIR-aligned longitudinal health timelines.

---

## 2. Architecture Diagram

```mermaid
graph TD
    subgraph Client ["Frontend (React 18 + Vite + Tailwind CSS)"]
        UI_Dash["Dashboard & Stats"]
        UI_Upload["File Ingestion (PDF / Image)"]
        UI_Detail["Report Viewer & Traceability"]
        UI_Summary["AI Health Summary (EN / TE)"]
        UI_Timeline["Longitudinal Health Timeline"]
    end

    subgraph Server ["Backend API (Node.js + Express + TypeScript)"]
        Router["REST API Router & Auth Middleware"]
        UploadHandler["Multer Secure Upload & Validation"]
        AuthService["JWT & Argon2/Bcrypt Security"]
        DocController["Document Controller"]
        SummaryController["Summary & Review Controller"]
    end

    subgraph Pipeline ["Clinical Document & AI Pipeline"]
        OCR["Document Ingestion Engine (Tesseract.js / PDF-Parse)"]
        Extractor["Clinical Entity Recognizer (Labs, Meds, Ranges)"]
        SafetyEngine["Clinical Safety & Guardrail Validator"]
        Summarizer["Grounded Summarizer (Gemini / Claude / Template)"]
        Translator["Telugu Medical Translator"]
    end

    subgraph Data ["Persistence Layer (PostgreSQL + Prisma)"]
        DB_Users[("Users & Patient Profiles")]
        DB_Docs[("Medical Documents")]
        DB_Fields[("Extracted Fields & Snippets")]
        DB_Labs[("Lab Observations (FHIR)")]
        DB_Meds[("Medications (FHIR)")]
        DB_Timeline[("Timeline Events")]
    end

    %% Client to Server
    UI_Upload -->|POST /api/reports/upload| Router
    UI_Detail -->|GET /api/reports/:id| Router
    UI_Summary -->|POST /api/reports/:id/analyze| Router
    UI_Timeline -->|GET /api/timeline| Router

    %% Server Internal Routing
    Router --> AuthService
    Router --> UploadHandler
    Router --> DocController
    Router --> SummaryController

    %% Pipeline Flow
    DocController --> OCR
    OCR --> Extractor
    Extractor --> SafetyEngine
    SafetyEngine --> Summarizer
    Summarizer --> Translator

    %% Persistence
    AuthService --> DB_Users
    DocController --> DB_Docs
    Extractor --> DB_Fields
    Extractor --> DB_Labs
    Extractor --> DB_Meds
    SummaryController --> DB_Timeline
```

---

## 3. Core Workflow Architecture

1. **Upload & Sanitation**:
   - The user selects a medical PDF or PNG/JPG image.
   - Client performs MIME and size validation before payload dispatch.
   - Express server checks authorization, verifies content magic-bytes, and writes the file to a secure, unindexed storage volume.
2. **Text Parsing & OCR**:
   - PDF files are parsed directly via stream text extraction; scanned images or embedded bitmaps trigger Tesseract OCR.
   - Text is normalized into numbered line tokens with confidence scores.
3. **Traceable Extraction & Grounding**:
   - Regex and clinical entity extractors parse test parameters, numerical outputs, metric units, and laboratory reference ranges.
   - Every single extracted attribute retains the exact string snippet and character span of its source line in the document.
4. **Safety Verification & Plain-Language Explanation**:
   - Pre-summary filter confirms no prescriptive actions or hallucinated diagnoses exist.
   - Summarizer produces patient-accessible explanations and key clinical observations.
   - Telugu translation provides vernacular accessibility while retaining original units and measurements.
5. **Interactive Review & Persistence**:
   - The user reviews extracted values side-by-side with source snippets.
   - Confirmed records generate longitudinal FHIR-aligned observations (`LabObservation`, `MedicationRecord`, `TimelineEvent`).
