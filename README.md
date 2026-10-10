# MyHealthIO — AI-Powered Personal Health Copilot

> **Your Personal Health Copilot**
> Organize medical records and understand extracted health information through plain-language English and Telugu summaries, while keeping medical information accurate, traceable, and safe.

---

## 🌟 Hackathon Project Overview

**MyHealthIO** bridges the gap between dense, fragmented medical documents and patient comprehension. It extracts structured clinical data from lab reports, prescriptions, and discharge summaries with evidence-backed source snippets and safety boundaries.

### Key Capabilities:
- **Smart Document Ingestion**: Supports PDF, PNG, and JPG medical reports with content verification.
- **Traceable Clinical Extraction**: Identifies lab observations, medications, dosages, reference metrics, and diagnoses—anchored directly to original text snippets.
- **Explainable Health Copilot**: Plain-language summaries in English and optional Telugu without fabricating medical diagnoses or advising medication alterations.
- **Chronological Health Timeline**: Unified longitudinal view of patient health events, lab metrics, and medication regimens.
- **FHIR & ABDM Readiness**: Data models designed aligned with FHIR standards (`Patient`, `Observation`, `DiagnosticReport`, `DocumentReference`) and mock ABHA identifiers.

---

## 🏗️ Repository Structure

```
MyHealthIO/
├── frontend/             # React + Vite + TypeScript + Tailwind CSS
├── backend/              # Node.js + Express + TypeScript + Prisma ORM
├── database/             # PostgreSQL schema, seed data, and documentation
├── ai-ml/                # OCR, structured extractor, summarizer, translator, and safety pipeline
├── tests/                # Integration tests, E2E tests, and test plan
├── docs/                 # Architecture, DB design, API spec, security, and demo script
├── .github/workflows/    # CI/CD pipeline
├── README.md
├── .gitignore
└── .env.example
```

---

## 🚀 Quick Start (Development)

See individual module READMEs and documentation for step-by-step setup guides:
- [Architecture & Design](file:///c:/Users/KIRAN/Desktop/MyHealthIO/docs/architecture.md)
- [API Documentation](file:///c:/Users/KIRAN/Desktop/MyHealthIO/docs/api.md)
- [Database Design](file:///c:/Users/KIRAN/Desktop/MyHealthIO/docs/database-design.md)
- [Security Architecture](file:///c:/Users/KIRAN/Desktop/MyHealthIO/docs/security.md)
- [Demo Script](file:///c:/Users/KIRAN/Desktop/MyHealthIO/docs/demo-script.md)

---

## 🔒 Medical & Security Disclaimer
MyHealthIO is an informational prototype developed for hackathon demonstration purposes. It does not provide medical diagnoses, treatment suggestions, or prescriptive healthcare advice. Always consult a qualified medical professional for health decisions.
