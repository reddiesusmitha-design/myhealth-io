-- MyHealthIO - PostgreSQL Relational Schema
-- Aligned with FHIR resources (Patient, DocumentReference, Observation, DiagnosticReport, MedicationStatement)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patient Profile (FHIR Patient resource equivalent)
CREATE TABLE IF NOT EXISTS patient_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mock_abha_id VARCHAR(32) UNIQUE NOT NULL, -- e.g. ABHA-91-8842-1092-4412
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    emergency_contact VARCHAR(100),
    preferred_language VARCHAR(10) DEFAULT 'en', -- 'en' | 'te'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Medical Documents (FHIR DocumentReference / DiagnosticReport)
CREATE TABLE IF NOT EXISTS medical_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    document_type VARCHAR(50) DEFAULT 'LAB_REPORT', -- LAB_REPORT, PRESCRIPTION, DISCHARGE_SUMMARY
    document_date DATE,
    extracted_raw_text TEXT,
    processing_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
    ocr_confidence NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Extracted Clinical Fields (Traceable with source offsets & confidence)
CREATE TABLE IF NOT EXISTS extracted_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES medical_documents(id) ON DELETE CASCADE,
    field_category VARCHAR(50) NOT NULL, -- LAB_RESULT, MEDICATION, DIAGNOSIS, VITAL, PATIENT_INFO
    field_key VARCHAR(100) NOT NULL,
    field_value TEXT NOT NULL,
    confidence_score NUMERIC(5,2) NOT NULL,
    is_uncertain BOOLEAN DEFAULT FALSE,
    uncertainty_reason TEXT,
    source_snippet TEXT NOT NULL,
    is_user_reviewed BOOLEAN DEFAULT FALSE,
    user_override_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Lab Observations (FHIR Observation resource)
CREATE TABLE IF NOT EXISTS lab_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES medical_documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_name VARCHAR(150) NOT NULL,
    value_numeric NUMERIC(10,2),
    value_string VARCHAR(100),
    unit VARCHAR(50),
    reference_low NUMERIC(10,2),
    reference_high NUMERIC(10,2),
    reference_text VARCHAR(100),
    interpretation VARCHAR(50), -- NORMAL, HIGH, LOW, ABNORMAL, UNCERTAIN
    observation_date DATE,
    source_snippet TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Medication Records (FHIR MedicationStatement)
CREATE TABLE IF NOT EXISTS medication_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES medical_documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    route VARCHAR(50),
    instructions TEXT,
    source_snippet TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Health Summaries (Plain Language AI summaries with Telugu translation)
CREATE TABLE IF NOT EXISTS health_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID UNIQUE NOT NULL REFERENCES medical_documents(id) ON DELETE CASCADE,
    summary_en TEXT NOT NULL,
    summary_te TEXT,
    key_findings JSONB DEFAULT '[]'::jsonb,
    ai_provider VARCHAR(50) NOT NULL, -- 'gemini' | 'openai' | 'template'
    disclaimer_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Longitudinal Health Timeline Events
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES medical_documents(id) ON DELETE SET NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- LAB_REPORT, PRESCRIPTION, CLINICAL_VISIT, IMMUNIZATION
    title VARCHAR(200) NOT NULL,
    summary_preview TEXT,
    severity_level VARCHAR(20) DEFAULT 'INFO', -- INFO, ATTENTION, NORMAL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Audit Events
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- LOGIN, UPLOAD, VIEW, EDIT_FIELD, DELETE_REPORT
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal querying and multi-tenant security
CREATE INDEX IF NOT EXISTS idx_medical_docs_user ON medical_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_extracted_fields_doc ON extracted_fields(document_id);
CREATE INDEX IF NOT EXISTS idx_lab_obs_user ON lab_observations(user_id);
CREATE INDEX IF NOT EXISTS idx_med_records_user ON medication_records(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_user_date ON timeline_events(user_id, event_date DESC);
